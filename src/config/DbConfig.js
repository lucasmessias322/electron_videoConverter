const PouchDB = require("pouchdb");
const path = require("path");

const saveDb = path.resolve("..", "..", "./my_database");
const db = new PouchDB(saveDb);

async function consultarDb(cb) {
  await db.allDocs({ include_docs: true }, function (err, response) {
    if (err) {
      console.log(err);
    } else {
      cb(response.rows);
    }
  });
}

async function deleteDbData() {
  db.allDocs({ include_docs: true })
    .then(function (docs) {
      // Cria um objeto com todos os documentos e o campo _deleted definido como true
      var docsToDelete = docs.rows.map(function (row) {
        return {
          _id: row.doc._id,
          _rev: row.doc._rev,
          _deleted: true,
        };
      });

      // Deleta todos os documentos do banco de dados
      db.bulkDocs(docsToDelete)
        .then(function (result) {
          console.log("Todos os documentos foram deletados com sucesso!");
        })
        .catch(function (err) {
          console.log("Erro ao deletar documentos:", err);
        });
    })
    .catch(function (err) {
      console.log("Erro ao recuperar documentos:", err);
    });
}

module.exports = { db, consultarDb, deleteDbData };
