const { ipcRenderer } = require("electron");
const path = require("path");
// const moment = require("moment");
const { db, consultarDb, deleteDbData } = require("../config/DbConfig");
const { v4: uuidv4 } = require("uuid");

const form = document.querySelector("form");
const inputField = document.querySelector("#input-file");
const outputFormatField = document.querySelector("#output-format");
const progressBar = document.querySelector("#progress-bar");
const progressText = document.querySelector("#progress-text");
const progressVideo = document.querySelector("#progress-video");
const convertingList = document.querySelector("#convertingList");
const tablevideo_list = document.getElementById("video-list");
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");
const NumberOfvideosOnList = document.getElementById("NumberOfvideosOnList");

const progressData = document.getElementById("progressData");
let videosOnlistForConvert = [];
//Armazena o historico de conversão de videos
let videoHistory = [];

// coleta os dados do banco de dados e retorna um array com os dados
consultarDb((data) => {
  // percorre o array data para armazenar somente o doc no array videoHistory
  data.forEach((element) => {
    videoHistory.push(element.doc);
  });

  // carrega o historico
  LoadHistory(videoHistory);
});

clearHistoryBtn.addEventListener("click", () => {
  deleteDbData();
  tablevideo_list.innerHTML = ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
});

// quando tiver arquivos selecionados no inpute file ele ira exibir no html
inputField.addEventListener("change", async () => {
  const inputFiles = inputField.files;
  convertingList.innerHTML = "";
  NumberOfvideosOnList.innerText = "";
  videosOnlistForConvert = [];

  for (let i = 0; i < inputFiles.length; i++) {
    try {
      // Pesquisa as infomaçoes dos videos
      await ipcRenderer.invoke(
        "getVideo_information",
        inputFiles[i].name,
        inputFiles[i].path
      );
      videosOnlistForConvert.push(inputFiles[i]);
      NumberOfvideosOnList.innerText = `Converter ${i + 1}`;
    } catch (error) {
      console.log(error);
    }
  }
});

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

    try {
      await ipcRenderer.invoke(
        "convert-video",
        currentVideo,
        input,
        outputPath,
        destination
      );
    } catch (error) {
      console.log(error);
    }
  }

  progressVideo.innerText = "";
});

ipcRenderer.on("conversion-started", (event, videoName) => {});

ipcRenderer.on("conversion-progress", (event, videoName, progress) => {
  const spanTag = document.getElementById(videoName);

  if (spanTag) {
    if (progress.percent === 100) {
      spanTag.classList.remove("converting");
      spanTag.classList.add("converted");
    } else {
      spanTag.classList.add("converting");
    }
  }

  progressVideo.innerText = `Converting: ${videoName}`;
  progressBar.value = progress.percent;
  progressText.innerText = `${progress.percent}%`;
  progressData.innerHTML = `
  <span>Tempo decorrido: ${progress.timemark}</span>
  `;
});

ipcRenderer.on("conversion-complete", (event, videoName, outputPath) => {
  const fileConvertedSpanTag = document.getElementById(videoName);

  progressBar.value = 0;
  progressText.innerHTML = "0%";
  progressVideo.innerText = "";
  fileConvertedSpanTag.classList.remove("converting");
  fileConvertedSpanTag.classList.add("converted");

  videosOnlistForConvert.shift();
  NumberOfvideosOnList.innerText = `Converter ${videosOnlistForConvert.length} videos`;

  addVideosConvertedOnHistory(videoName);
});

ipcRenderer.on("conversion-error", (event, videoName, error) => {
  window.alert(`Erro ao converter: ${videoName} erro: ${error}`);
});

// retorna as infomaçoes dos videos
ipcRenderer.on("videoInformation-ready", (event, videoName, videoInfo) => {
  const item = `
    <div id="${videoName}" class="videoItemList">
      <span class="videoname" id="${videoName}_videoname">
        <b>Nome do video: </b>${videoName}
      </span>
      <div class="video_source">
        <ul>
          <li>
          <span class="icon"><i class="fa-solid fa-film"></i> </span>
          <span class="videoInfo" >
             ${videoName.substring(videoName.length - 3)}
          </span>
          </li>
          <li>
            <span class="icon"><i class="fa-solid fa-minimize"></i> </span>
            <span class="videoInfo" >
              ${videoInfo.resolution}
            </span>
          </li>
            
          <li>
          <span class="icon"><i class="fa-regular fa-clock"></i> </span>
          <span class="videoInfo" >
            ${videoInfo.duration}
          </span>
          </li>
          <li>
            <span class="icon"><i class="fa-regular fa-folder"></i> </span>
            <span class="videoInfo" >
              ${videoInfo.size}
            </span>
          </li>
        </ul>
      </div>
    </div>`;

  convertingList.innerHTML += item;
});

ipcRenderer.on("video-comrropido", (event, videoName, err) => {
  inputField.value = "";
  convertingList.innerHTML = "";
});

async function addVideosConvertedOnHistory(videoName) {
  const now = new Date().toLocaleString();

  const doc = {
    _id: uuidv4(),
    name: videoName,
    convertedAt: now,
  };

  db.put(doc, function (err, response) {
    if (err) {
      console.log(err);
    } else {
      videoHistory.push(doc);
      console.log("Document added successfully", doc);

      LoadHistory(videoHistory);
    }
  });
}

function LoadHistory(dataArray = [], cb) {
  tablevideo_list.innerHTML = "";
  if (dataArray.length > 0) {
    for (let i = 0; i < dataArray.length; i++) {
      const item = `<tr>
                        <td class="videoName">
                        <span class="converted">${dataArray[i].name}</span> </td>
                        <td class="convertVideoTime">
                        <span class="convertedAt">${dataArray[i].convertedAt}</span></td>
                    </tr>`;
      tablevideo_list.innerHTML += item;

      if (dataArray[i] === dataArray.length - 1) {
        cb();
      }
    }
  } else {
    tablevideo_list.innerHTML += ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
  }
}
