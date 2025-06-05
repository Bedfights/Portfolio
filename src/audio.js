import { settings } from './config.js';

const volumeSlider = document.getElementById('volumeSlider');
volumeSlider.addEventListener('input', (event) => {
  settings.volume = parseFloat(event.target.value);
})
