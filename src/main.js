const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const url = require("url");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const isDev = process.env.NODE_ENV !== "production";
let mainWindow;

//Get the paths to the packaged versions of the binaries we want to use
const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

//tell the ffmpeg package where it can find the needed binaries.
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1150,
    height: 700,
    minHeight: 700,
    minWidth: 1024,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    maximizable: true,
    fullscreen: false,
    resizable: true,
    title: "Conversor de video",
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

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

ipcMain.handle("getVideo_information", async (event, videoName, videoPath) => {
  await getVideoInformation(videoName, videoPath);
});

function convertVideo(videoName, inputFile, outputFile, destination) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(destination, path.basename(outputFile));

    const command = ffmpeg(inputFile)
      .output(outputPath)
      .outputOptions("-c:v", "libx264")
      .outputOptions("-c:a", "aac")
      .outputOptions("-strict", "-2")
      .outputOptions("-movflags", "faststart")
      .outputOptions("-threads", "2")
      .outputOptions("-crf", "22")
      .outputOptions("-preset", "fast")
      .on("start", () => {
        mainWindow.webContents.send("conversion-started", videoName);
      })
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
            dialog.showErrorBox(`Erro ao converter ${videoName}`, err);
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
        dialog.showErrorBox(`Erro ao converter video(os)`, videoName);
        mainWindow.webContents.send("conversion-error", videoName, error);
      });

    command.run();
  });
}

async function getVideoInformation(videoName, videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        dialog.showErrorBox(`Seu video pode está corrompido!`, videoName);
        mainWindow.webContents.send("video-comrropido", videoName, err);

        return;
      }

      const duration = metadata.format.duration;
      const codecs = metadata.streams.map((stream) => stream.codec_name);
      const resolution = `${metadata.streams[0].width}x${metadata.streams[0].height}`;
      const size = metadata.format.size;
      const format = metadata.format.format_long_name;

      resolve({
        duration,
        codecs,
        resolution,
        format,
        size,
      });

      mainWindow.webContents.send("videoInformation-ready", videoName, {
        duration,
        codecs,
        resolution,
        format,
        size,
      });
    });
  });
}
