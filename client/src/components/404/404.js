import './404.css';

function Error() {
    return (
        <div className="error-wrap">
            <img alt="404error" className="error-img" src={process.env.PUBLIC_URL + "/assets/404error.svg"}></img>
            <div className="error-text">Oops! The page you're trying to visit is not available..😟</div>
        </div>
    );
}

export default Error;