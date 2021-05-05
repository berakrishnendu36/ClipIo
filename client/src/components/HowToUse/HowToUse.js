import './HowToUse.css';

function HowToUse() {
    return (
        <div className="how-wrap">
            <div className="head-wrap">
                <div className="about-head">How To Use</div>
            </div>
            <div className="how-row">
                <div className="how-image-wrap">
                    <img alt="SignIn" className="how-image" src={process.env.PUBLIC_URL + "/assets/sign_in.png"}></img>
                </div>
                <div className="how-text">
                    Sign in with the same account from both of your devices.
                </div>
            </div>
            <div className="how-row">
                <div className="how-text">
                    Whatever you enter in one device will automatically appear in all connected devices.
                </div>
                <div className="how-image-wrap">
                    <img alt="MessageView" className="how-image" src={process.env.PUBLIC_URL + "/assets/msg_view.gif"}></img>
                </div>

            </div>
            <div className="how-row">

                <div className="how-image-wrap">
                    <img alt="CacheView" className="how-image" src={process.env.PUBLIC_URL + "/assets/cache.gif"}></img>
                </div>
                <div className="how-text">
                    One click to save your clipboard text for future use. <b>All of your data is saved only in your device so that you need not worry about security issues.</b>
                </div>
            </div>
            <div className="how-row">
                <div className="how-text">
                    Instant notifications to quickly transfer clipboard text from one device to another.
                </div>
                <div className="how-image-wrap">
                    <img alt="Notifications" className="how-image" src={process.env.PUBLIC_URL + "/assets/notification.gif"}></img>
                </div>

            </div>
            <div className="how-row">

                <div className="how-image-wrap">
                    <img alt="FileService" className="how-image" src={process.env.PUBLIC_URL + "/assets/file_sending.gif"}></img>
                </div>
                <div className="how-text">
                    Transfer files of upto 200MB from one device to another without any hassle..<br></br><br></br><p>*Transfer speed depends on your network connection!</p>
                </div>
            </div>
            <div className="how-row">
                <div className="how-text">
                    <b>PWA Verified</b> <br></br>One click to install it on your Mobile and PC
                </div>
                <div className="how-image-wrap">
                    <img alt="Chrome" className="how-image" src={process.env.PUBLIC_URL + "/assets/pwa.png"}></img>
                </div>
            </div>
            <div className="how-row">

                <div className="how-image-wrap">
                    <img alt="Chrome" className="how-image" src={process.env.PUBLIC_URL + "/assets/chrome.png"}></img>
                </div>
                <div className="how-text">
                    <b>Works best with Chrome</b> <br></br>Chrome is recommended for a enhanced user experience.
                </div>
            </div>
        </div>
    );
}

export default HowToUse;