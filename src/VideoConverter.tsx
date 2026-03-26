import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaFileVideo,
  FaFolderOpen,
  FaLayerGroup,
  FaPlus,
} from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";
import ConfigurationSidebar from "./Components/ConfigurationSidebar";
import ProgressBar from "./Components/ProgressBar";
import * as C from "./VideoConverterStyle";

type FileWithPath = File & { path: string };

type VideoItem = {
  file: FileWithPath;
  path: string;
  name: string;
  converting: boolean;
  converted: boolean;
  thumbnail?: string | null;
};

interface VideoConverterProps {
  cpuCores: number;
  openFolder: boolean;
  useHardwareAcceleration: boolean;
}

type VideoAction =
  | { type: "ADD_VIDEOS"; videos: VideoItem[] }
  | { type: "UPDATE_THUMBNAIL"; path: string; thumbnail: string | null }
  | { type: "START_CONVERSION"; path: string }
  | { type: "COMPLETE_CONVERSION"; path: string }
  | { type: "REMOVE_VIDEO"; index: number };

const videoReducer = (state: VideoItem[], action: VideoAction): VideoItem[] => {
  switch (action.type) {
    case "ADD_VIDEOS":
      return [...state, ...action.videos];
    case "UPDATE_THUMBNAIL":
      return state.map((video) =>
        video.path === action.path
          ? { ...video, thumbnail: action.thumbnail }
          : video
      );
    case "START_CONVERSION":
      return state.map((video) =>
        video.path === action.path ? { ...video, converting: true } : video
      );
    case "COMPLETE_CONVERSION":
      return state.map((video) =>
        video.path === action.path
          ? { ...video, converting: false, converted: true }
          : video
      );
    case "REMOVE_VIDEO": {
      const removed = state[action.index];

      if (removed?.thumbnail) {
        window.electronAPI.deleteFile?.(removed.thumbnail);
      }

      return state.filter((_, index) => index !== action.index);
    }
    default:
      return state;
  }
};

interface VideoItemProps {
  video: VideoItem;
  index: number;
  progressPercent?: number;
  onRemove: (index: number) => void;
}

const VideoItemComponent: React.FC<VideoItemProps> = ({
  video,
  index,
  progressPercent,
  onRemove,
}) => {
  const extension = video.name.includes(".")
    ? video.name.split(".").pop()?.toUpperCase()
    : "VIDEO";

  const status = video.converted
    ? { label: "Concluido", tone: "success" as const, icon: <FaCheckCircle /> }
    : video.converting
      ? { label: "Convertendo", tone: "accent" as const, icon: <FaLayerGroup /> }
      : { label: "Na fila", tone: "neutral" as const, icon: <FaClock /> };

  return (
    <C.VideoItemStyled
      $isConverting={video.converting}
      $isActive={typeof progressPercent === "number"}
    >
      <C.LeftSide>
        <C.ThumbFrame>
          {video.thumbnail ? (
            <img src={`file://${video.thumbnail}`} alt="Thumbnail" />
          ) : video.thumbnail === undefined ? (
            <div className="loading">Gerando capa...</div>
          ) : (
            <div className="fallback">
              <FaFileVideo size={28} />
            </div>
          )}
        </C.ThumbFrame>

        <div className="videoInfos">
          <div className="titleRow">
            <span className="videoname" title={video.name}>
              {video.name}
            </span>
            <C.StatusBadge $tone={status.tone}>
              {status.icon}
              {status.label}
            </C.StatusBadge>
          </div>

          <C.MetaRow>
            <span>{extension}</span>
            {typeof progressPercent === "number" && <span>{progressPercent}%</span>}
            <span className="path" title={video.path}>
              {video.path}
            </span>
          </C.MetaRow>

          {typeof progressPercent === "number" && (
            <C.InlineProgressTrack>
              <C.InlineProgressValue style={{ width: `${progressPercent}%` }} />
            </C.InlineProgressTrack>
          )}
        </div>
      </C.LeftSide>

      <C.RightSide>
        <C.IconButton onClick={() => onRemove(index)} title="Remover video">
          <VscChromeClose />
        </C.IconButton>
      </C.RightSide>
    </C.VideoItemStyled>
  );
};

function VideoConverter({
  cpuCores,
  openFolder,
  useHardwareAcceleration,
}: VideoConverterProps) {
  const [format, setFormat] = useState<string>("mp4");
  const [quality, setQuality] = useState<string>("original");
  const [speed, setSpeed] = useState<string>("medium");
  const [outputFolder, setOutputFolder] = useState<string>("");

  const [videosToConvert, dispatchVideos] = useReducer(videoReducer, []);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<{
    file: string;
    percent: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { onProgress, onConversionStarted, onConversionCompleted } =
      window.electronAPI;

    onProgress?.((data) => setProgress(data));
    onConversionStarted?.((data) =>
      dispatchVideos({ type: "START_CONVERSION", path: data.file })
    );
    onConversionCompleted?.((data) =>
      dispatchVideos({ type: "COMPLETE_CONVERSION", path: data.file })
    );
  }, []);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const generateThumbnailsSequentially = async (videos: VideoItem[]) => {
    for (const video of videos) {
      try {
        const thumbnail = await window.electronAPI.generateThumbnail(video.path);
        dispatchVideos({
          type: "UPDATE_THUMBNAIL",
          path: video.path,
          thumbnail,
        });
      } catch (err) {
        console.error(`Failed to generate thumbnail for ${video.path}:`, err);
        dispatchVideos({
          type: "UPDATE_THUMBNAIL",
          path: video.path,
          thumbnail: null,
        });
      }
    }
  };

  const buildVideoItems = (files: FileList | File[]) =>
    Array.from(files).map((file) => ({
      file: file as FileWithPath,
      path: (file as FileWithPath).path,
      name: file.name,
      converting: false,
      converted: false,
      thumbnail: undefined,
    }));

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = buildVideoItems(files);
    dispatchVideos({ type: "ADD_VIDEOS", videos: fileArray });
    void generateThumbnailsSequentially(fileArray);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = buildVideoItems(event.dataTransfer.files);
    dispatchVideos({ type: "ADD_VIDEOS", videos: droppedFiles });
    void generateThumbnailsSequentially(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleConvert = async () => {
    if (videosToConvert.length === 0) return;

    try {
      await window.electronAPI.convertVideos({
        files: videosToConvert.map((video) => video.path),
        format,
        quality,
        speed,
        openFolder,
        outputFolder,
        cpuCores,
        useHardwareAcceleration,
      });
      setProgress(null);
    } catch (err) {
      alert("Erro na conversao: " + err);
    }
  };

  const convertedCount = videosToConvert.filter((video) => video.converted).length;
  const convertingCount = videosToConvert.filter((video) => video.converting).length;
  const pendingCount =
    videosToConvert.length - convertedCount - convertingCount;
  const canConvert = videosToConvert.length > 0 && convertingCount === 0;

  return (
    <C.Container>
      <C.Header>
        {/* <C.HeaderCopy>
          <span className="eyebrow">Workspace</span>
          <h1>Fila de conversao</h1>
          <p>
            Organize lotes, ajuste a exportacao e acompanhe cada arquivo em um
            fluxo mais claro.
          </p>
        </C.HeaderCopy> */}

        <C.HeaderMetrics>
          <C.StatCard>
            <span>Total</span>
            <strong>{videosToConvert.length}</strong>
          </C.StatCard>
          <C.StatCard>
            <span>Pendentes</span>
            <strong>{pendingCount}</strong>
          </C.StatCard>
          <C.StatCard $tone="success">
            <span>Concluidos</span>
            <strong>{convertedCount}</strong>
          </C.StatCard>
        </C.HeaderMetrics>

        <C.HeaderActions>
          <C.Button onClick={handleAddClick}>
            <FaPlus />
            Adicionar videos
          </C.Button>
          <C.ButtonPrimary onClick={handleConvert} disabled={!canConvert}>
            {convertingCount > 0 ? "Convertendo..." : "Iniciar conversao"}
          </C.ButtonPrimary>
        </C.HeaderActions>
      </C.Header>

      <input
        type="file"
        multiple
        accept="video/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFilesSelected}
      />

      <C.MainContent>
        <C.VideosContainer
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          $isDragging={isDragging}
        >
          <C.QueueToolbar>
            <div>
              <span className="label">Lote atual</span>
              <h2>Arquivos selecionados</h2>
            </div>
            <C.QueueHint $active={isDragging}>
              {isDragging
                ? "Solte os arquivos para adicionar ao lote"
                : "Arraste novos videos para esta area"}
            </C.QueueHint>
          </C.QueueToolbar>

          {videosToConvert.length === 0 ? (
            <C.EmptyState>
              <div className="emptyCard">
                <div className="iconWrap">
                  <FaFolderOpen size={28} />
                </div>
                <h3>Seu lote comeca aqui</h3>
                <p>
                  Arraste videos para esta area ou selecione arquivos manualmente
                  para montar a fila.
                </p>
                <C.ButtonPrimary onClick={handleAddClick}>
                  Escolher videos
                </C.ButtonPrimary>
              </div>
            </C.EmptyState>
          ) : (
            <C.VideosList>
              {videosToConvert.map((video, index) => (
                <VideoItemComponent
                  key={`${video.path}-${index}`}
                  video={video}
                  index={index}
                  progressPercent={
                    progress?.file === video.path ? progress.percent : undefined
                  }
                  onRemove={(itemIndex) =>
                    dispatchVideos({ type: "REMOVE_VIDEO", index: itemIndex })
                  }
                />
              ))}
            </C.VideosList>
          )}
        </C.VideosContainer>

        <ConfigurationSidebar
          format={format}
          setFormat={setFormat}
          quality={quality}
          setQuality={setQuality}
          speed={speed}
          setSpeed={setSpeed}
          outputFolder={outputFolder}
          setOutputFolder={setOutputFolder}
        />
      </C.MainContent>

      {progress && <ProgressBar progress={progress} />}
    </C.Container>
  );
}

export default VideoConverter;
