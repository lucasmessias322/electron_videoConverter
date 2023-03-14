const { ipcRenderer } = require("electron");
const path = require("path");
const { db, consultarDb, deleteDbData } = require("../config/DbConfig");
const crypto = require("crypto");

const UiImports = {
  form: document.querySelector("form"),
  inputField: document.querySelector("#input-file"),
  outputFormatField: document.querySelector("#output-format"),
  progressBar: document.querySelector("#progress-bar"),
  progressText: document.querySelector("#progress-text"),
  progressVideo: document.querySelector("#progress-video"),
  convertingList: document.querySelector("#convertingList"),
  tablevideo_list: document.getElementById("video-list"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  NumberOfvideosOnList: document.getElementById("NumberOfvideosOnList"),
  convertButton: document.getElementById("convert-button"),
  cancelButton: document.getElementById("cancelButton"),
  progressData: document.getElementById("progressData"),
  btnsConvertionContainer: document.getElementById("btnsConvertionContainer"),
};

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

UiImports.clearHistoryBtn.addEventListener("click", () => {
  deleteDbData();
  UiImports.tablevideo_list.innerHTML = ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
});

// quando tiver arquivos selecionados no inpute file ele ira exibir no html
UiImports.inputField.addEventListener("change", async () => {
  const inputFiles = UiImports.inputField.files;
  UiImports.convertingList.innerHTML = "";
  UiImports.NumberOfvideosOnList.innerText = "";
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
      UiImports.NumberOfvideosOnList.innerText = `Converter ${i + 1}`;
    } catch (error) {
      console.log(error);
    }
  }
});

let outputPath = null;

UiImports.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const inputFiles = UiImports.inputField.files;
  const outputFormat = UiImports.outputFormatField.value;

  const destination = await ipcRenderer.invoke("select-directory");
  if (!destination) return;

  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i].path;
    const output = `${inputFiles[i].name.slice(0, -4)}.${outputFormat}`;
    outputPath = path.join(destination, output);
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

  UiImports.progressVideo.innerText = "";
});
let currentConvertion = null;

ipcRenderer.on("conversion-started", (event, videoName) => {
  currentConvertion = videoName;

  UiImports.convertButton.classList.add("hiden");
  UiImports.cancelButton.classList.remove("hiden");
});

cancelButton.addEventListener("click", () => {
  ipcRenderer.send("cancel-conversion", outputPath);
});

ipcRenderer.on("canceled-video-conversion", (event, videoName) => {
  const spanTag = document.getElementById(videoName);
  UiImports.progressBar.value = 0;
  if (spanTag) {
    spanTag.classList.remove("converting");
    spanTag.classList.add("canceledvideoconversion");
  }
});

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

  UiImports.progressVideo.innerText = `Converting: ${videoName}`;
  UiImports.progressBar.value = progress.percent;
  UiImports.progressText.innerText = `${progress.percent}%`;
  UiImports.progressData.innerHTML = `
  <span>Tempo decorrido: ${progress.timemark}</span>
  `;
});

ipcRenderer.on("conversion-complete", (event, videoName, outputPath) => {
  const fileConvertedSpanTag = document.getElementById(videoName);

  UiImports.cancelButton.classList.add("hiden");
  UiImports.convertButton.classList.remove("hiden");

  UiImports.progressBar.value = 0;
  UiImports.progressText.innerHTML = "0%";
  UiImports.progressVideo.innerText = "";
  fileConvertedSpanTag.classList.remove("converting");
  fileConvertedSpanTag.classList.add("converted");

  videosOnlistForConvert.shift();
  UiImports.NumberOfvideosOnList.innerText = `Converter ${videosOnlistForConvert.length} videos`;

  addVideosConvertedOnHistory(videoName);
});

ipcRenderer.on("conversion-error", (event, videoName, error) => {
  window.alert(`Erro ao converter: ${videoName} erro: ${error}`);
});

let VideoInfoAnalysisList = [];
ipcRenderer.on("Videoinfoanalysis-started", (event, videoName) => {
  VideoInfoAnalysisList.push(videoName);

  if (VideoInfoAnalysisList.length <= 1) {
    window.alert("Analizando informaçoes dos videos");
  }
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

  UiImports.convertingList.innerHTML += item;
});

ipcRenderer.on("video-comrropido", (event, videoName, err) => {
  UiImports.inputField.value = "";
  UiImports.convertingList.innerHTML = "";
});

async function addVideosConvertedOnHistory(videoName) {
  const now = new Date().toLocaleString();

  const doc = {
    _id: generateId(),
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
  UiImports.tablevideo_list.innerHTML = "";
  if (dataArray.length > 0) {
    for (let i = 0; i < dataArray.length; i++) {
      const item = `<tr>
                        <td class="videoName">
                        <span class="converted">${dataArray[i].name}</span> </td>
                        <td class="convertVideoTime">
                        <span class="convertedAt">${dataArray[i].convertedAt}</span></td>
                    </tr>`;
      UiImports.tablevideo_list.innerHTML += item;

      if (dataArray[i] === dataArray.length - 1) {
        cb();
      }
    }
  } else {
    UiImports.tablevideo_list.innerHTML += ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
  }
}

function generateId() {
  const id = crypto.randomBytes(16).toString("hex");
  return id;
}
