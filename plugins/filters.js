import Vue from "vue";

Vue.filter("withDelimiter", function(value) {
  if (!value) return "";
  return value.toLocaleString();
});
