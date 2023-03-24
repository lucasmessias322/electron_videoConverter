const crypto = require("crypto");

function generateId() {
  const id = crypto.randomBytes(16).toString("hex");
  return id;
}

module.exports = { generateId };
