import styled from "styled-components";

interface ProgressData {
  file: string;
  percent: number;
}

interface ProgressBarProps {
  progress: ProgressData;
}

function ProgressBar({ progress }: ProgressBarProps) {
  const fileName = progress.file.split(/[/\\]/).pop();

  return (
    <ProgressContainer>
      <ProgressHeader>
        <div>
          <small>Conversao em andamento</small>
          <strong>{fileName}</strong>
        </div>
        <PercentPill>{progress.percent}%</PercentPill>
      </ProgressHeader>
      <ProgressTrack>
        <ProgressValue style={{ width: `${progress.percent}%` }} />
      </ProgressTrack>
    </ProgressContainer>
  );
}

export default ProgressBar;

const ProgressContainer = styled.div`
 
  padding: 18px 20px;
  border: 1px solid var(--line-soft);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 123, 84, 0.12), transparent 48%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  flex-shrink: 0;

  @media (max-width: 960px) {
    margin: 0 16px 16px;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  small {
    display: block;
    margin-bottom: 4px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 11px;
  }

  strong {
    color: var(--text-main);
    font-size: 15px;
  }
`;

const PercentPill = styled.span`
  min-width: 64px;
  text-align: center;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(78, 189, 255, 0.16);
  border: 1px solid rgba(78, 189, 255, 0.24);
  color: #d9f3ff;
  font-size: 13px;
  font-weight: 700;
`;

const ProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
`;

const ProgressValue = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-cool));
  box-shadow: 0 0 24px rgba(255, 123, 84, 0.28);
  transition: width 0.25s ease;
`;
