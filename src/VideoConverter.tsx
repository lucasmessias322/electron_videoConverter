import React, { useEffect, useReducer, useRef, useState } from "react";
import { FaFileVideo } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";
import ConfigurationSidebar from "./Components/ConfigurationSidebar";
import ProgressBar from "./Components/ProgressBar";
import * as C from "./VideoConverterStyle";

// Define types centrally
type FileWithPath = File & { path: string };

type VideoItem = {
  file: FileWithPath;
  path: string;
  name: string;
  converting: boolean;
  converted: boolean;
  thumbnail?: string;
};

// Props interface for VideoConverter
interface VideoConverterProps {
  cpuCores: number;
  openFolder: boolean;
  useHardwareAcceleration: boolean;
}

// Reducer for video list
type VideoAction =
  | { type: "ADD_VIDEOS"; videos: VideoItem[] }
  | { type: "UPDATE_THUMBNAIL"; path: string; thumbnail: string | undefined }
  | { type: "START_CONVERSION"; path: string }
  | { type: "COMPLETE_CONVERSION"; path: string }
  | { type: "REMOVE_VIDEO"; index: number };

const videoReducer = (state: VideoItem[], action: VideoAction): VideoItem[] => {
  switch (action.type) {
    case "ADD_VIDEOS":
      return [...state, ...action.videos];
    case "UPDATE_THUMBNAIL":
      return state.map((v) =>
        v.path === action.path ? { ...v, thumbnail: action.thumbnail } : v
      );
    case "START_CONVERSION":
      return state.map((v) =>
        v.path === action.path ? { ...v, converting: true } : v
      );
    case "COMPLETE_CONVERSION":
      return state.map((v) =>
        v.path === action.path
          ? { ...v, converting: false, converted: true }
          : v
      );
    case "REMOVE_VIDEO":
      const removed = state[action.index];
      if (removed.thumbnail) {
        window.electronAPI.deleteFile?.(removed.thumbnail);
      }
      return state.filter((_, i) => i !== action.index);
    default:
      return state;
  }
};

// VideoItemComponent
interface VideoItemProps {
  video: VideoItem;
  index: number;
  onRemove: (index: number) => void;
}

const VideoItemComponent: React.FC<VideoItemProps> = ({
  video,
  index,
  onRemove,
}) => (
  <C.VideoItemStyled isConverting={video.converting}>
    <C.LeftSide>
      <div className="videoInfos">
        <div className="VideoThumb">
          {video.thumbnail ? (
            <img src={`file://${video.thumbnail}`} alt="Thumbnail" />
          ) : video.thumbnail === undefined ? (
            <div className="loading">Loading...</div>
          ) : (
            <FaFileVideo size={28} color="#7b2cbf" />
          )}
        </div>
        <span className="videoname">{video.name}</span>
        {video.converting && <span> Convertendo...</span>}
        {video.converted && <span>✅ Convertido</span>}
      </div>
    </C.LeftSide>
    <C.RightSide>
      <C.IconButton onClick={() => onRemove(index)}>
        <VscChromeClose />
      </C.IconButton>
    </C.RightSide>
  </C.VideoItemStyled>
);

function VideoConverter({
  cpuCores,
  openFolder,
  useHardwareAcceleration,
}: VideoConverterProps) {
  // Conversion settings
  const [format, setFormat] = useState<string>("mp4");
  const [quality, setQuality] = useState<string>("original");
  const [speed, setSpeed] = useState<string>("medium");
  const [outputFolder, setOutputFolder] = useState<string>("");

  // Video list with reducer
  const [videosToConvert, dispatchVideos] = useReducer(videoReducer, []);

  // Drag and drop
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress
  const [progress, setProgress] = useState<{
    file: string;
    percent: number;
  } | null>(null);

  // Electron IPC listeners
  useEffect(() => {
    const { onProgress, onConversionStarted, onConversionCompleted } =
      window.electronAPI;

    if (onProgress) {
      onProgress((data) => setProgress(data));
    }
    if (onConversionStarted) {
      onConversionStarted((data) =>
        dispatchVideos({ type: "START_CONVERSION", path: data.file })
      );
    }
    if (onConversionCompleted) {
      onConversionCompleted((data) =>
        dispatchVideos({ type: "COMPLETE_CONVERSION", path: data.file })
      );
    }
  }, []);

  const handleAddClick = () => fileInputRef.current?.click();

  const generateThumbnailsSequentially = async (videos: VideoItem[]) => {
    for (const video of videos) {
      try {
        const thumbnail = await window.electronAPI.generateThumbnail(
          video.path
        );
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
          thumbnail: undefined,
        });
      }
    }
  };

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray: VideoItem[] = Array.from(files).map((file) => ({
      file: file as FileWithPath,
      path: (file as any).path,
      name: file.name,
      converting: false,
      converted: false,
      thumbnail: undefined,
    }));

    dispatchVideos({ type: "ADD_VIDEOS", videos: fileArray });
    generateThumbnailsSequentially(fileArray);

    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles: VideoItem[] = Array.from(e.dataTransfer.files).map(
      (file) => ({
        file: file as FileWithPath,
        path: (file as any).path,
        name: file.name,
        converting: false,
        converted: false,
        thumbnail: undefined,
      })
    );

    dispatchVideos({ type: "ADD_VIDEOS", videos: droppedFiles });
    generateThumbnailsSequentially(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveVideo = (index: number) => {
    dispatchVideos({ type: "REMOVE_VIDEO", index });
  };

  const handleConvert = async () => {
    if (videosToConvert.length === 0) return;

    const filePaths = videosToConvert.map((video) => video.path);

    try {
      await window.electronAPI.convertVideos({
        files: filePaths,
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
      alert("Erro na conversão: " + err);
    }
  };

  return (
    <C.Container>
      <C.Header>
        <div className="Left" />
        <div className="header-buttons">
          <C.Button onClick={handleAddClick}>Add Videos</C.Button>
          <C.ButtonPrimary onClick={handleConvert}>Convert</C.ButtonPrimary>
        </div>
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
          isDragging={isDragging}
        >
          {videosToConvert.length === 0 ? (
            <C.EmptyState>
              <p>Arraste vídeos ou clique em "Add Videos" para começar!</p>
            </C.EmptyState>
          ) : (
            <C.VideosList>
              {videosToConvert.map((video, idx) => (
                <VideoItemComponent
                  key={idx}
                  video={video}
                  index={idx}
                  onRemove={handleRemoveVideo}
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
