export {};

declare global {
  interface Window {
    electronAPI: {
      convertVideos: (options: any) => Promise<any>;
      onProgress: (callback: (data: { file: string; percent: number }) => void) => void;
    };
  }
}
