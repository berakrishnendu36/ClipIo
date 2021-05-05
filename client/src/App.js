import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import firebase from 'firebase/app';
import 'firebase/auth';

import Home from './pages/Home/Home';
import Copy from './pages/Copy';
import Sign from './pages/Sign/Sign';
import Loader from './components/Loader/Loader';
import Error from './components/404/404';

function App() {

  let [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        //console.log(user);
        setIsAuthorized(null);
        setTimeout(() => {
          setIsAuthorized(true);
        }, 200)
      } else {
        //console.log(user);
        setIsAuthorized(null);
        setTimeout(() => {
          setIsAuthorized(false);
        }, 600)
      }
    });
  }, []);

  return (
    <Router>
      <Switch>
        <Route path='/copy' exact component={Copy}></Route>
        <Route path='/' exact component={(isAuthorized === null) ? Loader : (isAuthorized === true) ? Home : Sign}></Route>
        <Route path='*' component={Error} ></Route>
      </Switch>
    </Router>
  );
}

export default App;
