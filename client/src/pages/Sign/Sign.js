import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import './Sign.css';
import $ from 'jquery';

import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../../firebase';

import HowToUse from '../../components/HowToUse/HowToUse';

function Sign() {

    let [name, setName] = useState("");
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [errorMessage, setErrorMessage] = useState("");


    function toggleSign() {
        $(".sign-up-wrap").toggle(500, "swing");
        $(".sign-up-wrap").css("display", "flex");
        $(".sign-in-wrap").toggle(500, "swing");
    }

    const handleNameChange = (e) => {
        //console.log(e.target.value);
        setName(e.target.value);
    }

    const handleEmailChange = (e) => {
        //console.log(e.target.value);
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e) => {
        //console.log(e.target.value);
        setPassword(e.target.value);
    }

    const logUpEmail = async () => {
        if (!name) {
            setErrorMessage("Please enter your name!");
        }
        else {
            try {
                await signUpWithEmail(email, password, name);
                setErrorMessage("");
                window.location.reload();
            }
            catch (err) {
                setErrorMessage(err.message);
            }


        }

    }

    const logInEmail = () => {
        signInWithEmail(email, password).then((user) => {
            //console.log(user);
            setErrorMessage("");
        }).catch((err) => {
            //console.log(err);
            setErrorMessage(err.message);
        });
    }

    const logInGoogle = () => {
        signInWithGoogle().then((user) => {
            //console.log(user);
        }).catch((err) => {
            //console.log(err);
        })
    }


    return (
        <div>
            <div className="sign">
                <div className="sign-info">
                    <div className="hero-head">ClipIo</div>
                    <img alt="hero" className="hero-image" src={process.env.PUBLIC_URL + "/assets/clipboard.svg"}></img>
                    <div className="hero-sub">A Universal clipboard for all your devices!</div>
                </div>
                <div className="sign-wrap">

                    <div className="sign-in-wrap">
                        <div className="sign-head">Sign In</div>
                        <div className="group">
                            <input className="sign-input" onChange={handleEmailChange} id="emailIn" type="email" placeholder="Email Id" autoComplete="off" required={true}></input>
                            <span className="highlight"></span>
                            <span className="bar"></span>
                        </div>
                        <div className="group">
                            <input className="sign-input" onChange={handlePasswordChange} id="passIn" type="password" placeholder="Password" autoComplete="off"></input>
                            <span className="highlight"></span>
                            <span className="bar"></span>
                        </div>
                        <span className="sign-error">{errorMessage}</span>
                        <div className="sign-btn-wrap">
                            <button onClick={() => { logInEmail() }} className="main-button">SIGN IN</button>
                            <div onClick={() => { logInGoogle() }} className="google-btn">
                                <div className="google-icon-wrapper">
                                    <img alt="google-icon" className="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" ></img>
                                </div>
                                <p className="btn-text">Sign in with google</p>
                            </div>
                        </div>

                        <span onClick={toggleSign} className="sign-toggle sign-input">Not yet a member, register</span>

                    </div>
                    <div className="sign-up-wrap">
                        <div className="sign-head">Sign Up</div>
                        <div className="group">
                            <input className="sign-input" onChange={handleNameChange} id="nameUp" type="text" placeholder="Name" autoComplete="off"></input>
                            <span className="highlight"></span>
                            <span className="bar"></span>
                        </div>
                        <div className="group">
                            <input className="sign-input" onChange={handleEmailChange} id="emailUp" type="email" placeholder="Email Id" autoComplete="off"></input>
                            <span className="highlight"></span>
                            <span className="bar"></span>
                        </div>
                        <div className="group">
                            <input className="sign-input" onChange={handlePasswordChange} id="passUp" type="password" placeholder="Password" autoComplete="off"></input>
                            <span className="highlight"></span>
                            <span className="bar"></span>
                        </div>
                        <span className="sign-error">{errorMessage}</span>
                        <button onClick={() => { logUpEmail() }} className="main-button">SIGN UP</button>
                        <span onClick={toggleSign} className="sign-toggle sign-input">Already a member, sign in</span>
                    </div>

                </div>
            </div>
            <HowToUse />
            <div className="about">
                <div className="head-wrap">
                    <div className="about-head">About</div>
                </div>
                <div className="about-body">
                    It's often difficult to move some data from one device to another especially when we have to move something from our mobile device to PC. Here's the solution for you!!. Welcome to <b>ClipIo</b>,  the universal clipboard app that instantly transmits data from one device to another without any hassle. All you have to do is just log in with the same account from both of your devices and the app will work as you go. The simpliest user interface will say the rest to you!
                </div>
            </div>
            <a className="footer" href="https://github.com/berakrishnendu36" target="_blank" rel="noreferrer">
                View source on GitHub &nbsp; &nbsp;  <FontAwesomeIcon icon={faGithub} size="2x" />
            </a>
        </div>
    );
}

export default Sign;