const moment = require("moment");

function formatDuration(durationInSeconds) {
  const durationMoment = moment.duration(durationInSeconds, "seconds");
  return (
    durationMoment.hours() +
    ":" +
    durationMoment.minutes() +
    ":" +
    durationMoment.seconds()
  );
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

module.exports = { formatDuration, formatSize };
