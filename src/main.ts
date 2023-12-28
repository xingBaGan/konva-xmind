import { createApp } from 'vue';
import App from './App.vue';
import VueKonva from 'vue-konva';
import { createPinia } from 'pinia'
import './store'

const pinia = createPinia()
const app = createApp(App);
app.use(pinia)
app.use(VueKonva);
app.mount('#app');