import React, { useEffect, useState } from 'react';
function Copy() {
    let [clip, setClip] = useState(null);
    useEffect(() => {
        //console.log(new URL(window.location.href).searchParams.get("data"));
        let text = new URL(window.location.href).searchParams.get('data');
        window.navigator.clipboard
            .writeText(text)
            .then(() => {
                setClip(text);
            })
            .catch((err) => {
                alert('Not supported by your browser! ');
            });
        console.log(text);
    }, []);
    useEffect(() => {
        if (clip !== null) {
            window.close();
        }
    }, [clip]);
    const closeWindow = () => {
        if (clip !== null) {
            window.close();
        }
    };
    return (
        <div>
            <center>
                <h1>Text Copied</h1>
                <button onClick={() => closeWindow()} className="main-button">
                    Close
                </button>
            </center>
        </div>
    );
}

export default Copy;
