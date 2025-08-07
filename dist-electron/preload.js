"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  convertVideos: (options) => electron.ipcRenderer.invoke("convert-videos", options),
  onProgress: (callback) => electron.ipcRenderer.on("conversion-progress", (_event, data) => callback(data)),
  selectOutputFolder: () => electron.ipcRenderer.invoke("select-output-folder"),
  windowControl: (action) => electron.ipcRenderer.send("window-control", action),
  getCpuCores: () => electron.ipcRenderer.invoke("getCpuCores")
});
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
