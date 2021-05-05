// // Scripts for firebase and firebase messaging
// importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// // Initialize the Firebase app in the service worker by passing the generated config
// const firebaseConfig = {
//     apiKey: "AIzaSyCgPqmohf85BLwA0DnjpDAUzqo2T4KM9AU",
//     authDomain: "smart-clip-1fadb.firebaseapp.com",
//     projectId: "smart-clip-1fadb",
//     storageBucket: "smart-clip-1fadb.appspot.com",
//     messagingSenderId: "291442386830",
//     appId: "1:291442386830:web:3bbb9a99c9fc87ad5c66df"
// };

// var CACHE_NAME = 'pwa-task-manager';
// var urlsToCache = [
//     '/'
// ];

// firebase.initializeApp(firebaseConfig);

// class CustomPushEvent extends Event {
//     constructor(data) {
//         super('push')

//         Object.assign(this, data)
//         this.custom = true
//     }
// }

// // Install a service worker
// self.addEventListener('install', event => {
//     // Perform install steps
//     event.waitUntil(
//         caches.open(CACHE_NAME)
//             .then(function (cache) {
//                 console.log('Opened cache');
//                 return cache.addAll(urlsToCache);
//             })
//     );
// });

// // Cache and return requests
// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function (response) {
//                 // Cache hit - return response
//                 if (response) {
//                     return response;
//                 }
//                 return fetch(event.request);
//             }
//             )
//     );
// });

// // Update a service worker
// self.addEventListener('activate', event => {
//     var cacheWhitelist = ['pwa-task-manager'];
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames.map(cacheName => {
//                     if (cacheWhitelist.indexOf(cacheName) === -1) {
//                         return caches.delete(cacheName);
//                     }
//                 })
//             );
//         })
//     );
// });

// /*
//  * Overrides push notification data, to avoid having 'notification' key and firebase blocking
//  * the message handler from being called
//  */
// self.addEventListener('push', (e) => {
//     // Skip if event is our own custom event
//     if (e.custom) return;

//     // Kep old event data to override
//     let oldData = e.data

//     // Create a new event to dispatch, pull values from notification key and put it in data key, 
//     // and then remove notification key
//     let newEvent = new CustomPushEvent({
//         data: {
//             json() {
//                 let newData = oldData.json()
//                 newData.data = {
//                     ...newData.data,
//                     ...newData.notification
//                 }
//                 delete newData.notification
//                 return newData
//             },
//         },
//         waitUntil: e.waitUntil.bind(e),
//     })

//     // Stop event propagation
//     e.stopImmediatePropagation()

//     // Dispatch the new wrapped event
//     dispatchEvent(newEvent)
// })

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//     const notificationTitle = payload.data.title;
//     const notificationOptions = {
//         body: payload.data.body,
//         icon: payload.data.icon,
//         data: payload.data
//     };
//     return self.registration.showNotification(notificationTitle,
//         notificationOptions);
// });

// self.addEventListener('notificationclick', async (event) => {

//     // if (!event.clientId) return;
//     // const client = await clients.get(event.clientId);
//     // if (!client) return;

//     await self.clients.openWindow('/');
//     if (confirm("Copy received text?")) {
//         console.log(event.notification);
//     }
//     else {

//     }


//     event.notification.close()
// });