import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { settings } from './config.js';


export async function createSatellite(camera, listener) {
    const loader = new GLTFLoader();
    
    return new Promise((resolve, reject) => {
        loader.load('/models/satellite.glb', async (gltf) => {
            const satelliteMesh = gltf.scene;
            satelliteMesh.scale.set(2, 2, 2);
            satelliteMesh.position.set(-320, 5, 80);
            satelliteMesh.rotateX(Math.PI / 5);
            satelliteMesh.rotateY(Math.PI / 14);
            satelliteMesh.rotateZ(Math.PI / 3);
            satelliteMesh.castShadow = false;
            satelliteMesh.receiveShadow = false;
            resolve(satelliteMesh);
        }, undefined, (error) => {
            reject(error);
        });
    });
}