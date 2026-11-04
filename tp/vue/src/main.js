import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Galerie from './Galerie.vue'
import './style.css'

// Pinia est installée pour toute la galerie (TP 06).
// Le TP 07 monte sa propre petite application avec son routeur (src/demos/DemoBlog.vue).
createApp(Galerie).use(createPinia()).mount('#app')
