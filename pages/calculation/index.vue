<template>
  <v-container grid-list-lg>
    <v-layout column>
      <template v-if="$store.state.isWaiting">
        <v-flex>
          <p>読み込み中...</p>
        </v-flex>
      </template>
      <template v-else>
        <template v-if="!$store.state.isLogin">
          <v-flex>
            <p>保存機能を使うにはログインが必要です。</p>
            <v-btn @click="$store.commit('twitterLogin')" color="primary">Twitterでログイン</v-btn>
          </v-flex>
        </template>
        <template v-else>
          <v-flex>
            <p>{{ $store.state.user.displayName }}でログイン中</p>
            <v-btn @click="$store.commit('logOut')">ログアウト</v-btn>
          </v-flex>

          <v-flex>
            <v-card>
              <v-list>
                <template v-for="(calculation, index) in calculations">
                  <v-list-tile @click="$router.push({ path: `/calculation/${calculation.id}` })">
                    <v-list-tile-content>
                      <v-list-tile-title>{{ calculation.title }}</v-list-tile-title>
                      <v-list-tile-sub-title>{{ calculation.date }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>
              </v-list>
            </v-card>
          </v-flex>
        </template>
      </template>
      {{ $data }}
    </v-layout>
  </v-container>
</template>

<script>
import firebase from "firebase";

export default {
  data() {
    return {
      calculations: []
    };
  },
  created() {
    // if (this.$store.state.isLogin) {
    firebase
      .database()
      .ref("calculations/" + this.$store.state.user.uid)
      .once("value")
      .then(result => {
        if (result.val()) {
          this.calculations = result.val();
        }
      });
    console.log(this.$store.state.user.uid);
    // }
  },
  mounted() {
    this.$store.dispatch("checkAuthentication");
  }
};
</script>
