import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  convertVideos: (options: any) =>
    ipcRenderer.invoke("convert-videos", options),

  onProgress: (callback: (data: { file: string; percent: number }) => void) =>
    ipcRenderer.on("conversion-progress", (_event, data) => callback(data)),

  onConversionStarted: (callback: (data: { file: string }) => void) =>
    ipcRenderer.on("conversion-started", (_event, data) => callback(data)),

  onConversionCompleted: (callback: (data: { file: string }) => void) =>
    ipcRenderer.on("conversion-completed", (_event, data) => callback(data)),

  selectOutputFolder: () => ipcRenderer.invoke("select-output-folder"),
  windowControl: (action: any) => ipcRenderer.send("window-control", action),
  getCpuCores: () => ipcRenderer.invoke("getCpuCores"),
});
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

// contextBridge.exposeInMainWorld('electronAPI', {
//   convertVideos: (options) => ipcRenderer.invoke('convert-videos', options),
//   onProgress: (callback) => ipcRenderer.on('conversion-progress', (_event, data) => callback(data)),
// });
