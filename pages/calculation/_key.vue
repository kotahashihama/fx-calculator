<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card>
          <v-card-title primary-title>
            <div>
              <div class="headline">{{ calculationViewed.title }}</div>
              <div class="grey--text">{{ calculationViewed.date }}</div>
            </div>
          </v-card-title>

          <v-card-text>
            <ul>
              <li v-for="(value, name) in calculationViewed">{{ name }}: {{ value }}</li>
            </ul>
          </v-card-text>

          <v-card-actions>
            <v-btn flat>編集</v-btn>
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
import firebase from "firebase";

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
  },
  methods: {
    deleteCalculation(index) {
      firebase
        .database()
        .ref("calculations/" + this.$store.state.user.uid)
        .child(this.calculationViewed.key)
        .remove();

      this.$router.push({ path: `/calculation` });
    }
  }
};
</script>
