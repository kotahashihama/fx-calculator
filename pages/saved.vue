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
  mounted: function() {
    this.$store.dispatch("checkAuthentication");
  }
};
</script>
