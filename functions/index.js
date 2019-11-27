const functions = require('firebase-functions');
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();
const db = admin.firestore().collection("wardrobe");


// Status: closed - true
// Status: open - false

// Violated: yes - true
// Violated: not - false

// Locked: yes - true
// Locked: not - false


app.get("/wardrobe", function (request, response) {
  db.get()
    .then(function (docs) {
      let wardrobe = [];
      docs.forEach(function (doc) {
        wardrobe.push({
          id: doc.id,
          status: doc.data().status,
          violated: doc.data().violated,
          locked: doc.data().locked
        })
      })
      response.json(wardrobe);
    });
})

app.post("/wardrobe", function (request, response) {
  db.add({ status: request.body.status })
  db.add({ locked: request.body.locked })
   if (request.body.status == true && request.body.locked == true )
      db.add({ violated: false })
      .then(function () {
        response.json({ message: "Close" });
      })
    if (request.body.status == true && request.body.locked == false )
      db.add({ violated: false })
      .then(function () {
        response.json({ message: "Open" });
      })
    if (request.body.status == false && request.body.locked == true )
      db.add({ violated: true })
      .then(function () {
        response.json({ message: "Violated" });
      })

})

exports.api = functions.https.onRequest(app)
