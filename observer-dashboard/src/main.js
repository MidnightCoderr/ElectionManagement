import './style.css';
import { Dashboard } from './dashboard.js';

const app = document.getElementById('app');
const dash = new Dashboard(app);
dash.init();
