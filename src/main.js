const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const url = require("url");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "./renderer/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
});

ipcMain.on("convert-video", (event, arg) => {
  const { input, output, destination } = arg;

  const outputPath = path.join(destination, path.basename(output));

  ffmpeg(input)
    .output(outputPath)
    .on("progress", (progress) => {
      event.sender.send("conversion-progress", progress.percent);
    })
    .on("end", () => {
      event.sender.send("video-converted", "Conversão concluída com sucesso!");
    })
    .on("error", (err) => {
      event.sender.send("video-convert-error", err.message);
    })
    .run();
});
