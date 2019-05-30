<template>
  <v-container grid-list-lg>
    <v-layout column>
      <template v-if="isWaiting">
        <v-flex>
          <p>読み込み中...</p>
        </v-flex>
      </template>
      <template v-else>
        <template v-if="!isLogin">
          <v-flex>
            <p>この機能を使うにはログインが必要です。</p>
            <v-btn @click="twitterLogin" color="primary">Twitterでログイン</v-btn>
          </v-flex>
        </template>
        <template v-else>
          <v-flex>
            <p>{{ user.displayName }}でログイン中</p>
            <v-btn @click="logOut">ログアウト</v-btn>
          </v-flex>

          <v-flex>
            <v-card>
              <v-list>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>タイトルタイトルタイトル</v-list-tile-title>
                    <v-list-tile-sub-title>2019/05/30</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-flex>
        </template>
      </template>
    </v-layout>
  </v-container>
</template>

<script>
import firebase from "@/plugins/firebase";

export default {
  asyncData() {
    return {
      isWaiting: true,
      isLogin: false,
      user: []
    };
  },
  mounted: function() {
    firebase.auth().onAuthStateChanged(user => {
      this.isWaiting = false;
      if (user) {
        this.isLogin = true;
        this.user = user;
      } else {
        this.isLogin = false;
        this.user = [];
      }
    });
  },
  methods: {
    twitterLogin() {
      const provider = new firebase.auth.TwitterAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
    logOut() {
      firebase.auth().signOut();
    }
  }
};
</script>
