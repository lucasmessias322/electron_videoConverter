export {};

declare global {
  interface Window {
    electronAPI: {
      convertVideos: (payload: {
        files: string[];
        format: string;
        quality: string;
        speed: string;
        openFolder: boolean;
        outputFolder: string;
        cpuCores: number;
        useHardwareAcceleration: boolean;
      }) => Promise<string[]>;

      onProgress: (
        callback: (data: { file: string; percent: number }) => void
      ) => void;

      onConversionStarted: (
        callback: (data: { file: string }) => void
      ) => void;

      onConversionCompleted: (
        callback: (data: { file: string }) => void
      ) => void;

      getCpuCores: () => Promise<number>;

      selectOutputFolder: () => Promise<string>;
    };
  }
}
