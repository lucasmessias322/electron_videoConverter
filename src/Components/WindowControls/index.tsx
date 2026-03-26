import { useState } from "react";
import styled from "styled-components";
import { IoMdSettings } from "react-icons/io";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
} from "react-icons/vsc";
import convertHeroLogo from "/convertHero.ico";

export interface WindowControlsProps {
  useHardwareAcceleration: boolean;
  setUseHardwareAcceleration: (value: boolean) => void;
  cpuCores: number;
  setCpuCores: (value: number) => void;
  maxCpuCores: number;
  openFolder: boolean;
  setOpenFolder: (value: boolean) => void;
}

function WindowControls({
  useHardwareAcceleration,
  setUseHardwareAcceleration,
  cpuCores,
  setCpuCores,
  maxCpuCores,
  openFolder,
  setOpenFolder,
}: WindowControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"geral" | "avancado">("geral");

  const handleWindowAction = (action: "minimize" | "maximize" | "close") => {
    window.electronAPI?.windowControl?.(action);
  };

  return (
    <>
      <Wrapper>
        <Left>
          <BrandBlock>
            <Title>
              <img src={convertHeroLogo} alt="ConvertHero Logo" />
              <div>
                <strong>ConvertHero</strong>
                <span>Batch video converter for creators</span>
              </div>
            </Title>
            <WorkspaceBadge>Messias studio</WorkspaceBadge>
          </BrandBlock>
        </Left>

        <Right>
          <ActionGroup>
            <IconButton
              onClick={() => setShowSettings((prev) => !prev)}
              title="Configuracoes"
            >
              <IoMdSettings size={18} />
            </IconButton>
          </ActionGroup>

          <ActionGroup>
            <IconButton
              onClick={() => handleWindowAction("minimize")}
              title="Minimizar"
            >
              <VscChromeMinimize size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleWindowAction("maximize")}
              title="Maximizar ou restaurar"
            >
              <VscChromeMaximize size={16} />
            </IconButton>
            <IconButton onClick={() => handleWindowAction("close")} title="Fechar">
              <VscChromeClose size={16} />
            </IconButton>
          </ActionGroup>
        </Right>
      </Wrapper>

      {showSettings && (
        <SettingsOverlay>
          <SettingsPanel>
            <CloseSettingsButton
              onClick={() => setShowSettings(false)}
              title="Fechar configuracoes"
            >
              <VscChromeClose size={18} />
            </CloseSettingsButton>

            <SettingsSidebar>
              <SidebarIntro>
                <span>Control center</span>
                <h2>Preferencias</h2>
                <p>
                  Ajuste o comportamento do app para combinar com o seu fluxo de
                  exportacao.
                </p>
              </SidebarIntro>

              <SidebarItem
                onClick={() => setActiveTab("geral")}
                $active={activeTab === "geral"}
              >
                Geral
              </SidebarItem>
              <SidebarItem
                onClick={() => setActiveTab("avancado")}
                $active={activeTab === "avancado"}
              >
                Avancado
              </SidebarItem>
            </SettingsSidebar>

            <SettingsContent>
              {activeTab === "geral" && (
                <>
                  <SectionHeader>
                    <span>Geral</span>
                    <h2>Configuracoes gerais</h2>
                    <p>
                      Defina o que o aplicativo faz automaticamente depois de
                      cada conversao.
                    </p>
                  </SectionHeader>

                  <FormGroup>
                    <CheckboxContainer>
                      <input
                        type="checkbox"
                        id="openFolderCheckbox"
                        checked={openFolder}
                        onChange={() => setOpenFolder(!openFolder)}
                      />
                      <Label htmlFor="openFolderCheckbox">
                        Abrir pasta apos a conversao
                      </Label>
                    </CheckboxContainer>
                    <FieldDescription>
                      Ative para revisar o arquivo final assim que o lote for
                      concluido.
                    </FieldDescription>
                  </FormGroup>
                </>
              )}

              {activeTab === "avancado" && (
                <>
                  <SectionHeader>
                    <span>Avancado</span>
                    <h2>Performance de codificacao</h2>
                    <p>
                      Equilibre velocidade, uso de CPU e suporte a aceleracao de
                      hardware.
                    </p>
                  </SectionHeader>

                  <FormGroup>
                    <FieldMeta>
                      <Label htmlFor="cpuCoresBasic">Uso de nucleos da CPU</Label>
                      <FieldDescription>
                        Limite quantos nucleos o app pode usar em paralelo.
                      </FieldDescription>
                    </FieldMeta>
                    <Select
                      id="cpuCoresBasic"
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
                        id="hardwareAcceleration"
                        checked={useHardwareAcceleration}
                        onChange={(e) =>
                          setUseHardwareAcceleration(e.target.checked)
                        }
                      />
                      <Label htmlFor="hardwareAcceleration">
                        Usar aceleracao de hardware
                      </Label>
                    </CheckboxContainer>
                    <FieldDescription>
                      Pode reduzir o tempo de exportacao em placas compativeis.
                    </FieldDescription>
                  </FormGroup>
                </>
              )}
            </SettingsContent>
          </SettingsPanel>
        </SettingsOverlay>
      )}
    </>
  );
}

export default WindowControls;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line-soft);
  background:
    radial-gradient(circle at left center, rgba(255, 123, 84, 0.12), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  -webkit-app-region: drag;
  user-select: none;
  min-height: 74px;
`;

const Left = styled.div`
  flex: 1;
  min-width: 0;
`;

const Right = styled.div`
  display: flex;
  gap: 10px;
  -webkit-app-region: no-drag;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
`;

const BrandBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const WorkspaceBadge = styled.span`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(78, 189, 255, 0.18);
  background: rgba(78, 189, 255, 0.1);
  color: #d9f3ff;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  @media (max-width: 840px) {
    display: none;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 10px;
  border-radius: 999px;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: rgba(255, 123, 84, 0.16);
    color: #ffffff;
    transform: translateY(-1px);
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  font-size: 16px;
  color: var(--text-main);

  img {
    width: 38px;
    object-fit: contain;
    filter: drop-shadow(0 10px 18px rgba(255, 123, 84, 0.24));
  }

  strong {
    display: block;
    font-size: 17px;
    font-weight: 700;
  }

  span {
    display: block;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SettingsOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 999;
  background: rgba(4, 9, 17, 0.76);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const SettingsPanel = styled.div`
  position: relative;
  width: min(980px, 100%);
  min-height: 620px;
  max-height: 100%;
  background: linear-gradient(
    180deg,
    rgba(18, 28, 44, 0.98),
    rgba(10, 17, 28, 0.98)
  );
  border: 1px solid var(--line-soft);
  border-radius: 32px;
  display: flex;
  overflow: hidden;
  box-shadow: var(--shadow-panel);

  @media (max-width: 900px) {
    flex-direction: column;
    min-height: 0;
  }
`;

const SettingsSidebar = styled.div`
  width: 280px;
  padding: 28px 20px;
  border-right: 1px solid var(--line-soft);
  background:
    radial-gradient(circle at top left, rgba(255, 123, 84, 0.14), transparent 34%),
    rgba(255, 255, 255, 0.03);
  color: var(--text-soft);

  @media (max-width: 900px) {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--line-soft);
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  padding: 34px 28px 28px;
  color: var(--text-main);
  overflow: auto;
`;

const CloseSettingsButton = styled.button`
  position: absolute;
  top: 18px;
  right: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  color: var(--text-soft);
  cursor: pointer;
  padding: 9px;
  z-index: 1;
  -webkit-app-region: no-drag;
  transition: background-color 0.2s ease;

  &:hover {
    color: #fff;
    background-color: rgba(255, 123, 84, 0.18);
  }
`;

const SidebarItem = styled.p<{ $active: boolean }>`
  margin-bottom: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#fff" : "var(--text-soft)")};
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  background: ${(props) =>
    props.$active ? "rgba(255, 123, 84, 0.14)" : "transparent"};
  border: 1px solid
    ${(props) =>
      props.$active ? "rgba(255, 123, 84, 0.2)" : "transparent"};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
    cursor: pointer;
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--line-soft);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 16px;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  min-width: 160px;

  &:focus {
    border-color: rgba(255, 123, 84, 0.55);
  }
`;

const SidebarIntro = styled.div`
  margin-bottom: 28px;

  span {
    display: inline-block;
    margin-bottom: 10px;
    color: var(--accent-cool);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin-bottom: 10px;
    color: var(--text-main);
    font-size: 24px;
  }

  p {
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1.6;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;

  span {
    display: inline-block;
    margin-bottom: 10px;
    color: var(--accent);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin-bottom: 10px;
    font-size: 28px;
  }

  p {
    max-width: 560px;
    color: var(--text-soft);
    line-height: 1.7;
    font-size: 14px;
  }
`;

const FieldMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldDescription = styled.span`
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
`;
