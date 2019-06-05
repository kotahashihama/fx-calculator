import firebase from "@/plugins/firebase";

export const state = () => ({
  isWaiting: true,
  isLogin: false,
  user: [],

  editing: false,
  calculationEditing: {}
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
