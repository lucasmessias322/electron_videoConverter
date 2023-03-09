const PouchDB = require("pouchdb");
const path = require("path");
const saveDb = path.resolve("..", "..", "./my_database");
const db = new PouchDB(saveDb);

module.exports = db;
