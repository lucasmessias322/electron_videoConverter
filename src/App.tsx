import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FaFileVideo } from "react-icons/fa";
import { VscChromeClose } from "react-icons/vsc";

import WindowControls from "./Components/WindowControls";
import ConfigurationSidebar from "./Components/ConfigurationSidebar";
import ProgressBar from "./Components/ProgressBar";

type VideoItem = {
  file: File;
  path: string;
  name: string;
  converting: boolean;
  converted: boolean;
};

function App() {
  // ⬇️ Configurações gerais
  const [format, setFormat] = useState<string>("mp4");
  const [quality, setQuality] = useState<string>("original");
  const [speed, setSpeed] = useState<string>("medium");
  const [cpuCores, setCpuCores] = useState<number>(1);
  const [maxCpuCores, setMaxCpuCores] = useState<number>(8);
  const [openFolder, setOpenFolder] = useState<boolean>(false);
  const [outputFolder, setOutputFolder] = useState<string>("");
  const [useHardwareAcceleration, setUseHardwareAcceleration] =
    useState<boolean>(false);

  // ⬇️ Estado de carregamento de configurações
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  // ⬇️ Lista de vídeos
  const [videosToConvert, setVideosToConvert] = useState<VideoItem[]>([]);

  // ⬇️ Drag and Drop
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ⬇️ Progresso de conversão
  const [progress, setProgress] = useState<{
    file: string;
    percent: number;
  } | null>(null);

  // ⬇️ Funções de manipulação de arquivos
  const handleAddClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).map((file) => ({
      file,
      path: (file as any).path,
      name: file.name,
      converting: false,
      converted: false,
    }));

    setVideosToConvert((prev) => [...prev, ...fileArray]);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).map((file) => ({
      file,
      path: (file as any).path,
      name: file.name,
      converting: false,
      converted: false,
    }));

    setVideosToConvert((prev) => [...prev, ...droppedFiles]);
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
    setVideosToConvert((prev) => prev.filter((_, i) => i !== index));
  };

  // ⬇️ Conversão
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
      // alert("Conversão concluída!");
      setProgress(null);
    } catch (err) {
      alert("Erro na conversão: " + err);
    }
  };

  // ⬇️ Comunicação com Electron (eventos)
  useEffect(() => {
    if (window.electronAPI?.onProgress) {
      window.electronAPI.onProgress((data) => setProgress(data));
    }

    if (window.electronAPI?.onConversionStarted) {
      window.electronAPI.onConversionStarted((data) => {
        setVideosToConvert((prev) =>
          prev.map((video) =>
            video.path === data.file ? { ...video, converting: true } : video
          )
        );
      });
    }

    if (window.electronAPI?.onConversionCompleted) {
      window.electronAPI.onConversionCompleted((data) => {
        setVideosToConvert((prev) =>
          prev.map((video) =>
            video.path === data.file
              ? { ...video, converting: false, converted: true }
              : video
          )
        );
      });
    }
  }, []);

  // ⬇️ Carregar núcleos da CPU
  useEffect(() => {
    const fetchCpuCores = async () => {
      try {
        const cores = await window.electronAPI.getCpuCores();
        setMaxCpuCores(cores);
        setCpuCores(Math.min(cores, 4));
      } catch (err) {
        console.error("Erro ao obter núcleos da CPU:", err);
      }
    };

    fetchCpuCores();
  }, []);

  // ⬇️ Carregando configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem("convertSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.useHardwareAcceleration !== undefined)
          setUseHardwareAcceleration(parsed.useHardwareAcceleration);
        if (parsed.format) setFormat(parsed.format);
        if (parsed.quality) setQuality(parsed.quality);
        if (parsed.speed) setSpeed(parsed.speed);
        if (parsed.openFolder !== undefined) setOpenFolder(parsed.openFolder);
        if (parsed.outputFolder) setOutputFolder(parsed.outputFolder);
        if (parsed.cpuCores) setCpuCores(parsed.cpuCores);
      } catch (err) {
        console.warn("Erro ao carregar configurações salvas:", err);
      }
    }

    setSettingsLoaded(true);
  }, []);

  // ⬇️ Salvar configurações no localStorage
  useEffect(() => {
    if (!settingsLoaded) return;

    const settings = {
      useHardwareAcceleration,
      format,
      quality,
      speed,
      openFolder,
      outputFolder,
      cpuCores,
    };
    localStorage.setItem("convertSettings", JSON.stringify(settings));
  }, [
    settingsLoaded,
    useHardwareAcceleration,
    format,
    quality,
    speed,
    openFolder,
    outputFolder,
    cpuCores,
  ]);

  return (
    <Container>
      <WindowControls />

      <Header>
        <div className="Left" />
        <div className="header-buttons">
          <Button onClick={handleAddClick}>Add Videos</Button>
          <ButtonPrimary onClick={handleConvert}>Convert</ButtonPrimary>
        </div>
      </Header>

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
                <VideoItem key={idx} isConverting={video.converting}>
                  <LeftSide>
                    <div className="VideoThumb">
                      <FaFileVideo size={28} color="#7b2cbf" />
                    </div>
                    <div className="videoInfos">
                      <span className="videoname">{video.name}</span>
                      {video.converting && <span> Convertendo...</span>}
                      {video.converted && <span>✅ Convertido</span>}
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

      {progress && <ProgressBar progress={progress} />}
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
  background-color: #181818;
`;

const VideoItem = styled.li<{ isConverting: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid #38383894;
  transition: background-color 0.2s;
  cursor: default;

  background-color: ${(props) =>
    props.isConverting ? "#1d1d1f" : "transparent"};

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
