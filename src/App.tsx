import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FaFileVideo } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";
import WindowControls from "./Components/WindowControls";
import ConfigurationSidebar from "./Components/ConfigurationSidebar";
type VideoItem = {
  file: File;
  converted: boolean;
};
function App() {
  const [isSection1Open, setIsSection1Open] = useState(true);
  const [isSection2Open, setIsSection2Open] = useState(true);

  const [outputFolder, setOutputFolder] = useState<string>("");

  // Estados das configs básicas
  const [openFolder, setOpenFolder] = useState<boolean>(false);
  const [cpuCores, setCpuCores] = useState<number>(1);

  // Estados das configs de vídeo
  const [format, setFormat] = useState<string>("mp4");
  const [quality, setQuality] = useState<string>("1080p");
  const [speed, setSpeed] = useState<string>("medium");
  const [useHardwareAcceleration, setUseHardwareAcceleration] =
    useState<boolean>(false);

  // Lista de vídeos

  const [videosToConvert, setVideosToConvert] = useState<VideoItem[]>([]);

  // Ref para o input de arquivos oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para controlar o drag-over e alterar o estilo
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<{
    file: string;
    percent: number;
  } | null>(null);

  // Quando o usuário clica em "Add Videos"
  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setVideosToConvert((prev) => [...prev, ...fileArray]);
    e.target.value = ""; // Permite selecionar o mesmo arquivo novamente
  };

  // Drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setVideosToConvert((prev) => [...prev, ...droppedFiles]);
  };

  // Remover vídeo da lista
  const handleRemoveVideo = (index: number) => {
    setVideosToConvert((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (videosToConvert.length === 0) return;

    const filePaths = videosToConvert.map((file) => (file as any).path);

    try {
      await window.electronAPI.convertVideos({
        files: filePaths,
        format,
        quality,
        speed,
        openFolder,
        outputFolder,
        cpuCores,
        useHardwareAcceleration, // ← novo
      });
      alert("Conversão concluída!");
    } catch (err) {
      alert("Erro na conversão: " + err);
    }
  };

  useEffect(() => {
    console.log("electronAPI", window.electronAPI);
    if (window.electronAPI?.onProgress) {
      window.electronAPI.onProgress((data) => {
        setProgress(data);
      });
    } else {
      console.warn("onProgress não está definido em electronAPI!");
    }
  }, []);

  const [maxCpuCores, setMaxCpuCores] = useState<number>(8); // default

  useEffect(() => {
    const fetchCpuCores = async () => {
      try {
        const cores = await window.electronAPI.getCpuCores();
        setMaxCpuCores(cores);
        setCpuCores(Math.min(cores, 4)); // sugestão inicial
      } catch (err) {
        console.error("Erro ao obter núcleos da CPU:", err);
      }
    };

    fetchCpuCores();
  }, []);

  return (
    <Container>
      <WindowControls></WindowControls>
      <Header>
        <div className="Left"></div>
        {/* <Title>ConvertHero</Title> */}
        <div className="header-buttons">
          <Button onClick={handleAddClick}>Add Videos</Button>
          <ButtonPrimary onClick={handleConvert}>Convert</ButtonPrimary>
        </div>
      </Header>

      {/* Input oculto para seleção via clique */}
      <input
        type="file"
        multiple
        accept="video/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFilesSelected}
      />

      <MainContent>
        <VideosContainer
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          isDragging={isDragging}
        >
          {videosToConvert.length === 0 ? (
            <EmptyState>
              <p>Arraste vídeos ou clique em "Add Videos" para começar!</p>
            </EmptyState>
          ) : (
            <VideosList>
              {videosToConvert.map((video, idx) => (
                <VideoItem key={idx}>
                  <LeftSide>
                    <div className="VideoThumb">
                      <FaFileVideo size={28} color="#7b2cbf" />
                    </div>

                    <div className="videoInfos">
                      <span className="videoname">{video.name}</span>
                    </div>
                  </LeftSide>
                  <RightSide>
                    <IconButton onClick={() => handleRemoveVideo(idx)}>
                      <VscChromeClose />
                    </IconButton>
                  </RightSide>
                </VideoItem>
              ))}
            </VideosList>
          )}
        </VideosContainer>

        <ConfigurationSidebar
          isSection1Open={isSection1Open}
          setIsSection1Open={setIsSection1Open}
          isSection2Open={isSection2Open}
          setIsSection2Open={setIsSection2Open}
          format={format}
          setFormat={setFormat}
          quality={quality}
          setQuality={setQuality}
          speed={speed}
          setSpeed={setSpeed}
          cpuCores={cpuCores}
          setCpuCores={setCpuCores}
          maxCpuCores={maxCpuCores}
          outputFolder={outputFolder}
          setOutputFolder={setOutputFolder}
          openFolder={openFolder}
          setOpenFolder={setOpenFolder}
          useHardwareAcceleration={useHardwareAcceleration}
          setUseHardwareAcceleration={setUseHardwareAcceleration}
        />
      </MainContent>
      {progress && (
        <ProgressContainer>
          <ProgressBar>
            <span>
              Converting: <strong>{progress.file.split(/[/\\]/).pop()}</strong>
            </span>
            <progress value={progress.percent} max={100}></progress>
            <span>{progress.percent}%</span>
          </ProgressBar>
        </ProgressContainer>
      )}
    </Container>
  );
}

export default App;

// Styled Components 🔥

interface VideosContainerProps {
  isDragging: boolean;
}

const Container = styled.div`
  background-color: #1a1a1a;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 👈 Previna scroll extra no body */
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #202020;
  padding: 20px 40px;
  border-bottom: 2px solid #181818;

  .header-buttons {
    display: flex;
    gap: 12px;
  }
`;

const Button = styled.button`
  background-color: #2e2e2e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;

  &:hover {
    background-color: #3d3d3d;
  }
`;

const ButtonPrimary = styled(Button)`
  background-color: #7b2cbf;

  &:hover {
    background-color: #9d4edd;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden; /* 👈 Impede que o conteúdo ultrapasse o tamanho da tela */
`;

const VideosContainer = styled.div<VideosContainerProps>`
  flex: 2;
  background-color: ${(props) => (props.isDragging ? "#2a2a2a" : "#202020")};
  border-right: 2px solid #181818;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 👈 Importante para limitar o conteúdo interno */
`;

const EmptyState = styled.div`
  flex: 1;
  text-align: center;
  opacity: 0.6;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VideosList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  flex: 1;
  overflow-y: auto; /* 👈 Scroll apenas aqui */
`;

const VideoItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid #383838;
  transition: background-color 0.2s;
  cursor: default;

  &:hover {
    background-color: #2a2a2a;
  }
`;

const LeftSide = styled.div`
  display: flex;

  align-items: center;
  gap: 12px;

  .videoInfos {
    .videoname {
      font-size: 15px;
      color: #e0e0e0;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 400px;
    }
  }
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #858585;
  transition: color 0.2s;
  padding: 4px;
  border-radius: 4px;
  font-size: 18px;

  &:hover {
    color: #7b2cbf;
  }

  svg {
    display: block;
  }
`;

const ProgressContainer = styled.div`
  background-color: #202020;
  padding: 16px 40px;
  border-top: 2px solid #181818;
  flex-shrink: 0; /* 👈 Isso impede que ele cresça e empurre o conteúdo */
`;

const ProgressBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  span {
    font-size: 14px;
    color: #a0a0a0;
  }

  progress {
    width: 100%;
    appearance: none;
    height: 2px;
    border-radius: 0px;
    overflow: hidden;

    &::-webkit-progress-bar {
      background-color: #2a2a2a;
      border-radius: 0px;
    }

    &::-webkit-progress-value {
      background-color: #8c00ff;
      border-radius: 0px;
    }

    &::-moz-progress-bar {
      background-color: #8c00ff;
      border-radius: 0px;
    }
  }
`;
