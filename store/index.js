import firebase from "@/plugins/firebase";

export const state = () => ({
  isWaiting: true,
  isLogin: false,
  user: []
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
