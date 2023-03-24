const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");
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
  windowMinimize: document.getElementById("windowMinimize"),
  windowfullScreen: document.getElementById("windowfullScreen"),
  closeWindowbtn: document.getElementById("closeWindowbtn"),
  popUpVideoAnalize: document.getElementById("popUpVideoAnalize"),
};

uiElements.closeWindowbtn.addEventListener("click", () => {
  ipcRenderer.send("closeWindow");
});
uiElements.windowfullScreen.addEventListener("click", () => {
  ipcRenderer.send("windowFullScreen");
});
uiElements.windowMinimize.addEventListener("click", () => {
  ipcRenderer.send("Windowminimize");
});

let videosOnlistForConvert = [];
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

  if (inputFiles.length > 0) {
    uiElements.convertingList.innerHTML = "";
    uiElements.popUpVideoAnalize.style.display = "flex";
    uiElements.NumberOfvideosOnList.innerText = "";
  }

  const thumbsDir = path.resolve(__dirname, "..", "..", "temp", "thumbnails");

  //Apaga as thumbnails do diretorio thumbs
  if (fs.existsSync(thumbsDir)) {
    const files = fs.readdirSync(thumbsDir);
    files.forEach((file) => {
      const filePath = path.join(thumbsDir, file);
      fs.unlinkSync(filePath);
    });
  }

  if (inputFiles.length !== 0) {
    videosOnlistForConvert = inputFiles;
    uiElements.convertingList.innerHTML = "";
    console.log("videosOnlistForConvert", videosOnlistForConvert);
  }

  if (videosOnlistForConvert.length == 0) {
    uiElements.convertingList.innerHTML = "";
  }

  for (let i = 0; i < videosOnlistForConvert.length; i++) {
    try {
      // Pesquisa as infomaçoes dos videos
      await ipcRenderer.invoke(
        "getVideo_information",
        videosOnlistForConvert[i].name,
        videosOnlistForConvert[i].path
      );

      uiElements.NumberOfvideosOnList.innerText = `${videosOnlistForConvert.length} Videos`;
    } catch (error) {
      console.log(error);
    }
  }
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

  for (let i = 0; i < videosOnlistForConvert.length; i++) {
    const input = videosOnlistForConvert[i].path;
    const output = `${videosOnlistForConvert[i].name.slice(
      0,
      -4
    )}_convert_by_ConvertHero.${outputFormat}`;
    outputPath = path.join(destination, output);

    const currentVideo = videosOnlistForConvert[i].name;

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
  // uiElements.progress_bar_container.style.display = "flex";

  if (divVideoItemListTag) {
    if (progress.percent === 100) {
      divVideoItemListTag.classList.remove("converting");
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

  uiElements.convertButton.classList.remove("hiden");
  uiElements.cancelButton.classList.add("hiden");

  uiElements.progressBar.value = 0;
  uiElements.progressText.innerHTML = "0%";
  uiElements.progressVideo.innerText = "";
  fileConvertedSpanTag.classList.remove("converting");
  fileConvertedSpanTag.classList.add("converted");
  // uiElements.progress_bar_container.style.display = "none";
  uiElements.progressData.innerHTML = "";
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
});

ipcRenderer.on("conversion-error", (event, videoName, error) => {
  window.alert(`Erro ao converter: ${videoName} erro: ${error}`);
});

ipcRenderer.on("Videoinfoanalysis-started", (event, videoName) => {
  VideoInfoAnalysisList.push(videoName);

  if (VideoInfoAnalysisList.length <= 1) {
    uiElements.popUpVideoAnalize.style.display = "flex";
  }
});

let videosForMoutOnHtml = [];
ipcRenderer.on("videoInformation-ready", (event, videoName, videoInfo) => {
  const last = videosOnlistForConvert.length - 1;
  videosForMoutOnHtml.push({ videoName, videoInfo });
  uiElements.convertingList.innerHTML = "";
  if (videosOnlistForConvert[last].name === videoName) {
    uiElements.popUpVideoAnalize.style.display = "none";
    videosForMoutOnHtml.map((elem, i) => {
      const item = `
      <div id="${elem.videoName}" class="videoItemList">
      <img src="${elem.videoInfo.image}" />
      <div class="container" >
        <span class="videoname" id="${(elem, videoName)}_videoname">
          <b>Nome do video: </b>${elem.videoName}
        </span>
        <div class="video_source">
          <ul>
            <li>
            <span class="icon"><i class="fa-solid fa-film"></i> </span>
            <span class="videoInfo" >
               ${videoName.substring(elem.videoName.length - 3)}
            </span>
            </li>
            <li>
              <span class="icon"><i class="fa-solid fa-minimize"></i> </span>
              <span class="videoInfo" >
                ${elem.videoInfo.resolution}
              </span>
            </li>
              
            <li>
            <span class="icon"><i class="fa-regular fa-clock"></i> </span>
            <span class="videoInfo" >
              ${elem.videoInfo.duration}
            </span>
            </li>
            <li>
              <span class="icon"><i class="fa-regular fa-folder"></i> </span>
              <span class="videoInfo" >
                ${elem.videoInfo.size}
              </span>
            </li>
          </ul>
        </div>
      </div>
      </div>`;

      uiElements.convertingList.innerHTML += item;
      videosForMoutOnHtml = [];
    });
  }
});

ipcRenderer.on("video-comrropido", (event, videoName, err) => {
  uiElements.inputField.value = "";
  uiElements.convertingList.innerHTML = ` <p >
  Adicione videos para converter clicando no botão acima "Adicionar
  videos"...
</p>`;
});
