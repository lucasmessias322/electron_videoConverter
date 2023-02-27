const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const url = require("url");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

let mainWindow;
let conversionQueue = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
    maximizable: false,
    fullscreen: false,
    resizable: false,
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

ipcMain.handle("select-directory", async (event) => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.on("convert-video", (event, arg) => {
  conversionQueue.push(arg);
  if (conversionQueue.length === 1) {
    convertNextVideo(event.sender);
  }
});

function convertNextVideo(sender) {
  if (conversionQueue.length === 0) {
    sender.send("conversion-queue-finished");
    return;
  }

  const { input, output, destination } = conversionQueue[0];
  const outputPath = path.join(destination, path.basename(output));

  ffmpeg(input)
    .output(outputPath)
    .on("progress", (progress) => {
      sender.send("conversion-progress", {
        progress: progress.percent,
        input: input,
      });
    })
    .on("end", () => {
      sender.send("video-converted", {
        message: "Conversão concluída com sucesso!",
        input: input,
      });
      conversionQueue.shift();
      convertNextVideo(sender);
    })
    .on("error", (err) => {
      sender.send("video-convert-error", {
        error: err.message,
        input: input,
      });
      conversionQueue.shift();
      convertNextVideo(sender);
    })
    .run();
}
