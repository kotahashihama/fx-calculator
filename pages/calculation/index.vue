<template>
  <v-container grid-list-lg>
    <v-layout column>
      <v-flex xs12>
        <template v-if="$store.state.isWaiting">
          <p>読み込み中...</p>
        </template>
        <template v-else>
          <template v-if="!$store.state.isLogin">
            <p>保存機能を使うにはログインが必要です。</p>
            <v-btn @click="$store.commit('twitterLogin')" color="primary">Twitterでログイン</v-btn>
          </template>
          <template v-else>
            <p>{{ $store.state.user.displayName }}でログイン中</p>
            <v-btn @click="$store.commit('logOut')">ログアウト</v-btn>
            <v-btn @click="$router.push({ path: `/`})" color="primary">計算する</v-btn>
          </template>
        </template>
      </v-flex>

      <v-flex xs12>
        <template v-if="!$store.state.isWaiting">
          <v-card>
            <v-list>
              <div v-for="(calculation, index) in calculations" :key="calculation.key">
                <v-list-tile @click="$router.push({ path: `/calculation/${calculation.key}` })">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ calculation.title }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ calculation.date }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </div>
            </v-list>
          </v-card>
        </template>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import firebase from "firebase";

export default {
  data() {
    return {
      alert: false,
      calculations: []
    };
  },
  mounted() {
    this.$store.dispatch("checkAuthentication");
  },
  beforeUpdate() {
    firebase
      .database()
      .ref("calculations/")
      .once("value")
      .then(result => {
        if (result.val()) {
          this.calculations = Object.values(
            result.val()[this.$store.state.user.uid]
          );
        }
      });
  }
};
</script>
