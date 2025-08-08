import React, { useState } from "react";
import styled from "styled-components";
import { MdArrowRight } from "react-icons/md"; // Corrigido

export interface ConfigurationSidebarProps {
  isSection1Open: boolean;
  setIsSection1Open: React.Dispatch<React.SetStateAction<boolean>>;
  isSection2Open: boolean;
  setIsSection2Open: React.Dispatch<React.SetStateAction<boolean>>;

  format: string;
  setFormat: React.Dispatch<React.SetStateAction<string>>;

  quality: string;
  setQuality: React.Dispatch<React.SetStateAction<string>>;

  speed: string;
  setSpeed: React.Dispatch<React.SetStateAction<string>>;

  cpuCores: number;
  setCpuCores: React.Dispatch<React.SetStateAction<number>>;
  maxCpuCores: number;

  outputFolder: string;
  setOutputFolder: React.Dispatch<React.SetStateAction<string>>;

  openFolder: boolean;
  setOpenFolder: React.Dispatch<React.SetStateAction<boolean>>;

  useHardwareAcceleration: boolean;
  setUseHardwareAcceleration: React.Dispatch<React.SetStateAction<boolean>>;
}

function ConfigurationSidebar({
  format,
  setFormat,
  quality,
  setQuality,
  speed,
  setSpeed,
  cpuCores,
  setCpuCores,
  maxCpuCores,
  outputFolder,
  setOutputFolder,
  openFolder,
  setOpenFolder,
  useHardwareAcceleration,
  setUseHardwareAcceleration,
}: ConfigurationSidebarProps) {
  const [isSection1Open, setIsSection1Open] = useState(true);
  const [isSection2Open, setIsSection2Open] = useState(true);

  return (
    <Sidebar>
      {/* Video Settings */}
      <ConfigSection isOpen={isSection2Open}>
        <ConfigType onClick={() => setIsSection2Open((prev) => !prev)}>
          <h2>Video Settings</h2>
          <MdArrowRight size={25} />
        </ConfigType>
        {isSection2Open && (
          <SectionContent isOpen={isSection2Open}>
            <FormGroup>
              <div
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <Button
                  onClick={async () => {
                    const folder =
                      await window.electronAPI?.selectOutputFolder();
                    if (folder) setOutputFolder(folder);
                  }}
                >
                  Selecionar Pasta de saída
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
                {" "}
                <option value="original">Original</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="speedBasic">Velocidade de codificação:</Label>
              <Select
                id="speedBasic"
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
          </SectionContent>
        )}
      </ConfigSection>

    

    </Sidebar>
  );
}

export default ConfigurationSidebar;

// Styled Components
const Sidebar = styled.div`
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
  max-height: ${({ isOpen }) => (isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #383838;
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

const Label = styled.label`
  font-size: 14px;
  color: #ddd;
`;

const Button = styled.button`
  background-color: #562383;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #9d4edd;
  }
`;
