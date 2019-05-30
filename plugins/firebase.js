import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCmSYrZrVNmd6kXKduaW9TWfaCsnhuajxY",
  authDomain: "fx-calculator-9cfa1.firebaseapp.com",
  databaseURL: "https://fx-calculator-9cfa1.firebaseio.com",
  projectId: "fx-calculator-9cfa1",
  storageBucket: "fx-calculator-9cfa1.appspot.com",
  messagingSenderId: "694578164875",
  appId: "1:694578164875:web:cc3dba0d8e7d3878"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
