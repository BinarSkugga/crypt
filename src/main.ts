import { createApp } from 'vue'
import app from './app.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Divider from 'primevue/divider';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './assets/theme.scss';

export const fileExtentions = [
	'mp3',
	'wav',
	'aif',
	'cda',
	'mid',
	'midi',
	'mpa',
	'mkv',
	'ogg',
	'wpa',
	'wpl',
	'7z',
	'zip',
	'rar',
	'tar.gz',
	'pkg',
	'z',
	'csv',
	'dat',
	'json',
	'xml',
	'dat',
	'db',
	'dbf',
	'sql',
	'ns',
	'3ds',
	'max',
	'ai',
	'psd',
	'ttf',
	'woff',
	'woff2',
	'png',
	'bmp',
	'jpg',
	'jpeg',
	'gif',
	'tif',
	'tiff',
	'svg',
	'rss',
	'torrent',
	'ppt',
	'pps',
	'pptx',
	'odp',
	'asp',
	'c',
	'cs',
	'java',
	'jsp',
	'swift',
	'php',
	'hh',
	'go',
	'py',
	'js',
	'html',
	'xhtml',
	'css',
	'vb',
	'rb',
	'scss',
	'sass',
	'less',
	'jsx',
	'sh',
	'pl',
	'xls',
	'xlsx',
	'xlsm',
	'ods',
	'dll',
	'bak',
	'ini',
	'dmp',
	'sys',
	'cfg',
	'tmp',
	'icns',
	'doc',
	'docx',
	'log',
	'txt',
	'pdf',
	'avi',
	'mov',
	'mp4',
	'mpg',
	'mpeg',
	'mkv',
	'wmv',
	'wps',
	'exe'
]

export interface SimpleFile {
	base64: string;
	name: string;
	size: number;
	type: string;
	ext: string;
}


const vapp = createApp(app)
vapp.use(store);
vapp.use(router);
vapp.use(PrimeVue, {ripple: true})
		.component('Button', Button)
		.component('TextArea', Textarea)
		.component('Divider', Divider);

vapp.mount('#app');
