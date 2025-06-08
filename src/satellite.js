import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AudioLoader, PositionalAudio } from 'three';
import { settings } from './config.js';

let satelliteSound;

export async function createSatellite(listener) {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load('/models/satellite.glb', (gltf) => {
      const satelliteMesh = gltf.scene;
      satelliteMesh.scale.set(2, 2, 2);
      satelliteMesh.position.set(-320, 5, 80);
      satelliteMesh.rotateX(Math.PI / 5);
      satelliteMesh.rotateY(Math.PI / 14);
      satelliteMesh.rotateZ(Math.PI / 3);
      satelliteMesh.castShadow = false;
      satelliteMesh.receiveShadow = false;

      // Create positional audio and add it to satellite mesh
      const audioLoader = new AudioLoader();
      satelliteSound = new PositionalAudio(listener);

      audioLoader.load('/sounds/satellite.ogg', (buffer) => {
        satelliteSound.setBuffer(buffer);
        satelliteSound.setRefDistance(20);
        satelliteSound.setMaxDistance(100);
        satelliteSound.setRolloffFactor(1);
        satelliteSound.setDistanceModel('linear');
        satelliteSound.setLoop(true);
        satelliteSound.setVolume(settings.volume);
      });

      satelliteMesh.add(satelliteSound);

      resolve(satelliteMesh);
    }, undefined, (error) => {
      reject(error);
    });
  });
}
export { satelliteSound };
