import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Vuetify  from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCirclePlus, faUpDownLeftRight, faFloppyDisk, faBars, faCircleInfo, faXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// アイコンをライブラリに追加
library.add(faCirclePlus, faUpDownLeftRight, faFloppyDisk, faBars, faCircleInfo, faXmark, faGear);

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia())
app.use(router)

app.use(Vuetify).mount('#app')
