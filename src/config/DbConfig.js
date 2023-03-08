const PouchDB = require('pouchdb');
const db = new PouchDB('my_database');

// db.allDocs({include_docs: true}, function(err, response) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(response.rows);
//     }
//   })

module.exports = db