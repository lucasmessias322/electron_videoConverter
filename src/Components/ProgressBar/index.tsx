import React from "react";
import styled from "styled-components";

function ProgressBar({ progress }: any) {
  return (
    <ProgressContainer>
      <Progress>
        <span>
          Converting: <strong>{progress.file.split(/[/\\]/).pop()}</strong>
        </span>
        <progress value={progress.percent} max={100}></progress>
        <span>{progress.percent}%</span>
      </Progress>
    </ProgressContainer>
  );
}

export default ProgressBar;

const ProgressContainer = styled.div`
  background-color: #202020;
  padding: 16px 40px;
  border-top: 2px solid #181818;
  flex-shrink: 0; /* 👈 Isso impede que ele cresça e empurre o conteúdo */
`;

const Progress = styled.div`
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
