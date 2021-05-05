import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import $ from 'jquery';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCopy, faBackspace } from '@fortawesome/free-solid-svg-icons';

import Alert from '../../components/Alert/Alert';

import { signOut } from '../../firebase'
import { getToken, addtoken } from '../../firebase';

import socketIOClient from "socket.io-client";
//const ENDPOINT = "https://boiling-headland-46561.herokuapp.com";
//const ENDPOINT = "http://localhost:5000";
const ENDPOINT = "https://clipio-backend.azurewebsites.net";

function Cache({ id, text, copyFn, deleteFn }) {
    return (
        <div className="cache">
            <div className="cache-text">{text}</div>
            <div className="cache-actions">
                <button onClick={() => copyFn(text)} className="cache-icon"><FontAwesomeIcon
                    icon={faCopy}
                /></button>
                <button onClick={() => deleteFn(id)} className="cache-icon"><FontAwesomeIcon
                    icon={faTrash}
                /></button>
            </div>
        </div>
    );
}

function ProgressBar() {
    return (
        <div className="progress-wrap" id="progress-wrap">
            <div className="progress-title" id="progress-title-main"></div>
            <div className="progress">
                <div className="p-bar" id="progress-bar" style={{ width: 5 }}>
                </div>
            </div>
        </div>
    )
}

const CacheList = React.memo(function CacheHistory({ clipHistory, copyToClipBoard, deleteCache }) {
    return clipHistory.map((data) => (
        <Cache key={data.id} id={data.id} text={data.text} copyFn={copyToClipBoard} deleteFn={deleteCache} />
    ))
})


function Home() {

    const [isOnline, setIsOnline] = useState(null)
    const [alertBox, setAlertBox] = useState(null)
    let [socket, setSocket] = useState(null);
    let [clipValue, setClipValue] = useState("");
    let [clipHistory, setClipHistory] = useState(() => []);
    let [user, setUser] = useState(null);
    let [room, setRoom] = useState(null);
    let [token, setToken] = useState(null);
    let [activeConnections, setActiveConn] = useState(0);
    const [btnMessage, setBtnMessage] = useState("COPY TO CLIPBOARD");
    const [windowHeight, setWindowHeight] = useState(0);
    //let [fileData, setFileData] = useState(null);
    let [file, setFile] = useState([]);
    const [fileToUpload, setfileToUpload] = useState(null);
    const [confirmUpload, setconfirmUpload] = useState(null);
    const [progressRef, setProgressRef] = useState(null);
    const [progressTitleRef, setProgressTitleRef] = useState(null);
    const [packetSize, setPacketSize] = useState(0);
    const maxCache = 10;




    useEffect(() => {
        setClipValue(window.localStorage.getItem("tempClip") == null ? "" : window.localStorage.getItem("tempClip"));

        if ((navigator.userAgent.indexOf("Safari") > -1) && !(navigator.userAgent.indexOf("Chrome") > -1)) {
            console.log("Notification system not supported in safari!");
        }
        else {
            if (Notification.permission === "default") {
                setAlertBox(<Alert text="Allow access to notifications to instantly receive clip text." />);
                setTimeout(() => {
                    Notification.requestPermission().then((resp) => {
                        if (resp == "default") {
                            setTimeout(() => {
                                setAlertBox(<Alert text="Check the notification icon in the addredd bar!" />);
                                Notification.requestPermission();
                            }, 3000);

                        }
                    });
                }, 3000);
            }
            else if (Notification.permission === "denied") {
                setAlertBox(<Alert text="Access to notifications has been denied. You won't receive instant clip text. To revert, change your settings.." />)
            }
        }

        setWindowHeight(window.innerHeight);
        setSocket(socketIOClient(ENDPOINT));
        setPacketSize(500000);
        setClipHistory(JSON.parse(window.localStorage.getItem("clipHistory")) == null ? [] : JSON.parse(window.localStorage.getItem("clipHistory")));
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log(user);
                setUser(user);
                getToken(setToken);
            } else {
                setUser(null);
                setRoom(null);
            }
        });
        setProgressRef(document.getElementById("progress-bar"));
        setProgressTitleRef(document.getElementById("progress-title-main"));
        window.addEventListener("online", () => {
            setIsOnline(true);
        })
        window.addEventListener("offline", () => {
            setIsOnline(false);
        })
    }, [])

    useEffect(() => {
        if (alertBox) {
            $(".alert").slideDown(500, "swing");
            setTimeout(() => {
                $(".alert").slideUp(300);
            }, 3500)
        }
    }, [alertBox])

    useEffect(() => {
        //console.log("Online:", isOnline);
        if (isOnline) {
            setSocket(socketIOClient(ENDPOINT));
            if (file !== []) {
                setFile([])
                file = []
                socket.emit("ConfirmReceive", { msg: { user: user.uid }, value: false });
                window.localStorage.setItem("tempClip", clipValue);
                sleep(300).then(() => {
                    $(".progress-wrap").fadeTo(200, 0.05);
                    progressTitleRef.innerHTML = "";
                    progressRef.style.width = "0px";
                })
                sleep(500).then(() => {
                    window.location.reload();
                })
            }
        }
        else if (isOnline == false) {
            setAlertBox(<Alert text="Connection to server lost!! Please check your network connection." />)

        }
    }, [isOnline]);

    useEffect(() => {
        setFile([]);
        if (socket) {
            socket.on("ClipChangeByServer", (value) => {
                setClipValue(value);
            })

        }
        if (socket && user) {
            socket.emit("join", user);
            setRoom(user.uid);
            socket.on("newConnection", () => {
                setActiveConn((xconn) => xconn + 1);
            })
            socket.on("NotificationSent", () => {
                document.getElementById("notify").disabled = false;
            })
            socket.on("NotificationNotSent", () => {
                document.getElementById("notify").disabled = false;
                setAlertBox(<Alert text="No devices connected!" />);
            })

            //#-#-#-# Initiating and confirming receive of files! #-#-#-#//
            socket.on("InitiateFileReceive", (msg) => {
                if (window.confirm("Receive file " + msg.fileName + "?")) {
                    socket.emit("ConfirmReceive", { msg, value: true });
                    progressTitleRef.innerHTML = "Receiving File"
                    $(".progress-wrap").fadeTo(200, 1);
                }
                else {
                    socket.emit("ConfirmReceive", { msg, value: false });
                }
            });

            //#-#-#-# Receiving files from server #-#-#-#//
            socket.on("FileReceive", async (packet) => {
                let newFile = file;
                newFile.push(packet);
                setFile(newFile);
                progressRef.style.width = (300 * (packet.ind * packetSize / packet.size)) + "px";
            })

            //#-#-#-# Finished receiving files #-#-#-#
            socket.on("FinishedReceive", async (data) => {
                try {
                    console.log("Received file: ", data.fileName);
                    let newFile = file;
                    newFile.sort((x, y) => x.ind > y.ind ? 1 : -1);
                    let completeFile = "";
                    for (let i = 0; i < newFile.length; i++) {
                        completeFile += newFile[i].buf;
                    }
                    var byteString = atob(completeFile.split(',')[1]);
                    var mimeString = completeFile.split(',')[0].split(':')[1].split(';')[0];
                    var ab = new ArrayBuffer(byteString.length);
                    var ia = new Uint8Array(ab);
                    for (var i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    var blob = new Blob([ab], { type: mimeString });
                    saveAs(blob, data.fileName);
                    setFile([])
                    file = []
                    window.localStorage.setItem("tempClip", clipValue);
                    sleep(300).then(() => {
                        $(".progress-wrap").fadeTo(200, 0.05);
                        progressTitleRef.innerHTML = "";
                        progressRef.style.width = "0px";
                    })
                    sleep(500).then(() => {
                        window.location.reload();
                    })
                } catch (err) {
                    setAlertBox(<Alert text="Some error has occured in receiving the file. PLease try again!" />)
                    window.localStorage.setItem("tempClip", clipValue);
                    sleep(1500).then(() => {
                        window.location.reload();
                    })
                }

            })

            //#-#-#-# Handling file input #-#-#-#
            $('#file').on('change', async (e) => {
                //console.log("File changed event: ", e.originalEvent);
                var data = e.originalEvent.target.files[0];
                if (e.originalEvent.target.files.length > 1) {
                    generateAndSendZip(e.originalEvent.target.files);
                }
                else {
                    readThenSendFile(data);
                }
            });

        }
    }, [socket, user]);

    //#-#-#-# Changing TextArea height #-#-#-#
    useEffect(() => {
        if (windowHeight !== 0) {
            var textarea = document.getElementById("clipText");
            textarea.addEventListener('input', () => {
                if (textarea.scrollHeight < windowHeight * 0.4) {


                    textarea.style.height = textarea.scrollHeight + 'px';
                }
                else {
                    textarea.style.height = windowHeight * 0.4;
                }
            });
        }
    }, [windowHeight])

    //#-#-#-# Adding Client token to database for background notifications #-#-#-#
    useEffect(() => {
        if (user && !user.emailVerified) {
            const created = new Date(user.metadata.creationTime).getTime();
            const current = new Date().getTime();
            let passed = (current - created) / (1000 * 60 * 60 * 24);
            if (passed > 2) {
                setAlertBox(<Alert text="Your email is not yet verified! Please log in after verification!" />);
                // console.log("Token: ", token);
                // console.log("User: ", user.uid);
                setTimeout(() => {
                    document.getElementById("log-out").click();
                }, 10000);
            }
            else {
                setAlertBox(<Alert text="You have not verified your email. Check your email for verification to continue using our services. Verify with 48 hours!" />)
            }
        }
        if (token !== null && user !== null) {
            addtoken(token, user.uid);
        }
    }, [token, user])

    //#-#-#-# Emitting TextArea value when a new client is connected #-#-#-#
    useEffect(() => {
        if (socket && user) {
            setTimeout(() => {
                socket.emit("ClipChangeByClient", { data: clipValue, room: user.uid })
            }, 200);
        }
    }, [activeConnections])

    //#-#-#-# Storing clipHistory to local storage #-#-#-#
    useEffect(() => {
        window.localStorage.setItem("clipHistory", JSON.stringify(clipHistory));

    }, [clipHistory])

    useEffect(() => {
        if (socket && fileToUpload) {
            socket.emit('InitiateFileUpload', fileToUpload.msg);
            $(".progress-wrap").fadeTo(200, 1);
            progressTitleRef.innerHTML = "Uploading File"

            console.log("File upload initiated");
            socket.on("ConfirmUpload", (data) => {
                setconfirmUpload(data);
                console.log("Confirm Upload: ", data);
            })
        }
    }, [socket, fileToUpload])

    useEffect(() => {
        if (confirmUpload && fileToUpload) {
            if (confirmUpload.value) {
                uploadFile(fileToUpload.msg, fileToUpload.file, 0);
                console.log("Upload Confirmed");
            }
            else {
                progressTitleRef.innerHTML = "Upload Rejected";
                setAlertBox(<Alert text="Accept file on other device and make sure that both the devices are connected" />)
                window.localStorage.setItem("tempClip", clipValue);
                sleep(500).then(() => {
                    $(".progress-wrap").fadeTo(200, 0.05);
                    progressTitleRef.innerHTML = ""
                    window.location.reload();
                })
                console.log("Upload Rejected");
            }
            setfileToUpload(null);
        }
        else if (confirmUpload && !confirmUpload.value) {
            $(".progress-wrap").fadeTo(200, 0.05);
        }
        setconfirmUpload(null);
    }, [confirmUpload, fileToUpload])

    const sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    const generateAndSendZip = async (files) => {
        let zip = new JSZip();
        let totalSize = 0;
        for (let file of files) {
            let filename = file.name;
            totalSize += file.size;
            zip.file(filename, file)
        }
        if (totalSize > 209715200) {
            setAlertBox(<Alert text="Total size must be less than 200MB" />);
            return
        }
        zip.generateAsync({ type: 'blob' }).then((data) => {
            var reader = new FileReader();
            reader.onload = async function (evt) {
                var msg = {};
                msg.user = user.uid;
                msg.fileName = "clipio_compressed.zip";
                msg.size = evt.target.result.length;
                setfileToUpload({
                    msg: msg,
                    file: evt.target.result
                })
            }
            reader.readAsDataURL(data);
        })
    }

    const readThenSendFile = async (data) => {

        var reader = new FileReader();
        if (data) {
            if (data.size > 209715200) {
                setAlertBox(<Alert text="File size must be less than 200MB" />);
                return
            }
            else {
                reader.onload = async function (evt) {
                    //console.log("Evt: ", evt);
                    var msg = {};
                    msg.user = user.uid;
                    msg.fileName = data.name;
                    msg.size = evt.target.result.length;
                    setfileToUpload({
                        msg: msg,
                        file: evt.target.result
                    })
                };
                reader.readAsDataURL(data);
            }
        }
    }


    const uploadFile = async (data, buffer, ind) => {

        const size = buffer.length;
        let len = parseInt(size / packetSize);
        //console.log("Index: ", ind, "Len: ", len);
        let packet = {
            size: size,
            fileName: data.fileName,
            user: data.user,
            ind: ind,
            buf: buffer.substring(ind * packetSize, ((ind + 1) * packetSize))
        }
        await socket.emit("FileUpload", packet, () => {
            progressRef.style.width = (300 * ((ind * packetSize) / size)) + "px";
            if (ind < len) {
                uploadFile(data, buffer, (ind + 1));
            }
            else {
                window.localStorage.setItem("tempClip", clipValue);
                console.log("Finished uploading!!");
                sleep(300).then(() => {
                    $(".progress-wrap").fadeTo(200, 0.05);
                    progressTitleRef.innerHTML = "";
                    progressRef.style.width = "0px";
                })
                sleep(500).then(() => {
                    window.location.reload();
                })
            }

        });
    }

    const notifyUsers = async () => {
        if (socket && user) {
            if (clipValue !== "") {
                socket.emit("Notify", { uid: user.uid, clip: clipValue })
                document.getElementById("notify").disabled = true;
                // setTimeout(() => {
                //     document.getElementById("notify").disabled = false;
                // }, 10000)
            }
            else {
                setAlertBox(<Alert text="TextArea is empty!" />)
            }
        }
    }

    const handleChange = (e) => {
        setClipValue(e.target.value);
        socket.emit("ClipChangeByClient", { data: e.target.value, room });
    }

    const copyToClipBoard = (text) => {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    const pasteFromClip = () => {
        //alert(navigator.userAgent);
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            navigator.clipboard.readText().then((text) => {
                setClipValue(text);
                socket.emit("ClipChangeByClient", { data: text, room });
            }).catch((e) => {
                setAlertBox(<Alert text="Please allow clipboard permission to use this feature!" />)
            });

        }
        else {
            document.getElementById("clipText").innerHTML = ""
            var pasteText = document.getElementById("clipText");
            pasteText.focus();
            document.execCommand("paste");
            let pasted = false;
            while (pasted === false) {
                if (document.getElementById("clipText").innerHTM !== "") {
                    pasted = true;
                    socket.emit("ClipChangeByClient", { data: document.getElementById("clipText").innerHTM, room });
                }
            }

        }
    }

    const addToCache = () => {
        if (clipValue === "") {
            return;
        }
        else if (clipHistory.some(el => el.text === clipValue)) {
            return
        }
        else {
            setClipHistory((old) => [
                {
                    id: Date.now(),
                    text: clipValue
                },
                ...old.slice(0, Math.min(maxCache - 1, old.length))
            ]);
        }

    }
    const deleteCache = (id) => {
        setClipHistory((old) => old.filter((item) => item.id !== id));
    }

    const clearText = () => {
        setClipValue("");
        socket.emit("ClipChangeByClient", { data: "", room });
    }



    return (
        <div>
            {alertBox}
            <div className="nav">
                <button onClick={() => { signOut(user.uid, token) }} id="log-out" className="cache-button">Log Out</button>

                <input type="file" name="file" id="file" className="input-file" multiple></input>
                <label htmlFor="file" className="input-label">Send File</label>

                <button id="notify" onClick={() => { notifyUsers() }} className="cache-button">Notify</button>
            </div>
            <h1 className="title">Heyy, {user !== null ? (user.displayName.split(' ')[0]) : 'Friend'}</h1>

            <div className="wrapper">

                <div className="main-text">
                    <div className="group">
                        <textarea id="clipText" type="text" placeholder="Paste/Copy text from here.." autoComplete="off" value={clipValue} onChange={handleChange}></textarea>
                        <span className="highlight"></span>
                        <span className="bar"></span>
                    </div>
                    <button onClick={clearText} className="cache-icon"><FontAwesomeIcon
                        icon={faBackspace}
                    /></button>
                </div>
                <div className="button-wrap">
                    <button onClick={() => {
                        copyToClipBoard(clipValue)
                        setBtnMessage("COPIED !")
                        setTimeout(() => {
                            setBtnMessage("COPY TO CLIPBOARD")
                        }, 2000);
                    }} className="main-button">{btnMessage}</button>
                    <button onClick={addToCache} className="main-button">ADD TO CACHE</button>
                    <button onClick={pasteFromClip} className="main-button">PASTE FROM CLIPBOARD</button>
                </div>

            </div>
            <h3 className="title">Your Clip History</h3>
            <div className="cache-wrap">
                <CacheList clipHistory={clipHistory} copyToClipBoard={copyToClipBoard} deleteCache={deleteCache} />
            </div>
            {<ProgressBar />}
        </div>
    );
}

export default Home;