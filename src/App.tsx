// App.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import VideoConverter from "./VIdeoConverter";
import WindowControls from "./Components/WindowControls";

function App() {
  // Estados movidos de VideoConverter para App
  const [cpuCores, setCpuCores] = useState<number>(1);
  const [maxCpuCores, setMaxCpuCores] = useState<number>(8);
  const [openFolder, setOpenFolder] = useState<boolean>(false);
  const [useHardwareAcceleration, setUseHardwareAcceleration] =
    useState<boolean>(false);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  // Carregar núcleos da CPU
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

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem("convertSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setUseHardwareAcceleration(parsed.useHardwareAcceleration ?? false);
        setOpenFolder(parsed.openFolder ?? false);
        setCpuCores(parsed.cpuCores ?? 1);
      } catch (err) {
        console.warn("Erro ao carregar configurações salvas:", err);
      }
    }
    setSettingsLoaded(true);
  }, []);

  // Salvar configurações no localStorage
  useEffect(() => {
    if (!settingsLoaded) return;
    const settings = {
      useHardwareAcceleration,
      openFolder,
      cpuCores,
    };
    localStorage.setItem("convertSettings", JSON.stringify(settings));
  }, [settingsLoaded, useHardwareAcceleration, openFolder, cpuCores]);

  return (
    <AppContainer>
      <WindowControls
        cpuCores={cpuCores}
        setCpuCores={setCpuCores}
        maxCpuCores={maxCpuCores}
        openFolder={openFolder}
        setOpenFolder={setOpenFolder}
        useHardwareAcceleration={useHardwareAcceleration}
        setUseHardwareAcceleration={setUseHardwareAcceleration}
      />
      <VideoConverter
        cpuCores={cpuCores}
        openFolder={openFolder}
        useHardwareAcceleration={useHardwareAcceleration}
      />
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;
