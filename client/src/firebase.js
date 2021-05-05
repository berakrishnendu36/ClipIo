import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/messaging';

import { firebaseConfig } from './firebaseConfig';

const VAPID_KEY = "BPT6pvu5jQAOFQEEzqAZkQ9CYTCHDdnCwEIHuiNAaHH7-veGAoiHlOx0mcf1PnyPH4hfrVOVKaUMThBjWeECc90";

const provider = new firebase.auth.GoogleAuthProvider();
firebase.initializeApp(firebaseConfig);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


//const COLLECTION = 'smart-clip-trial';

const signUpWithEmail = async (email, password, name) => {
    //console.log(email, password, name);
    try {
        var userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);

        var user = firebase.auth().currentUser;

        await user.sendEmailVerification().then(function () {
            console.log("Email sent..");
        });

        await user.updateProfile({
            displayName: name,
        });

        return Promise.resolve(userCred);
    }
    catch (err) {
        return Promise.reject(err);
    }
}

const signInWithEmail = async (email, password) => {
    try {
        var user = await firebase.auth().signInWithEmailAndPassword(email, password);
        return Promise.resolve(user);
    }
    catch (err) {
        return Promise.reject(err);
    }
}

const signInWithGoogle = async () => {
    try {
        var res = await firebase.auth().signInWithPopup(provider);
        var user = res.user;
        return Promise.resolve(user);

    }
    catch (err) {
        return Promise.reject(err);
    }
}

const signOut = async (uid, token) => {
    firebase
        .auth()
        .signOut()
        .then(async () => {
            // setIsAuthorized(false);
            // setUserDetails(null);
            //console.log('Sign out successful');
            let resp = await db.collection('users').where("user", "==", uid).get();
            resp.forEach(async (document) => {
                let tokens = await document.data().tokens;
                //console.log(tokens);
                let newTokens = [];
                await tokens.forEach((item) => {
                    if (item !== token) {
                        newTokens.push(item);
                    }
                })
                //console.log(newTokens);
                await db.collection('users').doc(document.id).update({
                    user: uid,
                    tokens: newTokens
                })
            })
        })
        .catch((error) => {
            console.log(error);
        });

};

const getToken = async (setToken) => {

    if (firebase.messaging.isSupported()) {
        const messaging = firebase.messaging();
        return messaging.getToken({ vapidKey: VAPID_KEY }).then((currentToken) => {
            if (currentToken) {
                //console.log('current token for client: ', currentToken);
                setToken(currentToken);
                // Track the token -> client mapping, by sending to backend server
                // show on the UI that permission is secured
            } else {
                console.log('No registration token available. Request permission to generate one.');
                setToken("null");
                // shows on the UI that permission is required 
            }
        }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
            // catch error while creating client token
        });
    }

}

const addtoken = async (token, uid) => {
    try {
        let resp = await db.collection('users').where("user", "==", uid).get();
        if (resp.empty) {
            await db.collection('users').add({
                user: uid,
                tokens: [token]
            });
        }
        else {
            resp.forEach(async (document) => {
                //console.log(document.data());
                var tokens = document.data().tokens;
                if (!tokens.includes(token)) {
                    tokens.push(token);
                    await db.collection('users').doc(document.id).update({
                        user: uid,
                        tokens: tokens
                    })

                }
                else {
                    console.log("Device already registered");
                }
            })
        }

    }
    catch {

    }
}

export { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, getToken, addtoken };


