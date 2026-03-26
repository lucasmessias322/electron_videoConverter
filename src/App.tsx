import { useEffect, useState } from "react";
import styled from "styled-components";
import VideoConverter from "./VideoConverter";
import WindowControls from "./Components/WindowControls";

function App() {
  const [cpuCores, setCpuCores] = useState<number>(1);
  const [maxCpuCores, setMaxCpuCores] = useState<number>(8);
  const [openFolder, setOpenFolder] = useState<boolean>(false);
  const [useHardwareAcceleration, setUseHardwareAcceleration] =
    useState<boolean>(false);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchCpuCores = async () => {
      try {
        const cores = await window.electronAPI.getCpuCores();
        setMaxCpuCores(cores);
        setCpuCores(Math.min(cores, 4));
      } catch (err) {
        console.error("Erro ao obter nucleos da CPU:", err);
      }
    };

    fetchCpuCores();
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("convertSettings");

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setUseHardwareAcceleration(parsed.useHardwareAcceleration ?? false);
        setOpenFolder(parsed.openFolder ?? false);
        setCpuCores(parsed.cpuCores ?? 1);
      } catch (err) {
        console.warn("Erro ao carregar configuracoes salvas:", err);
      }
    }

    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;

    localStorage.setItem(
      "convertSettings",
      JSON.stringify({
        useHardwareAcceleration,
        openFolder,
        cpuCores,
      })
    );
  }, [settingsLoaded, useHardwareAcceleration, openFolder, cpuCores]);

  return (
    <AppBackground>
      <AppShell>
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
      </AppShell>
    </AppBackground>
  );
}

export default App;

const AppBackground = styled.div`
  min-height: 100vh;
  padding: 0px;
  background:
    radial-gradient(circle at top left, rgba(255, 129, 72, 0.18), transparent 34%),
    radial-gradient(circle at top right, rgba(78, 189, 255, 0.16), transparent 30%),
    linear-gradient(145deg, #08111f 0%, #0d1726 48%, #111826 100%);
`;

const AppShell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);

  background: linear-gradient(
    180deg,
    rgba(19, 29, 46, 0.98) 0%,
    rgba(11, 18, 30, 0.98) 100%
  );
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px);

  @media (max-width: 960px) {
    height: calc(100vh - 24px);
    border-radius: 22px;
  }
`;
