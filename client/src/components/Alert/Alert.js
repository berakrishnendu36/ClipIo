import './Alert.css';

function Alert({ text }) {
    return (
        <div className="alert-box">
            <div className="alert">
                {text}
            </div>

        </div>
    );
}

export default Alert;