<template>
  <v-container grid-list-lg>
    <v-layout column>
      <v-flex xs12>
        <div>
          <v-btn @click="$router.push({ path: '/calculation' })">一覧へ戻る</v-btn>
        </div>
      </v-flex>

      <v-flex xs12>
        <v-card>
          <v-card-title primary-title>
            <div>
              <div class="headline">{{ calculationViewed.title }}</div>
              <div class="grey--text">{{ calculationViewed.date }}</div>
            </div>
          </v-card-title>

          <v-card-text>
            <ul>
              <li>残高 {{ calculationViewed.balance | withDelimiter }} 円</li>
              <li>ブローカー {{ calculationViewed.broker }}</li>
              <li>レバレッジ {{ calculationViewed.leverage | withDelimiter }}</li>
              <li>
                仮定レート
                <ul>
                  <li v-for="(value, key) in calculationViewed.rateExpected">{{ key }}: {{ value }}</li>
                </ul>
              </li>
              <li>ターゲット {{ calculationViewed.targetMarginLevel | withDelimiter }} ％</li>
            </ul>
          </v-card-text>

          <v-card-actions>
            <v-btn flat @click="editCalculation">編集</v-btn>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn flat color="red" v-on="on">削除</v-btn>
              </template>
              <v-card>
                <v-card-text>本当に削除してもよろしいですか？</v-card-text>

                <v-card-actions>
                  <v-btn flat @click="dialog = false">キャンセル</v-btn>
                  <v-btn flat color="red" @click="deleteCalculation">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

export default {
  data() {
    return {
      dialog: false,
      calculations: []
    };
  },
  computed: {
    calculationViewed() {
      const self = this;

      const calculationViewed = this.calculations.find(function(calculation) {
        return calculation.key === self.$route.params.key;
      });

      return calculationViewed || {};
    }
  },
  mounted() {
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

    this.$store.commit("deleteAlertOff");
  },
  methods: {
    deleteCalculation(index) {
      firebase
        .database()
        .ref("calculations/" + this.$store.state.user.uid)
        .child(this.calculationViewed.key)
        .remove();

      this.$store.commit("deleteAlertOn");
      this.$router.push({ path: "/calculation" });
    },
    editCalculation() {
      this.$store.commit("editingOn");
      this.$store.commit("reflectCalculation", this.calculationViewed);

      this.$router.push({ path: "/" });
    }
  }
};
</script>
