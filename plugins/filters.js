import Vue from "vue";

Vue.filter("withDelimiter", function(value) {
  if (!value) return 0;
  return value.toLocaleString();
});
