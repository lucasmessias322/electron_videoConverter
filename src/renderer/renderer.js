const { ipcRenderer } = require("electron");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const form = document.querySelector("form");
const inputField = document.querySelector("#input-file");
const outputFormatField = document.querySelector("#output-format");
const progressBar = document.querySelector("#progress-bar");
const progressText = document.querySelector("#progress-text");
const progressVideo = document.querySelector("#progress-video");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const inputFiles = inputField.files;
  const outputFormat = outputFormatField.value;

  const destination = await ipcRenderer.invoke("select-directory");
  if (!destination) return;

  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i].path;
    const output = `${inputFiles[i].name.slice(0, -4)}.${outputFormat}`;
    const outputPath = path.join(destination, output);
    const currentVideo = inputFiles[i].name;
    progressVideo.innerText = `Converting: ${currentVideo}`;
    await convert(input, outputPath, destination);
  }

  // reset progress video text after all conversions are done
  progressVideo.innerText = "";
});

function convert(inputFile, outputFile, destination) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(destination, path.basename(outputFile));

    const command = ffmpeg(inputFile)
      .output(outputPath)
      .on("progress", (progress) => {
        progressBar.style.display = "block";
        progressText.style.display = "block";
        progressBar.value = progress.percent;
        progressText.innerText = `${Math.round(progress.percent)}%`;
      })
      .on("end", () => {
        progressBar.style.display = "none";
        progressText.style.display = "none";
        progressVideo.innerText = "";

        fs.copyFile(outputPath, outputFile, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
      .on("error", (error) => {
        reject(error);
      });

    command.run();
  });
}
