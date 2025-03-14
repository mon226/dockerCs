import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vuetify  from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { library, type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCirclePlus, faUpDownLeftRight, faFloppyDisk, faBars, faCircleInfo, faXmark, faGear, faFolder, faPalette, faPlus, faPenToSquare, faDownload } from '@fortawesome/free-solid-svg-icons';
import {  } from '@fortawesome/free-regular-svg-icons';

library.add(
  faCirclePlus, faUpDownLeftRight, faFloppyDisk, faBars,
  faCircleInfo, faXmark, faGear, faFolder, faPalette, faPlus, faPenToSquare, faDownload as IconDefinition
);
const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia())
app.use(router)

app.use(Vuetify).mount('#app')