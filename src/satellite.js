import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AudioLoader, PositionalAudio } from 'three';
import { settings } from './config.js';


export async function createSatellite(camera, listener) {
    const audio = new PositionalAudio(listener);
    const loader = new GLTFLoader();
    const audioLoader = new AudioLoader();
    
    return new Promise((resolve, reject) => {
        loader.load('/models/satellite.glb', async (gltf) => {
            const satelliteMesh = gltf.scene;
            satelliteMesh.scale.set(2, 2, 2);
            satelliteMesh.position.set(-320, 10, 80);
            satelliteMesh.rotateX(Math.PI / 5);
            satelliteMesh.rotateY(Math.PI / 14);
            satelliteMesh.rotateZ(Math.PI / 3);
            satelliteMesh.castShadow = false;
            satelliteMesh.receiveShadow = false;

            const audio = new PositionalAudio(camera.children.find(c => c.type === 'AudioListener'));
            await new Promise((res, rej) => {
                audioLoader.load('/sounds/satellite.ogg', (buffer) => {
                    audio.setBuffer(buffer);
                    audio.setRefDistance(1);
                    audio.setMaxDistance(200);
                    audio.setRolloffFactor(1);
                    audio.setDistanceModel('linear');
                    audio.setLoop(true);
                    audio.setVolume(settings.volume);
                    satelliteMesh.add(audio);
                    audio.play();
                    res();
                    console.log(audio.getRolloffFactor());
                }, undefined, rej);
            });

            const volumeSlider = document.getElementById('volumeSlider');
      if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
          audio.setVolume(settings.volume);
        });
      }

            resolve(satelliteMesh);
        }, undefined, (error) => {
            reject(error);
        });
    });
}