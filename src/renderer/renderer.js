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
const videosForConverteContainer = document.querySelector(
  "#videos_for_converte_Container"
);
const videoList = document.querySelector("#video-list");

let videoHistory = [];
if (localStorage.getItem("videoHistory")) {
  videoHistory = JSON.parse(localStorage.getItem("videoHistory"));
}

// for (let i = 0; i < videoHistory.length; i++) {
//   const { name, convertedAt } = videoHistory[i];
//   const item = `
//    <tr>
//     <td class="videoName">
//     <span class="converted">${name}</span> </td>
//     <td class="convertVideoTime">
//     <span class="convertedAt">${convertedAt}</span></td>
//    </tr>`;
//   videoList.innerHTML += item;
// }

// quando tiver arquivos selecionados no inpute file ele ira exibir no html
inputField.addEventListener("change", () => {
  const inputFiles = inputField.files;
  videosForConverteContainer.innerHTML = "";

  for (let i = 0; i < inputFiles.length; i++) {
    const spanTag = document.createElement("span");
    spanTag.setAttribute("id", inputFiles[i].name);
    spanTag.innerText = inputFiles[i].name;
    videosForConverteContainer.appendChild(spanTag);
  }
});

// function addVideoToList({ videoName, saveOnHistory = false }) {
//   const item = `
//    <tr>
//     <td class="videoName">
//       <span class="converted">${videoName}</span>
//     </td>
//     <td class="convertVideoTime">
//     <span class="convertedAt">${now}</span></td>
//    </tr>`;

// }
function addVideosConvertedOnHistory(videoName) {
  const now = new Date().toLocaleString();
  videoHistory.push({ name: videoName, convertedAt: now });
  localStorage.setItem("videoHistory", JSON.stringify(videoHistory));
}

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

    await convert(currentVideo, input, outputPath, destination);
  }

  progressVideo.innerText = "";
});

function convert(videoName, inputFile, outputFile, destination) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(destination, path.basename(outputFile));
    const fileConvertedSpanTag = document.getElementById(videoName);

    const command = ffmpeg(inputFile)
      .output(outputPath)
      .on("progress", (progress) => {
        progressBar.style.display = "block";
        progressText.style.display = "block";
        progressBar.value = progress.percent;
        progressText.innerText = `${Math.round(progress.percent)}%`;
        progressVideo.innerText = `Converting: ${videoName}`;
        fileConvertedSpanTag.classList.add("converting");
      })
      .on("end", () => {
        progressBar.style.display = "none";
        progressText.style.display = "none";
        progressVideo.innerText = "";
        fileConvertedSpanTag.classList.remove("converting");
        fileConvertedSpanTag.classList.add("converted");

        fs.copyFile(outputPath, outputFile, (err) => {
          if (err) {
            reject(err);
            console.log(err);
          } else {
            addVideosConvertedOnHistory(videoName);
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
