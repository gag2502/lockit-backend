const functions = require('firebase-functions');
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();
const db = admin.firestore().collection("status");

// Status: close
// Status: open


app.get("/status", function (request, response) {
  db.get()
    .then(function (docs) {
      let status = [];
      docs.forEach(function (doc) {
        status.push({
          id: doc.id,
          status: doc.data().status
        })
      })
      response.json(status);
    });
})

app.post("/status", function (request, response) {
  db.add({ status: request.body.status })
    .then(function () {
      response.json({ general: "Works" });
    })
})

exports.api = functions.https.onRequest(app)

