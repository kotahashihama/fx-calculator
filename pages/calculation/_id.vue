<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-card>
          <v-card-title>
            <div class="headline">{{ calculationViewed.title }}</div>
            <div class="grey--text">{{ calculationViewed.date }}</div>
          </v-card-title>

          <v-card-text>
            <ul>
              <li v-for="(value, name) in calculationViewed">{{ name }}: {{ value }}</li>
            </ul>
          </v-card-text>
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
      calculations: []
    };
  },
  computed: {
    calculationViewed() {
      const self = this;

      const calculationViewed = this.calculations.find(function(calculation) {
        return calculation.id === self.$route.params.id;
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
  }
};
</script>
