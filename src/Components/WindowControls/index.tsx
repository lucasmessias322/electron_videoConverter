import React from "react";
import styled from "styled-components";
import { IoMdSettings } from "react-icons/io";
import {
  VscChromeMinimize,
  VscChromeClose,
  VscChromeMaximize,
} from "react-icons/vsc";
import convertHeroLogo from "/convertHero.ico";

function WindowControls() {
  const handleWindowAction = (action: "minimize" | "maximize" | "close") => {
    window.electronAPI?.windowControl?.(action);
  };

  const handleSettings = () => {
    alert("Abrir configurações...");
  };

  return (
    <Wrapper>
      <Left>
        <Title>
          <img src={convertHeroLogo} alt="" />
          ConvertHero
        </Title>
      </Left>
      <Right>
        <div className="container">
          <IconButton onClick={handleSettings} title="Configurações">
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

      {/* <ConfigsContainer>
        <ConfigsWrapper></ConfigsWrapper>
      </ConfigsContainer> */}
    </Wrapper>
  );
}

export default WindowControls;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px 0px;
 // background-color: #202020;
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
    height: auto;
    padding: 0px 0px;
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
  width: 100%;
  height: 100%;
  gap: 5px;

  img {
    width: 35px;

    object-fit: contain;
  }
`;

const ConfigsContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 9;
  background-color: #000000dc;
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const ConfigsWrapper = styled.div`
  width: 90%;
  height: 90%;
  background-color: #202020;
  border-radius: 10px;
`;
