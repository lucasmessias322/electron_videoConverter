const moment = require("moment");

function formatDurationMoment(durationInSeconds) {
  const durationMoment = moment.duration(durationInSeconds, "seconds");
  return (
    durationMoment.hours() +
    ":" +
    durationMoment.minutes() +
    ":" +
    durationMoment.seconds()
  );
}
function formatDuration(duration) {
  const seconds = Math.floor(duration % 60);
  const minutes = Math.floor(duration / 60) % 60;
  const hours = Math.floor(duration / 3600);

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

function formatSize(size) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}



module.exports = { formatDuration, formatSize, formatDurationMoment };
