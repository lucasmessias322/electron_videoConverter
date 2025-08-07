import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FaFileVideo } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { MdArrowRight } from "react-icons/md";
import { VscChromeClose } from "react-icons/vsc";
import WindowControls from "./Components/WindowControls";
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
    //console.log(filePaths); // Certifique-se que não sejam undefined

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
                      <span className="videoname">{video.file.name}</span>
                      <CheckboxContainer>
                        <input type="checkbox" id="openFolder" checked={true} />
                        <Label htmlFor="openFolder">Converter</Label>
                      </CheckboxContainer>
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

        <ConfigurationSidebar>
          <ConfigSection>
            <ConfigType onClick={() => setIsSection2Open((prev) => !prev)}>
              <h2>Video Settings</h2>
              <MdArrowRight size={25} />
            </ConfigType>
            {isSection2Open && (
              <SectionContent isOpen={isSection2Open}>
                <FormGroup>
                  <Label htmlFor="format">Formato:</Label>
                  <Select
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="mp4">MP4</option>
                    <option value="mkv">MKV</option>
                    <option value="avi">AVI</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="quality">Qualidade:</Label>
                  <Select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                  >
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="speed">Velocidade de codificação:</Label>
                  <Select
                    id="speed"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                  >
                    <option value="ultrafast">ultrafast</option>
                    <option value="fast">fast</option>
                    <option value="medium">medium</option>
                    <option value="slow">slow</option>
                    <option value="veryslow">veryslow</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="cpuCores">Uso de núcleos da CPU:</Label>
                  <Select
                    id="cpuCores"
                    value={cpuCores}
                    onChange={(e) =>
                      setCpuCores(parseInt(e.target.value, 10) || 1)
                    }
                  >
                    {Array.from({ length: maxCpuCores }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    )}
                  </Select>
                </FormGroup>
              </SectionContent>
            )}
          </ConfigSection>
          <ConfigSection>
            <ConfigType onClick={() => setIsSection1Open((prev) => !prev)}>
              <h2>Basic Settings</h2>
              <MdArrowRight size={25} />
            </ConfigType>

            {isSection1Open && (
              <SectionContent isOpen={isSection1Open}>
                <FormGroup>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      onClick={async () => {
                        const folder =
                          await window.electronAPI.selectOutputFolder();
                        if (folder) setOutputFolder(folder);
                      }}
                    >
                      Pasta de saida
                    </Button>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {outputFolder || "Nenhuma pasta selecionada"}
                    </span>
                  </div>
                </FormGroup>
                <FormGroup>
                  <CheckboxContainer>
                    <input
                      type="checkbox"
                      id="openFolder"
                      checked={openFolder}
                      onChange={() => setOpenFolder((prev) => !prev)}
                    />
                    <Label htmlFor="openFolder">
                      Abrir pasta após conversão
                    </Label>
                  </CheckboxContainer>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="speed">Velocidade de codificação:</Label>
                  <Select
                    id="speed"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                  >
                    <option value="ultrafast">ultrafast</option>
                    <option value="fast">fast</option>
                    <option value="medium">medium</option>
                    <option value="slow">slow</option>
                    <option value="veryslow">veryslow</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="cpuCores">Uso de núcleos da CPU:</Label>
                  <Select
                    id="cpuCores"
                    value={cpuCores}
                    onChange={(e) =>
                      setCpuCores(parseInt(e.target.value, 10) || 1)
                    }
                  >
                    {Array.from({ length: maxCpuCores }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    )}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <CheckboxContainer>
                    <input
                      type="checkbox"
                      id="openFolder"
                      checked={useHardwareAcceleration}
                      onChange={() =>
                        setUseHardwareAcceleration((prev) => !prev)
                      }
                    />
                    <Label htmlFor="openFolder">
                      Usar Aceleraçao de hardware
                    </Label>
                  </CheckboxContainer>
                </FormGroup>
              </SectionContent>
            )}
          </ConfigSection>
        </ConfigurationSidebar>
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

const ConfigurationSidebar = styled.div`
  flex: 1;

  background-color: #202020;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const ConfigSection = styled.div<{ isOpen: boolean }>`
  margin-bottom: ${({ isOpen }) => (isOpen ? "24px" : "8px")};
  border-bottom: 2px solid #181818;
  display: flex;
  flex-direction: column;
  transition: margin-bottom 0.2s ease;
  // flex: 1;
`;

const ConfigType = styled.div`
  display: flex;
  align-items: center;
  background-color: #2a2a2a;
  padding: 16px;
  justify-content: space-between;
  border-bottom: 1px solid #181818;
  color: #969696;
  h2 {
    margin: 0;
    font-size: 16px;

    text-align: center;

    font-weight: normal;
  }
`;

const SectionContent = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  //overflow: auto;
  max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
  transition: max-height 0.3s ease;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #383838;
`;

const Label = styled.label`
  font-size: 14px;
  color: #ddd;
`;

const Select = styled.select`
  background-color: #2e2e2e;
  color: white;
  border: 0px;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  min-width: 100px;

  &:focus {
    border-color: #7b2cbf;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0px;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #7b2cbf;

    cursor: pointer;
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
