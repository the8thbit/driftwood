<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/submit">Submit</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <h1>D R I F T W O O D</h1>
    <router-view />
  </div>
</template>

<script>
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import fbCreds from "~/firebaseCredentials.js";

firebase.initializeApp({
  apiKey: fbCreds.apiKey,
  authDomain: fbCreds.authDomain,
  databaseURL: fbCreds.databaseURL,
  projectId: fbCreds.projectId,
  storageBucket: fbCreds.storageBucket,
  messagingSenderId: fbCreds.messageSenderId,
  appId: fbCreds.appId
});

firebase.auth()
  .catch(function (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`errorCode: ${errorCode}`);
    console.log(`errorMessage: ${errorMessage}`);
  })
;

export default {
  name: 'App'
}
</script>