import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "convertHero.ico"),
    width: 1200,
    height: 700,
    minHeight: 700,
    minWidth: 1024,
    frame: false, // <- remove barra nativa
    //titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // importante
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("window-control", (_, action) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  switch (action) {
    case "minimize":
      win.minimize();
      break;
    case "maximize":
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      break;
    case "close":
      win.close();
      break;
  }
});

// Velocidade → mapeamento para `preset`
const speedMap = {
  ultrafast: "ultrafast",
  fast: "fast",
  medium: "medium",
  slow: "slow",
  veryslow: "veryslow",
};

ipcMain.handle("convert-videos", async (_, payload) => {
  const {
    files,
    format,
    quality,
    speed,
    openFolder,
    outputFolder,
    cpuCores,
    useHardwareAcceleration,
  } = payload;

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Nenhum arquivo recebido.");
  }

  const convertedPaths: string[] = [];

  for (const filePath of files) {
    const parsedPath = path.parse(filePath);

    const saveDir = outputFolder || parsedPath.dir; // usa a pasta de saída, ou a pasta original

    const outputPath = path.join(
      saveDir,
      `${parsedPath.name}_Converted.${format}`
    );

    const outputOptions = [];
    if (useHardwareAcceleration && format === "mp4") {
      outputOptions.push("-c:v h264_amf");
    } else {
      outputOptions.push(`-preset ${speedMap[speed] || "medium"}`);
      outputOptions.push(`-threads ${cpuCores || os.cpus().length}`);
    }
    await new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions(outputOptions)

        .on("start", (commandLine) => {
          console.log("FFmpeg command:", commandLine);
        })
        .on("progress", (progress) => {
          const percent = Math.floor(progress.percent || 0);
          // console.log(`Progresso: ${percent}%`);
          win?.webContents.send("conversion-progress", {
            file: filePath,
            percent,
          });
        })

        .on("end", () => {
          console.log(`✅ Convertido: ${outputPath}`);
          convertedPaths.push(outputPath);
          resolve();
        })
        .on("error", (err) => {
          console.error("❌ Erro na conversão:", err.message);
          reject(err);
        })
        .toFormat(format)
        .save(outputPath);
    });
  }

  // Abrir pasta após conversão (se habilitado)
  if (openFolder && convertedPaths.length > 0) {
    const { shell } = await import("electron");
    const folder = path.dirname(convertedPaths[0]);
    shell.openPath(folder);
  }

  return convertedPaths;
});

ipcMain.handle("select-output-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  return result.filePaths[0];
});

ipcMain.handle("getCpuCores", () => {
  return os.cpus().length;
});
app.whenReady().then(createWindow);
