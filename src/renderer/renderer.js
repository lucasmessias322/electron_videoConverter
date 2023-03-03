const { ipcRenderer } = require("electron");
const path = require("path");

const form = document.querySelector("form");
const inputField = document.querySelector("#input-file");
const outputFormatField = document.querySelector("#output-format");
const progressBar = document.querySelector("#progress-bar");
const progressText = document.querySelector("#progress-text");
const progressVideo = document.querySelector("#progress-video");
const videosForConverteContainer = document.querySelector(
  "#videos_for_converte_Container"
);
const clearHistoryBtn = document.querySelector("#clearHistoryBtn");
const videoList = document.querySelector("#video-list");

let videoHistory = [];
//Passa a lista de video contida no localstorage para a variavel videoHistory
if (localStorage.getItem("videoHistory")) {
  videoHistory = JSON.parse(localStorage.getItem("videoHistory"));
}
LoadHistory();

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("videoHistory");
  videoList.innerHTML = ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
});
// quando tiver arquivos selecionados no inpute file ele ira exibir no html
inputField.addEventListener("change", async () => {
  const inputFiles = inputField.files;
  videosForConverteContainer.innerHTML = "";

  for (let i = 0; i < inputFiles.length; i++) {
    const item = `
    <div id="${inputFiles[i].name}">
      <span class="videoname" id="${inputFiles[i].name}_videoname">
        <b>Nome do video: </b>${inputFiles[i].name}
      </span>
      <span class="videoduration" id="${inputFiles[i].name}_videoduration">
       
      </span>
    </div>`;

    videosForConverteContainer.innerHTML += item;

    try {
      // Pesquisa as infomaçoes dos videos
      await getVideoInformation(inputFiles[i].name, inputFiles[i].path);
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

ipcRenderer.on("conversion-progress", (event, videoName, progress) => {
  const spanTag = document.getElementById(videoName);
  if (spanTag) {
    if (progress === 100) {
      spanTag.classList.remove("converting");
      spanTag.classList.add("converted");
    } else {
      spanTag.classList.add("converting");
    }
  }

  progressVideo.innerText = `Converting: ${videoName}`;
  progressBar.value = progress;
  progressText.innerText = `${progress}%`;
});

ipcRenderer.on("conversion-complete", (event, videoName, outputPath) => {
  const fileConvertedSpanTag = document.getElementById(videoName);
  progressBar.value = 0;
  progressText.innerHTML = "0%";
  progressVideo.innerText = "";
  fileConvertedSpanTag.classList.remove("converting");
  fileConvertedSpanTag.classList.add("converted");

  addVideosConvertedOnHistory(videoName);
});

ipcRenderer.on("conversion-error", (event, videoName, error) => {
  window.alert(`Erro ao converter: ${videoName} erro: ${error}`);
});

// retorna as infomaçoes dos videos
ipcRenderer.on("videoInformation-ready", (event, videoName, videoInfo) => {
  const videoduration = document.getElementById(`${videoName}_videoduration`);

  if (videoduration) {
    videoduration.innerHTML = `<b>Duração: </b>${videoInfo.duration}`;
  }
});

ipcRenderer.on("video-comrropido", (event, videoName, err) => {
  inputField.value = "";
  videosForConverteContainer.innerHTML = "";
});

async function getVideoInformation(videoName, videoPath) {
  return await ipcRenderer.invoke("getVideo_information", videoName, videoPath);
}

function addVideosConvertedOnHistory(videoName) {
  const now = new Date().toLocaleString();
  videoHistory.push({ name: videoName, convertedAt: now });
  localStorage.setItem("videoHistory", JSON.stringify(videoHistory));
}

function LoadHistory() {
  // Carregar o historico
  if (videoHistory.length > 0) {
    for (let i = 0; i < videoHistory.length; i++) {
      const { name, convertedAt } = videoHistory[i];
      const item = `<tr>
                        <td class="videoName">
                        <span class="converted">${name}</span> </td>
                        <td class="convertVideoTime">
                        <span class="convertedAt">${convertedAt}</span></td>
                    </tr>`;
      videoList.innerHTML += item;
    }
  } else {
    videoList.innerHTML += ` <h4>Oops! :/</h4><p>Historico vazio..</p>`;
  }
}
