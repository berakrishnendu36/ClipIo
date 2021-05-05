// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "APP_NAME.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "APP_NAME.appspot.com",
    messagingSenderId: "MESSAGE_ID",
    appId: "APP_ID"
};

module.exports = { firebaseConfig };

var CACHE_NAME = 'clipio-v3_0';
var urlsToCache = ['/', '/copy'];

firebase.initializeApp(firebaseConfig);

class CustomPushEvent extends Event {
    constructor(data) {
        super('push');

        Object.assign(this, data);
        this.custom = true;
    }
}

// Install a service worker
self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            //console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

// Update a service worker
self.addEventListener('activate', (event) => {
    var cacheWhitelist = ['clipio-v3_0'];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', (e) => {
    // Skip if event is our own custom event
    if (e.custom) return;

    // Kep old event data to override
    let oldData = e.data;

    // Create a new event to dispatch, pull values from notification key and put it in data key,
    // and then remove notification key
    let newEvent = new CustomPushEvent({
        data: {
            json() {
                let newData = oldData.json();
                newData.data = {
                    ...newData.data,
                    ...newData.notification,
                };
                delete newData.notification;
                return newData;
            },
        },
        waitUntil: e.waitUntil.bind(e),
    });

    // Stop event propagation
    e.stopImmediatePropagation();

    // Dispatch the new wrapped event
    dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const notificationTitle = payload.data.title;
    //console.log("Payload: ", payload);
    const notificationOptions = {
        body: payload.data.body,
        silent: false,
        data: payload.data.clip,
        icon: "./logo192.png",
        actions: [
            { action: 'copy', title: 'Copy' },
            { action: 'visit', title: 'Visit' },
        ],
    };
    return self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

self.addEventListener('notificationclick', async (event) => {
    event.notification.close();
    //(event.notification)
    if (event.action === 'visit') {
        self.clients.openWindow('/');
    } else {
        self.clients.openWindow(
            '/copy?data=' + encodeURIComponent(event.notification.data)
        );
    }
});
