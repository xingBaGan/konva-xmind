<script setup lang="ts">

import { useCounterStore } from '../store'
// import HelloWorld from "./components/HelloWorld.vue";
const config = {
  width: 500,
  height: 500,
};
const poinits = [0, 0, 70, 50, 100, 100];

const store = useCounterStore()
</script>

<template>
  <!-- welcome -->
  <!-- <v-stage :config="config">
    <v-layer>
      <v-line :points="poinits" stroke="red" :strokeWidth="2" :tension="0.5">
      </v-line> </v-layer
  ></v-stage> -->
  {{ store.count }}
</template>

<style scoped></style>
