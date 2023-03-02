const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const url = require("url");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

// const videoConversor = require("./videoConversor");

const isDev = process.env.NODE_ENV !== "production";
let mainWindow;
let conversionQueue = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
    maximizable: false,
    fullscreen: false,
    resizable: false,
    title: "Conversor de video",
  });

  if (isDev) mainWindow.webContents.openDevTools();

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

//Menu template
const menu = [
  // {
  //   label: "Dev",
  //   submenu: [{ label: "DevTools", click: () => app.getGPUInfo() }],
  // },
];

app.whenReady().then(() => {
  createWindow();

  //Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("select-directory", async (event) => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle(
  "convert-video",
  async (event, videoName, inputFile, outputFile, destination) => {
    await convertVideo(videoName, inputFile, outputFile, destination);
  }
);

function convertVideo(videoName, inputFile, outputFile, destination) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(destination, path.basename(outputFile));

    const command = ffmpeg(inputFile)
      .output(outputPath)
      .on("progress", (progress) => {
        mainWindow.webContents.send(
          "conversion-progress",
          videoName,
          Math.round(progress.percent)
        );
      })
      .on("end", () => {
        fs.copyFile(outputPath, outputFile, (err) => {
          if (err) {
            reject(err);
            console.log(err);
          } else {
            mainWindow.webContents.send(
              "conversion-complete",
              videoName,
              outputPath
            );
            resolve();
          }
        });
      })
      .on("error", (error) => {
        reject(error);
        mainWindow.webContents.send("conversion-error", videoName, error);
      });

    command.run();
  });
}

ipcMain.handle("getVideo_information", async (event, videoName, videoPath) => {
  await getVideoInformation(videoName, videoPath);
});

async function getVideoInformation(videoName, videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = metadata.format.duration;
      const codecs = metadata.streams.map((stream) => stream.codec_name);
      const resolution = `${metadata.streams[0].width}x${metadata.streams[0].height}`;

      resolve({
        duration,
        codecs,
        resolution,
      });

      mainWindow.webContents.send("videoInformation-ready", videoName, {
        duration,
        codecs,
        resolution,
      });
    });
  });
}
