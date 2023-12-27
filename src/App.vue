<script lang="ts" setup>
import Content from './components/content.vue'
import styleContext from './context/styleContext'
</script>

<template>
  <styleContext>
    <Content />
  </styleContext>
</template>

<style >
  html, body {
    margin: 0;
    padding: 0;
  }
</style>
