import { createApp } from 'vue';
import App from './App.vue';
import VueKonva from 'vue-konva';
import { createPinia } from 'pinia'
import './store'
import data from '../data2.json';

const pinia = createPinia()
const app = createApp(App, {
  data,
});
app.use(pinia)
app.use(VueKonva);
app.mount('#app');