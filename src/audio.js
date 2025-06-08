import { settings } from './config.js';



const volumeSlider = document.getElementById('volumeSlider');
volumeSlider.addEventListener('input', (event) => {
  settings.volume = parseFloat(event.target.value);
  const theVolume = settings.volume;
  buttonSound.volume = 0.75 * theVolume;
})

const buttonSound = document.getElementById('buttonSound');
buttonSound.volume = 0.75 * volumeSlider.value;
