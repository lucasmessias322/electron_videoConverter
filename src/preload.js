const { ipcRenderer, contextBridge } = require("electron");

// Expose a limited set of APIs to the renderer process
contextBridge.exposeInMainWorld("electron", {
  saveFileDialog: async (defaultPath, filters) => {
    const result = await ipcRenderer.invoke("save-file-dialog", {
      defaultPath,
      filters,
    });
    return result;
  },
});


