const admin = require("firebase-admin");
const firebase = require('firebase');
const { firebaseConfig } = require('./firebaseConfig');

var serviceAccount = require("./firebase-credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });




const sendMessage = async (uid, clip) => {

    try {
        let tokens = []
        let ref = await db.collection('users').where("user", "==", uid).get();
        await ref.forEach(async (document) => {
            tokens = document.data().tokens;
        });

        const message = {
            notification: {
                title: "New text available",
                body: "Click to copy!"
            },
            data: {
                clip: clip
            },
            tokens: tokens,
        }

        var resp = await admin.messaging().sendMulticast(message);
        return Promise.resolve(resp.successCount + ' messages were sent successfully');
    } catch (e) {
        return Promise.reject("Error: ", e);
    }


}

module.exports = { sendMessage };



