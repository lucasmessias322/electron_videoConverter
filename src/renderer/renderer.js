const { ipcRenderer } = require("electron");

const form = document.querySelector("form");
const inputField = document.querySelector("#input-file");
const outputFormatField = document.querySelector("#output-format");
const convertButton = document.querySelector("#convert-button");
const progressBar = document.querySelector("#progress-bar");
const progressText = document.querySelector("#progress-text");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const input = inputField.files[0].path;
  const outputFormat = outputFormatField.value;
  const output = `${input.slice(0, -4)}.${outputFormat}`;

  const destination = await ipcRenderer.invoke("select-directory");
  if (!destination) return;

  ipcRenderer.send("convert-video", { input, output, destination });

  convertButton.disabled = true;
  progressBar.style.display = "block";
  progressBar.value = 0;
  progressText.style.display = "block";
  progressText.innerHTML = 0 + "%";
});

ipcRenderer.on("conversion-progress", (event, progress) => {
  progressBar.value = progress;
  progressText.innerHTML = Math.floor(progress) + "%";
});

ipcRenderer.on("video-converted", (event, message) => {
  alert(message);
  convertButton.disabled = false;
  progressBar.style.display = "none";
  progressText.style.display = "none";
});

ipcRenderer.on("video-convert-error", (event, error) => {
  alert(`Erro durante a conversão: ${error}`);
  convertButton.disabled = false;
  progressBar.style.display = "none";
});
