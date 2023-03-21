const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const { exec } = require("child_process");

const uiElements = {
  form: document.querySelector("form"),
  inputField: document.querySelector("#input-file"),
  outputFormatField: document.querySelector("#output-format"),
  progressBar: document.querySelector("#progress-bar"),
  progressText: document.querySelector("#progress-text"),
  progressVideo: document.querySelector("#progress-video"),
  progress_bar_container: document.querySelector("#progress-bar_container"),
  convertingList: document.querySelector("#convertingList"),
  tablevideo_list: document.getElementById("video-list"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  NumberOfvideosOnList: document.getElementById("NumberOfvideosOnList"),
  convertButton: document.getElementById("convert-button"),
  cancelButton: document.getElementById("cancelButton"),
  progressData: document.getElementById("progressData"),
  btnsConvertionContainer: document.getElementById("btnsConvertionContainer"),
  coresOption: document.querySelector("#coresOption"),
  SpeedOption: document.querySelector("#SpeedOption"),
  quality: document.querySelector("#quality"),
  checkboxOpendDir: document.getElementById("checkboxOpendDir"),
};

let videosOnlistForConvert = [];
let videoHistory = [];
let VideoInfoAnalysisList = [];
let outputPath = null;
let currentConvertion = null;

const cpusInfo = os.cpus();
cpusInfo.map((item, i) => {
  const thread = i + 1;

  if (cpusInfo.length === thread) {
    coresOption.innerHTML += `<option selected value="${thread}"><span>${thread}</span></option>`;
  } else {
    coresOption.innerHTML += `<option value="${thread}"><span>${thread}</span></option>`;
  }
});

// quando tiver arquivos selecionados no inpute file ele ira exibir no html
uiElements.inputField.addEventListener("change", async () => {
  const inputFiles = uiElements.inputField.files;

  uiElements.convertingList.innerHTML = "";

  uiElements.NumberOfvideosOnList.innerText = "";
  // videosOnlistForConvert = [];
  videosOnlistForConvert = [...inputFiles];

  for (let i = 0; i < inputFiles.length; i++) {
    try {
      // Pesquisa as infomaçoes dos videos
      await ipcRenderer.invoke(
        "getVideo_information",
        inputFiles[i].name,
        inputFiles[i].path
      );

      uiElements.NumberOfvideosOnList.innerText = `${i + 1} Videos`;
    } catch (error) {
      console.log(error);
    }
  }
});

uiElements.convertButton.addEventListener("click", () => {
  const inputFiles = uiElements.inputField.files;
  videosOnlistForConvert = [...inputFiles];
  uiElements.NumberOfvideosOnList.innerText = `${videosOnlistForConvert.length} Videos`;
  console.log(videosOnlistForConvert);
});

uiElements.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const inputFiles = uiElements.inputField.files;
  const outputFormat = uiElements.outputFormatField.value;

  //coresOption, SpeedOption, quality
  let outputOptions = {
    coresOption: coresOption.value,
    SpeedOption: SpeedOption.value,
    quality: quality.value,
  };

  const destination = await ipcRenderer.invoke("select-directory");
  if (!destination) return;

  for (let i = 0; i < inputFiles.length; i++) {
    const input = inputFiles[i].path;
    const output = `${inputFiles[i].name.slice(
      0,
      -4
    )}_convert_by_ConvertHero.${outputFormat}`;
    outputPath = path.join(destination, output);
    const currentVideo = inputFiles[i].name;

    try {
      await ipcRenderer.invoke(
        "convert-video",
        currentVideo,
        input,
        outputPath,
        destination,
        outputOptions
      );
    } catch (error) {
      console.log(error);
    }
  }

  uiElements.progressVideo.innerText = "";
});

cancelButton.addEventListener("click", () => {
  ipcRenderer.send("cancel-conversion", outputPath);
});

// IPC ipcRenderer on
ipcRenderer.on("conversion-started", (event, videoName) => {
  currentConvertion = videoName;
  uiElements.convertButton.classList.add("hiden");
  uiElements.cancelButton.classList.remove("hiden");
});

ipcRenderer.on("canceled-video-conversion", (event, videoName) => {
  const divVideoItemListTag = document.getElementById(videoName);

  if (divVideoItemListTag) {
    uiElements.progressBar.value = 0;
    divVideoItemListTag.classList.remove("converting");
    divVideoItemListTag.classList.add("canceledvideoconversion");
  }
});

ipcRenderer.on("conversion-progress", (event, videoName, progress) => {
  const divVideoItemListTag = document.getElementById(videoName);
  uiElements.progress_bar_container.style.display = "flex";

  if (divVideoItemListTag) {
    if (progress.percent === 100) {
      divVideoItemListTag.classList.remove("converting");
      divVideoItemListTag.classList.add("converted");
    } else {
      divVideoItemListTag.classList.add("converting");
    }
  }

  uiElements.progressVideo.innerText = `Converting: ${videoName}`;
  uiElements.progressBar.value = progress.percent;
  uiElements.progressText.innerText = `${progress.percent}%`;
  uiElements.progressData.innerHTML = `
  <span>Tempo decorrido: ${progress.timemark}</span>
  `;
});

ipcRenderer.on("conversion-complete", (event, videoName, outputPath) => {
  const fileConvertedSpanTag = document.getElementById(videoName);

  uiElements.cancelButton.classList.add("hiden");
  uiElements.convertButton.classList.remove("hiden");

  uiElements.progressBar.value = 0;
  uiElements.progressText.innerHTML = "0%";
  uiElements.progressVideo.innerText = "";
  fileConvertedSpanTag.classList.remove("converting");
  fileConvertedSpanTag.classList.add("converted");
  uiElements.progress_bar_container.style.display = "none";

  videosOnlistForConvert.shift();
  uiElements.NumberOfvideosOnList.innerText = `${videosOnlistForConvert.length} Videos`;

  // Remova a última barra da string
  const folderPath = outputPath.slice(0, outputPath.lastIndexOf("\\"));

  //Terminou de converter todos os videos.
  if (videosOnlistForConvert <= 0) {
    console.log(videosOnlistForConvert);
    // Executa o comando do sistema operacional para abrir a pasta no explorador de arquivos
    if (uiElements.checkboxOpendDir.checked) {
      exec(`start ""  "${folderPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao abrir a pasta: ${error}`);
          return;
        }
        console.log(`Pasta aberta com sucesso: ${pastaVideos}`);
      });
    }
  }

  // addVideosConvertedOnHistory(videoName);
});

ipcRenderer.on("conversion-error", (event, videoName, error) => {
  window.alert(`Erro ao converter: ${videoName} erro: ${error}`);
});

ipcRenderer.on("Videoinfoanalysis-started", (event, videoName) => {
  VideoInfoAnalysisList.push(videoName);

  if (VideoInfoAnalysisList.length <= 1) {
    window.alert("Analizando informaçoes dos videos");
  }
});

ipcRenderer.on("videoInformation-ready", (event, videoName, videoInfo) => {
  if (videoName && videoInfo) {
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

    uiElements.convertingList.innerHTML += item;
  }
});

ipcRenderer.on("video-comrropido", (event, videoName, err) => {
  uiElements.inputField.value = "";
  uiElements.convertingList.innerHTML = ` <p >
  Adicione videos para converter clicando no botão acima "Adicionar
  videos"...
</p>`;
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

      displayHistory(videoHistory);
    }
  });
}

function loadVideoHistory() {
  consultarDb((data) => {
    videoHistory = data.map((element) => element.doc);
    displayHistory(videoHistory);
  });
}

function clearHistory() {
  deleteDbData();
  uiElements.tablevideo_list.innerHTML = ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
}

function displayHistory(dataArray = [], cb) {
  uiElements.tablevideo_list.innerHTML = "";
  if (dataArray.length > 0) {
    for (let i = 0; i < dataArray.length; i++) {
      const item = `<tr>
                        <td class="videoName">
                        <span class="converted">${dataArray[i].name}</span> </td>
                        <td class="convertVideoTime">
                        <span class="convertedAt">${dataArray[i].convertedAt}</span></td>
                    </tr>`;
      uiElements.tablevideo_list.innerHTML += item;

      if (dataArray[i] === dataArray.length - 1) {
        cb();
      }
    }
  } else {
    uiElements.tablevideo_list.innerHTML += ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
  }
}

function generateId() {
  const id = crypto.randomBytes(16).toString("hex");
  return id;
}
