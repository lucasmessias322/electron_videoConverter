import styled from "styled-components";

interface VideosContainerProps {
  $isDragging: boolean;
}

export const Container = styled.div`
  color: var(--text-main);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  padding: 10px;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-soft);

  @media (max-width: 960px) {
    padding: 20px 16px;
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-main);
  padding: 0 18px;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
  font-size: 14px;
  font-weight: 700;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const ButtonPrimary = styled(Button)`
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #ffffff;
  border-color: rgba(255, 123, 84, 0.15);
  //box-shadow: 0 12px 28px rgba(255, 123, 84, 0.22);

  &:hover {
    background: linear-gradient(135deg, var(--accent-strong), #a56dff);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-muted);
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

export const MainContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: stretch;
  overflow: hidden;
  gap: 6px;

  @media (max-width: 980px) {
    flex-direction: column;
    overflow: auto;
    gap: 18px;
  }
`;

export const VideosContainer = styled.div<VideosContainerProps>`
  flex: 1;
  min-width: 0;
  min-height: 0;
  margin: 0px;
  border: 1px solid
    ${(props) =>
      props.$isDragging ? "rgba(255, 123, 84, 0.42)" : "var(--line-soft)"};
  background:
    ${(props) =>
      props.$isDragging
        ? "radial-gradient(circle at top, rgba(255, 123, 84, 0.14), transparent 34%),"
        : ""}
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.02));
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    ${(props) =>
      props.$isDragging
        ? "0 18px 42px rgba(255, 123, 84, 0.12)"
        : "0 16px 36px rgba(0, 0, 0, 0.15)"};

  @media (max-width: 980px) {
    margin: 0 18px;
  }
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;

  .emptyCard {
    width: min(520px, 100%);
    padding: 36px 30px;
    text-align: center;
    border-radius: 28px;
    border: 1px dashed rgba(255, 255, 255, 0.16);
    background:
      radial-gradient(circle at top, rgba(78, 189, 255, 0.12), transparent 30%),
      rgba(255, 255, 255, 0.02);
  }

  .iconWrap {
    width: 70px;
    height: 70px;
    margin: 0 auto 18px;
    display: grid;
    place-items: center;
    border-radius: 22px;
    background: rgba(255, 123, 84, 0.14);
    color: var(--accent);
  }

  h3 {
    font-size: 28px;
    margin-bottom: 12px;
  }

  p {
    max-width: 360px;
    margin: 0 auto 22px;
    color: var(--text-soft);
    line-height: 1.7;
    font-size: 15px;
  }
`;

export const VideosList = styled.ul`
  list-style: none;
  padding: 0 18px 18px;
  margin: 0;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const VideoItemStyled = styled.li<{
  $isConverting: boolean;
  $isActive: boolean;
}>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px;
  border: 1px solid
    ${(props) =>
      props.$isActive ? "rgba(78, 189, 255, 0.22)" : "var(--line-soft)"};
  border-radius: 22px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
  cursor: default;
  background:
    ${(props) =>
      props.$isConverting
        ? "linear-gradient(135deg, rgba(255, 123, 84, 0.08), rgba(78, 189, 255, 0.04))"
        : "rgba(255, 255, 255, 0.02)"};

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.04);
  }

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

export const LeftSide = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;

  .videoInfos {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 12px;
  }

  .titleRow {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    @media (max-width: 720px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .videoname {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-main);
    user-select: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  @media (max-width: 720px) {
    width: 100%;
  }
`;

export const RightSide = styled.div`
  display: flex;
  align-items: center;
  padding-top: 6px;

  @media (max-width: 720px) {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0;
  }
`;

export const IconButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line-soft);
  cursor: pointer;
  color: var(--text-muted);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
  padding: 4px;
  border-radius: 999px;
  font-size: 18px;

  &:hover {
    color: #fff;
    background-color: rgba(255, 107, 122, 0.14);
    transform: translateY(-1px);
  }

  svg {
    display: block;
  }
`;

export const HeaderCopy = styled.div`
  flex: 1;
  min-width: 260px;

  .eyebrow {
    display: inline-block;
    margin-bottom: 10px;
    color: var(--accent-cool);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h1 {
    font-size: 34px;
    margin-bottom: 10px;
  }

  p {
    max-width: 560px;
    color: var(--text-soft);
    font-size: 15px;
    line-height: 1.7;
  }
`;

export const HeaderMetrics = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex-wrap: wrap;
`;

export const StatCard = styled.div<{ $tone?: "success" }>`
  min-width: 118px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid
    ${(props) =>
      props.$tone === "success"
        ? "rgba(70, 211, 155, 0.18)"
        : "var(--line-soft)"};
  background:
    ${(props) =>
      props.$tone === "success"
        ? "rgba(70, 211, 155, 0.1)"
        : "rgba(255, 255, 255, 0.04)"};

  span {
    display: block;
    margin-bottom: 8px;
    color: var(--text-muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  strong {
    font-size: 22px;
    color: var(--text-main);
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const QueueToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 18px;
  flex-wrap: wrap;

  .label {
    display: inline-block;
    margin-bottom: 8px;
    color: var(--accent);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    font-size: 24px;
  }
`;

export const QueueHint = styled.div<{ $active: boolean }>`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid
    ${(props) =>
      props.$active ? "rgba(255, 123, 84, 0.28)" : "var(--line-soft)"};
  background:
    ${(props) =>
      props.$active
        ? "rgba(255, 123, 84, 0.12)"
        : "rgba(255, 255, 255, 0.04)"};
  color: ${(props) =>
    props.$active ? "var(--text-main)" : "var(--text-soft)"};
  font-size: 13px;
`;

export const ThumbFrame = styled.div`
  width: 170px;
  height: 104px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0b111b;
  flex-shrink: 0;

  .loading,
  .fallback {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: var(--text-soft);
    font-size: 13px;
    background:
      radial-gradient(circle at top, rgba(255, 123, 84, 0.16), transparent 36%),
      rgba(255, 255, 255, 0.03);
  }

  .fallback {
    color: var(--accent);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 720px) {
    width: 120px;
    height: 88px;
  }
`;

export const StatusBadge = styled.span<{
  $tone: "success" | "accent" | "neutral";
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: ${(props) =>
    props.$tone === "success"
      ? "#d9ffef"
      : props.$tone === "accent"
        ? "#fff0e8"
        : "#dde5f5"};
  background: ${(props) =>
    props.$tone === "success"
      ? "rgba(70, 211, 155, 0.16)"
      : props.$tone === "accent"
        ? "rgba(255, 123, 84, 0.16)"
        : "rgba(255, 255, 255, 0.06)"};
  border: 1px solid
    ${(props) =>
      props.$tone === "success"
        ? "rgba(70, 211, 155, 0.2)"
        : props.$tone === "accent"
          ? "rgba(255, 123, 84, 0.2)"
          : "var(--line-soft)"};
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 12px;

  span {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
  }

  .path {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const InlineProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
`;

export const InlineProgressValue = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-cool));
  transition: width 0.25s ease;
`;
