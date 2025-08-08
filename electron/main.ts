import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainInvokeEvent,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs"

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, "convertHero.ico"),
    width: 1200,
    height: 700,
    minHeight: 700,
    minWidth: 1024,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true, // para segurança
      sandbox: false, // permite acesso local
      webSecurity: false, // apenas se necessário
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("window-control", (_, action: "minimize" | "maximize" | "close") => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  switch (action) {
    case "minimize":
      win.minimize();
      break;
    case "maximize":
      win.isMaximized() ? win.unmaximize() : win.maximize();
      break;
    case "close":
      win.close();
      break;
  }
});

// ---------- Tipos personalizados ----------
type ConversionPayload = {
  files: string[];
  format: string;
  quality: "original" | "1080p" | "720p" | "480p";
  speed: keyof typeof speedMap;
  openFolder: boolean;
  outputFolder: string;
  cpuCores: number;
  useHardwareAcceleration: boolean;
};

const speedMap = {
  ultrafast: "ultrafast",
  fast: "fast",
  medium: "medium",
  slow: "slow",
  veryslow: "veryslow",
};

ipcMain.handle(
  "convert-videos",
  async (_: IpcMainInvokeEvent, payload: ConversionPayload) => {
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

    const resolutionMap: Record<string, string> = {
      "1080p": "1920x1080",
      "720p": "1280x720",
      "480p": "854x480",
    };

    const convertedPaths: string[] = [];

    for (const filePath of files) {
      const parsedPath = path.parse(filePath);
      const saveDir = outputFolder || parsedPath.dir;

      const outputPath = path.join(
        saveDir,
        `${parsedPath.name}_Converted.${format}`
      );

      const outputOptions: string[] = [];

      if (useHardwareAcceleration && format === "mp4") {
        outputOptions.push("-c:v h264_amf");
      } else {
        outputOptions.push(`-preset ${speedMap[speed] || "medium"}`);
        outputOptions.push(`-threads ${cpuCores || os.cpus().length}`);
      }

      if (quality !== "original") {
        const resolution = resolutionMap[quality];
        if (resolution) {
          outputOptions.push(`-vf scale=${resolution}`);
        }
      }

      win?.webContents.send("conversion-started", {
        file: filePath,
      });

      await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .outputOptions(outputOptions)
          .on("start", (commandLine) => {
            console.log("FFmpeg command:", commandLine);
          })
          .on("progress", (progress) => {
            const percent = Math.floor(progress.percent || 0);
            win?.webContents.send("conversion-progress", {
              file: filePath,
              percent,
            });
          })
          .on("end", () => {
            console.log(`✅ Convertido: ${outputPath}`);
            win?.webContents.send("conversion-completed", { file: filePath });

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

    if (openFolder && convertedPaths.length > 0) {
      const { shell } = await import("electron");
      const folder = path.dirname(convertedPaths[0]);
      shell.openPath(folder);
    }

    return convertedPaths;
  }
);

ipcMain.handle("select-output-folder", async (): Promise<string | null> => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  return result.filePaths[0];
});

ipcMain.handle("getCpuCores", (): number => {
  return os.cpus().length;
});

ipcMain.handle("generate-thumbnail", async (_event, videoPath: string) => {
  const thumbnailPath = path.join(
    os.tmpdir(),
    `${path.parse(videoPath).name}_thumb.jpg`
  );

  return new Promise<string>((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", () => {
        console.log("📸 Thumbnail gerada:", thumbnailPath);
        resolve(thumbnailPath);
      })
      .on("error", (err) => {
        console.error("❌ Erro ao gerar thumbnail:", err.message);
        reject(err);
      })
      .screenshots({
        timestamps: ["00:00:01"],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
      });
  });
});
ipcMain.handle("delete-file", async (_event, filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
    console.log("🗑️ Thumbnail deletada:", filePath);
    return true;
  } catch (err) {
    console.error("❌ Erro ao deletar thumbnail:", err);
    return false;
  }
});

app.whenReady().then(createWindow);
