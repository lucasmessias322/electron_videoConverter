import { useState } from "react";
import styled from "styled-components";
import { MdArrowRight } from "react-icons/md";

export interface ConfigurationSidebarProps {
  format: string;
  setFormat: React.Dispatch<React.SetStateAction<string>>;
  quality: string;
  setQuality: React.Dispatch<React.SetStateAction<string>>;
  speed: string;
  setSpeed: React.Dispatch<React.SetStateAction<string>>;
  outputFolder: string;
  setOutputFolder: React.Dispatch<React.SetStateAction<string>>;
}

function ConfigurationSidebar({
  format,
  setFormat,
  quality,
  setQuality,
  speed,
  setSpeed,
  outputFolder,
  setOutputFolder,
}: ConfigurationSidebarProps) {
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const selectedFolder = outputFolder || "Salvar no mesmo local dos arquivos";

  return (
    <Sidebar>
    

      <ConfigSection>
        <ConfigType onClick={() => setIsSectionOpen((prev) => !prev)}>
          <div>
            <small>Painel principal</small>
            <h3>Video settings</h3>
          </div>
          <ArrowIcon $isOpen={isSectionOpen}>
            <MdArrowRight size={25} />
          </ArrowIcon>
        </ConfigType>

        {isSectionOpen && (
          <SectionContent>
            <FormGroup>
              <FieldHeader>
                <div>
                  <Label>Pasta de saida</Label>
                  <Hint>
                    Escolha uma pasta fixa ou deixe vazio para usar a pasta
                    original.
                  </Hint>
                </div>
              </FieldHeader>
              <FolderRow>
                <Button
                  onClick={async () => {
                    const folder = await window.electronAPI?.selectOutputFolder();
                    if (folder) setOutputFolder(folder);
                  }}
                >
                  Selecionar pasta
                </Button>
                <FolderPath title={selectedFolder}>{selectedFolder}</FolderPath>
              </FolderRow>
            </FormGroup>

            <FormGroup>
              <FieldHeader>
                <Label htmlFor="format">Formato final</Label>
                <Hint>Compatibilidade do arquivo exportado.</Hint>
              </FieldHeader>
              <Select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="mp4">MP4</option>
                <option value="mkv">MKV</option>
                <option value="avi">AVI</option>
                <option value="mov">MOV</option>
                <option value="flv">FLV</option>
                <option value="mpeg">MPEG</option>
                <option value="webm">WebM</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <FieldHeader>
                <Label htmlFor="quality">Qualidade</Label>
                <Hint>Balanceie tamanho do arquivo e nitidez.</Hint>
              </FieldHeader>
              <Select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="original">Original</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <FieldHeader>
                <Label htmlFor="speedBasic">Velocidade de codificacao</Label>
                <Hint>Presets mais lentos priorizam compressao.</Hint>
              </FieldHeader>
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

const Sidebar = styled.div`
  width: 340px;
  min-width: 320px;
  min-height: 0;
  max-height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
 // padding: 0 28px 28px 0;
  overflow-y: auto;
 // overflow-x: hidden;
  overscroll-behavior: contain;

  @media (max-width: 980px) {
    width: 100%;
    min-width: 0;
    padding: 0 18px 18px;
  }
`;

const ConfigSection = styled.div`
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  display: flex;
  flex-direction: column;
 // overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  }
`;

const ConfigType = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-main);

  small {
    display: block;
    margin-bottom: 4px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 11px;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
`;

const ArrowIcon = styled.div<{ $isOpen: boolean }>`
  display: grid;
  place-items: center;
  color: var(--accent);
  transform: ${(props) => (props.$isOpen ? "rotate(90deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border-top: 1px solid var(--line-soft);
`;

const FieldHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FolderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FolderPath = styled.span`
  display: block;
  padding: 12px 14px;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-soft);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Select = styled.select`
  background: #121b2b;
  color: var(--text-main);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  padding: 13px 14px;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.2s,
    transform 0.2s,
    background 0.2s;
  min-width: 100px;

  &:focus {
    border-color: rgba(121, 84, 255, 0.6);
    background: #162338;
  }

  &:hover {
    transform: translateY(-1px);
    background: #162338;
  }

  option {
    background: #0d1522;
    color: var(--text-main);
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
`;

const Hint = styled.span`
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
`;

const Button = styled.button`
  width: fit-content;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: white;
  border: none;
  border-radius: 14px;
  padding: 11px 14px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(255, 123, 84, 0.24);
  }

  &:active {
    transform: translateY(0);
  }
`;
