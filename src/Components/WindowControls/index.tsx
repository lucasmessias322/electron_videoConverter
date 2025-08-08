import React, { useState } from "react";
import styled from "styled-components";
import { IoMdSettings } from "react-icons/io";
import {
  VscChromeMinimize,
  VscChromeClose,
  VscChromeMaximize,
} from "react-icons/vsc";
import convertHeroLogo from "/convertHero.ico";
import { ConfigurationSidebarProps } from "../ConfigurationSidebar/index";

function WindowControls({
  useHardwareAcceleration,
  setUseHardwareAcceleration,
  cpuCores,
  setCpuCores,
  maxCpuCores,
  openFolder,
  setOpenFolder,
}: ConfigurationSidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "geral" | "interface" | "avancado"
  >("geral");

  const handleWindowAction = (action: "minimize" | "maximize" | "close") => {
    window.electronAPI?.windowControl?.(action);
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  return (
    <>
      <Wrapper>
        <Left>
          <Title>
            <img src={convertHeroLogo} alt="ConvertHero Logo" />
            ConvertHero
          </Title>
        </Left>
        <Right>
          <div className="container">
            <IconButton onClick={toggleSettings} title="Configurações">
              <IoMdSettings size={18} />
            </IconButton>
          </div>

          <div className="container">
            <IconButton
              onClick={() => handleWindowAction("minimize")}
              title="Minimizar"
            >
              <VscChromeMinimize size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleWindowAction("maximize")}
              title="Maximizar/Restaurar"
            >
              <VscChromeMaximize size={16} />
            </IconButton>
            <IconButton
              onClick={() => handleWindowAction("close")}
              title="Fechar"
            >
              <VscChromeClose size={16} />
            </IconButton>
          </div>
        </Right>
      </Wrapper>

      {showSettings && (
        <SettingsOverlay>
          <SettingsPanel>
            <CloseSettingsButton
              onClick={() => setShowSettings(false)}
              title="Fechar configurações"
            >
              <VscChromeClose size={18} />
            </CloseSettingsButton>
            <SettingsSidebar>
              <SidebarItem
                onClick={() => setActiveTab("geral")}
                $active={activeTab === "geral"}
              >
                Geral
              </SidebarItem>
              <SidebarItem
                onClick={() => setActiveTab("interface")}
                $active={activeTab === "interface"}
              >
                Interface
              </SidebarItem>
              <SidebarItem
                onClick={() => setActiveTab("avancado")}
                $active={activeTab === "avancado"}
              >
                Avançado
              </SidebarItem>
            </SettingsSidebar>

            <SettingsContent>
              {activeTab === "geral" && (
                <>
                  <h2>Configurações Gerais</h2>
                  <FormGroup>
                    <CheckboxContainer>
                      <input
                        type="checkbox"
                        id="openFolderCheckbox"
                        checked={openFolder}
                        onChange={() => setOpenFolder((prev) => !prev)}
                      />
                      <Label htmlFor="openFolderCheckbox">
                        Abrir pasta após conversão
                      </Label>
                    </CheckboxContainer>
                  </FormGroup>
                </>
              )}
              {activeTab === "interface" && (
                <>
                  <h2>Configurações de Interface</h2>
                  <p>Personalize o tema, layout e aparência da interface.</p>
                </>
              )}
              {activeTab === "avancado" && (
                <>
                  <h2>Configurações Avançadas</h2>
                  <FormGroup>
                    <Label htmlFor="cpuCoresBasic">
                      Uso de núcleos da CPU:
                    </Label>
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
                        checked={useHardwareAcceleration} // ← controle direto via estado
                        onChange={(e) =>
                          setUseHardwareAcceleration(e.target.checked)
                        }
                      />
                      <Label htmlFor="hardwareAcceleration">
                        Usar Aceleração de hardware
                      </Label>
                    </CheckboxContainer>
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
  padding: 10px 0px;
  border-bottom: 2px solid #181818;
  -webkit-app-region: drag;
  user-select: none;
  height: 50px;
`;

const Left = styled.div`
  flex: 1;
`;

const Right = styled.div`
  display: flex;
  -webkit-app-region: no-drag;

  .container {
    gap: 10px;
    display: flex;
    align-items: center;
    background-color: #2a2a2a;
    border-radius: 5px;
    margin: 5px;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;

  &:hover {
    background-color: #8400ff;
  }
`;

const Title = styled.h1`
  font-size: 16px;
  padding: 10px;
  color: #fff;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 5px;

  img {
    width: 35px;
    object-fit: contain;
  }
`;

// Configurações

const SettingsOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 999;
  background-color: #000000dc;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SettingsPanel = styled.div`
  width: 80%;
  height: 80%;
  background-color: #202020;
  border-radius: 10px;
  display: flex;
  overflow: hidden;
`;

const SettingsSidebar = styled.div`
  width: 200px;
  background-color: #1a1a1a;
  padding: 20px;
  border-right: 1px solid #444;
  color: #ccc;

  p {
    margin-bottom: 10px;
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
`;

const SettingsContent = styled.div`
  flex: 1;
  padding: 20px;
  color: #fff;

  h2 {
    margin-bottom: 10px;
  }
`;

const CloseSettingsButton = styled.button`
  position: absolute;
  top: 15px;
  right: 20px;
  background: transparent;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 5px;
  z-index: 1;
  -webkit-app-region: no-drag;

  &:hover {
    color: #fff;
    background-color: #333;
    border-radius: 4px;
  }
`;
const SidebarItem = styled.p<{ $active: boolean }>`
  margin-bottom: 10px;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#fff" : "#ccc")};
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};

  &:hover {
    color: #fff;
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
