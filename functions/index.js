const functions = require("firebase-functions");
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

app.get("/currentState", function(request, response) {
  db.orderBy("date", "desc")
    .get()
    .then(function(docs) {
      let wardrobe = {};

      if (!docs.empty) {
        let doc = docs.docs[docs.size - 1];
        wardrobe = {
          status: doc.data().status,
          violated: doc.data().violated,
          locked: doc.data().locked,
          date: doc.data().date
        };
      }

      response.json(wardrobe);
    });
});

app.get("/wardrobe", function(request, response) {
  db.orderBy("date", "desc")
    .get()
    .then(function(docs) {
      let wardrobe = [];
      docs.forEach(function(doc) {
        wardrobe.push({
          id: doc.id,
          status: doc.data().status,
          violated: doc.data().violated,
          locked: doc.data().locked,
          date: doc.data().date
        });
      });
      response.json(wardrobe);
    });
});

app.post("/wardrobe", function(request, response) {
  let violatedValue = false;
  //const now = admin.firestore.Timestamp.now().toDate()
  const now = admin.firestore.FieldValue.serverTimestamp();
  const nowDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Araguaina" })
  );

  if (request.body.status == false && request.body.locked == true)
    violatedValue = true;

  const notificationPayload = {
    status: request.body.status.toString(),
    locked: request.body.locked.toString(),
    violated: violatedValue.toString(),
    date: nowDate.getTime().toString()
  };

  const payload = {
    status: request.body.status,
    locked: request.body.locked,
    violated: violatedValue,
    date: now
  };

  let notificationTitle;
  let notificationMessage;
  if (violatedValue) {
    notificationTitle = "ALERTA: Seu armário foi violado";
    notificationMessage = "Contate a segurança imediatamente";
  } else if (!request.body.status) {
    notificationTitle = "Seu armário foi aberto";
    notificationMessage = `Armário aberto às ${nowDate.getHours()}:${nowDate.getMinutes()}`;
  } else {
    notificationTitle = "Seu armário foi trancado";
    notificationMessage = `Armário trancado às ${nowDate.getHours()}:${nowDate.getMinutes()}`;
  }

  admin.messaging().sendAll([
    {
      notification: {
        title: notificationTitle,
        body: notificationMessage
      },
      apns: {
        headers: {
          "apns-priority": "10"
        }
      },

      data: notificationPayload,
      topic: "all"
    }
  ]);
  db.add(payload).then(function() {
    response.json({ message: "Success" });
  });
});

exports.api = functions.https.onRequest(app);
