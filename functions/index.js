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
          locked: doc.data().locked,
          date: doc.data().date
        })
      })
      response.json(wardrobe);
    });
})

app.post("/wardrobe", function (request, response) {
  const violatedValue = false;
  //const now = admin.firestore.Timestamp.now().toDate()
  const now = admin.firestore.FieldValue.serverTimestamp();

  if (request.body.status == false && request.body.locked == true )
      violatedValue = true;
  db.add({ status: request.body.status,
          locked: request.body.locked,
          violated: violatedValue,
          date: now })
          .then(function () {
            response.json({ message: "Success" });
          })
})

exports.api = functions.https.onRequest(app)
