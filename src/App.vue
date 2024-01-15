<script lang="ts" setup>
import Main from './components/Main.vue'
import styleContext from './context/styleContext'
</script>

<template>
  <styleContext>
    <Main />
  </styleContext>
</template>

<style >
  html, body {
    margin: 0;
    padding: 0;
  }
</style>
