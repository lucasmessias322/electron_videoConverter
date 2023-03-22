const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require("electron");
const path = require("path");
const url = require("url");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const {
  formatSize,
  formatDuration,
  formatDurationMoment,
} = require("./helpers/format");
const isDev = require("electron-is-dev");

//Get the paths to the packaged versions of the binaries we want to use
const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

const iconPc = path.join(__dirname, "..", "convertHero.png");

let mainWindow;
//tell the ffmpeg package where it can find the needed binaries.
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    minHeight: 700,
    minWidth: 1024,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    maximizable: true,
    fullscreen: false,
    resizable: true,
    title: "ConvertHero",
    icon: iconPc,
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

  const tray = new Tray(iconPc);

  let trayMenu = Menu.buildFromTemplate([
    {
      label: "Close App",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(trayMenu);

  ipcMain.on("closeWindow", () => {
    mainWindow.close();
  });

  ipcMain.on("Windowminimize", () => {
    mainWindow.minimize();
  });
  ipcMain.on("windowFullScreen", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
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

let conversionProcess = null;
ipcMain.handle(
  "convert-video",
  async (
    event,
    videoName,
    inputFile,
    outputFile,
    destination,
    outputOptions
  ) => {
    await convertVideo({
      videoName,
      inputFile,
      outputFile,
      destination,
      outputOptions,
    });
  }
);

ipcMain.on("cancel-conversion", async (event, outputPath) => {
  if (conversionProcess) {
    await conversionProcess.kill("SIGINT");
    // mainWindow.webContents.send("canceled-video-conversion");
  }
});

ipcMain.handle("getVideo_information", async (event, videoName, videoPath) => {
  await getVideoInformation(videoName, videoPath);
});

function convertVideo({
  videoName,
  inputFile,
  outputFile,
  destination,
  outputOptions,
}) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(destination, path.basename(outputFile));
    const OutputOptions = [
      { name: "-c:v", value: "libx264" },
      { name: "-c:a", value: "aac" },
      { name: "-strict", value: "-2" },
      { name: "-movflags", value: "faststart" },
      { name: "-threads", value: outputOptions.coresOption },
      { name: "-crf", value: outputOptions.quality },
      { name: "-preset", value: outputOptions.SpeedOption },
    ];
    let startTime;
    conversionProcess = ffmpeg(inputFile)
      .output(outputPath)
      .outputOptions(
        OutputOptions.map((option) => option.name + " " + option.value)
      )

      .on("start", () => {
        mainWindow.webContents.send("conversion-started", videoName);
        startTime = Date.now(); // tempo inicial em milissegundos
      })
      .on("progress", (progress) => {
        const percent = Math.round(progress.percent);
        const timemark = formatDurationMoment(progress.timemark);

        mainWindow.webContents.send("conversion-progress", videoName, {
          percent,
          timemark,
        });
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
        if (error.message === "ffmpeg was killed with signal SIGINT") {
          reject("Error: ffmpeg was killed with signal SIGINT");

          fs.unlink(outputPath, (err) => {
            if (err) {
              console.error(err);
              return;
            }

            mainWindow.webContents.send("canceled-video-conversion", videoName);
          });
        } else {
          reject(error);
          dialog.showErrorBox(`Erro ao converter video(os)`, videoName);
          mainWindow.webContents.send("conversion-error", videoName, error);
        }
      });

    conversionProcess.run();
  });
}

async function getVideoInformation(videoName, videoPath) {
  mainWindow.webContents.send("Videoinfoanalysis-started", videoName);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        dialog.showErrorBox(`Seu video pode está corrompido!`, videoName);
        mainWindow.webContents.send("video-comrropido", videoName, err);

        return;
      }

      const duration = formatDuration(metadata.format.duration);
      const codecs = metadata.streams.map((stream) => stream.codec_name);
      const resolution = `${metadata.streams[0].width}x${metadata.streams[0].height}`;
      const size = formatSize(metadata.format.size);
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
