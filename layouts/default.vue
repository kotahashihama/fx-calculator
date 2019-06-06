<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" fixed app>
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar>
            <v-list-tile-avatar v-if="$store.state.isLogin">
              <img :src="$store.state.user.photoURL">
            </v-list-tile-avatar>
            <v-list-tile-avatar v-else>
              <img src="https://randomuser.me/api/portraits/men/85.jpg">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title v-if="$store.state.isLogin">{{ $store.state.user.displayName }}</v-list-tile-title>
              <v-list-tile-title v-else>ゲスト</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-divider></v-divider>

      <v-list>
        <v-list-tile v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"/>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      :clipped-left="clipped"
      fixed
      app
      :class="[this.$store.state.unrealizedValue < 0 ? 'toolbar--red' : 'toolbar--blue']"
    >
      <v-toolbar-side-icon @click="drawer = !drawer" class="icon--white"/>
      <v-toolbar-title v-text="title"/>
      <v-spacer/>
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      items: [
        {
          icon: "computer",
          title: "計算機",
          to: "/"
        },
        {
          icon: "storage",
          title: "保存済み",
          to: "/calculation"
        },
        {
          icon: "help",
          title: "このアプリについて",
          to: "/about"
        }
      ],
      miniVariant: false,
      title: "ポジション計算機"
    };
  },
  mounted: function() {
    this.$store.dispatch("checkAuthentication");
  }
};
</script>

<style lang="scss" scoped>
.toolbar--red {
  background: #f84444 !important;
  color: #fff !important;
}

.toolbar--blue {
  background: #007aff !important;
  color: #fff !important;
}

.icon--white {
  color: #fff !important;
}
</style>
