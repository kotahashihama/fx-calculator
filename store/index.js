import firebase from "@/plugins/firebase";

export const state = () => ({
  isWaiting: true,
  isLogin: false,
  user: [],

  editing: false,
  calculationEditing: {},
  unrealizedValue: 0,

  deleteAlert: false
});

export const mutations = {
  twitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  },
  logOut() {
    firebase.auth().signOut();
  },
  waitingMutation(state) {
    state.isWaiting = false;
  },
  loginMutation(state, user) {
    state.isLogin = true;
    const { uid, displayName, photoURL } = user;
    state.user = { uid, displayName, photoURL };
  },
  notLoginMutation(state) {
    state.isLogin = false;
    state.user = [];
  },

  editingOn(state) {
    state.editing = true;
  },
  editingOff(state) {
    state.editing = false;
  },
  reflectCalculation(state, calculationEditing) {
    state.calculationEditing = calculationEditing;
  },

  checkUnrealizedValue(state, unrealizedValue) {
    state.unrealizedValue = unrealizedValue;
  },
  resetUnrealizedValue(state) {
    state.unrealizedValue = 0;
  },

  deleteAlertOn(state) {
    state.deleteAlert = true;
  },
  deleteAlertOff(state) {
    state.deleteAlert = false;
  }
};

export const actions = {
  checkAuthentication({ commit }) {
    firebase.auth().onAuthStateChanged(user => {
      commit("waitingMutation");
      if (user) {
        commit("loginMutation", user);
      } else {
        commit("notLoginMutation");
      }
    });
  }
};
