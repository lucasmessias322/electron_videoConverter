import styled from "styled-components";


// Styled Components
interface VideosContainerProps {
  isDragging: boolean;
}

export const Container = styled.div`
  background-color: #1a1a1a;
  color: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #202020;
  padding: 20px 40px;
  border-bottom: 2px solid #181818;

  .header-buttons {
    display: flex;
    gap: 12px;
  }
`;

export const Button = styled.button`
  background-color: #2e2e2e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;

  &:hover {
    background-color: #3d3d3d;
  }
`;

export const ButtonPrimary = styled(Button)`
  background-color: #7b2cbf;

  &:hover {
    background-color: #9d4edd;
  }
`;

export const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const VideosContainer = styled.div<VideosContainerProps>`
  flex: 2;
  background-color: ${(props) => (props.isDragging ? "#2a2a2a" : "#202020")};
  border-right: 2px solid #181818;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const EmptyState = styled.div`
  flex: 1;
  text-align: center;
  opacity: 0.6;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const VideosList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  background-color: #181818;
`;

export const VideoItemStyled = styled.li<{ isConverting: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid #38383894;
  transition: background-color 0.2s;
  cursor: default;

  background-color: ${(props) =>
    props.isConverting ? "#1d1d1f" : "transparent"};

  &:hover {
    background-color: #2a2a2a;
  }
`;

export const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .VideoThumb {
    .loading {
      width: 150px;
      height: 100px;
      border-radius: 8px;
      border: 1px solid #7b2cbf;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #000;
    }
    img {
      width: 150px;
      height: 100px;
      border-radius: 8px;
      border: 1px solid #7b2cbf;
      object-fit: cover;
    }
  }

  .videoInfos {
    display: flex;
    gap: 10px;
    .videoname {
      font-size: 15px;
      color: #e0e0e0;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 400px;
    }
  }
`;

export const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #858585;
  transition: color 0.2s;
  padding: 4px;
  border-radius: 4px;
  font-size: 18px;

  &:hover {
    color: #7b2cbf;
  }

  svg {
    display: block;
  }
`;