const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

const { sendMessage } = require('./firebase');

const port = process.env.PORT || 5000;
const index = require("./routes");

const app = express();
app.use(index);


const server = http.createServer(app);
const packetSize = 500000;

const io = socketIo(server, {
    cors: {

    }
});

io.on("connection", (socket) => {
    //console.log("New client connected");

    socket.on("join", (user) => {
        //console.log(user.uid);
        socket.broadcast.to(user.uid).emit("newConnection");
        socket.join(user.uid);
        //const clients = io.sockets.adapter.rooms.get(user.uid);
        //console.log(clients);

    })

    socket.on("Notify", async ({ uid, clip }) => {
        try {
            let resp = await sendMessage(uid, clip);
            //console.log(resp);
            socket.emit("NotificationSent");
        } catch (err) {
            //console.log(err);
            socket.emit("NotificationNotSent");
        }

    })

    socket.on("InitiateFileUpload", (msg) => {
        //console.log("Receiving: ", msg.fileName);
        const clients = io.sockets.adapter.rooms.get(msg.user);
        if (clients.size > 1) {
            socket.broadcast.to(msg.user).emit("InitiateFileReceive", msg);
        }
        else {
            setTimeout(() => {
                socket.emit("ConfirmUpload", { msg: msg, value: false });
            }, 1000);

        }

    });

    socket.on("FileUpload", async (packet, callback) => {
        //console.log("Receiving index:", packet.ind);
        await socket.broadcast.to(packet.user).emit("FileReceive", packet);
        if ((packet.ind + 1) * packetSize >= packet.size) {
            socket.broadcast.to(packet.user).emit("FinishedReceive", packet);
        }
        callback();

        //console.log("Sending packet: ", packet.ind);

    });

    socket.on("ConfirmReceive", (data) => {
        //console.log("Receive: ", data.value);
        socket.broadcast.to(data.msg.user).emit("ConfirmUpload", data);
    })

    // socket.on("FileUploadByClient", (msg) => {
    //     console.log("Received file from: ", msg.user);
    //     console.log(msg.fileName);
    //     socket.broadcast.to(msg.user).emit("FileUploadByServer", msg);
    // })

    socket.on("ClipChangeByClient", ({ data, room }) => {
        socket.broadcast.to(room).emit("ClipChangeByServer", data);
    })

    socket.on("disconnect", () => {
        //console.log("Client disconnected");
    });
});


server.listen(port, () => console.log(`Listening on port ${port}`));