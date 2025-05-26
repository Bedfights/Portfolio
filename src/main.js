import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createTrack } from './track.js';
import { createCar } from './car.js';
import { createCube } from './objects.js';
import { createSphere } from './objects.js';
import { createSphere2 } from './objects.js';
import { createConvexPolyhedron } from './objects.js';
import { createTrimeshFromGeometry } from './trimesh.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import CannonDebugger from 'cannon-es-debugger';

// Create physics world
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});

// Setup Three.js scene
const scene = new THREE.Scene();

// Cannon debugger
//const cannonDebugger = CannonDebugger(scene, world);

// Perspective camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);
const cameraOffset = new THREE.Vector3(0, 4, 10);

// Cube camera
const cubeRendererTarget = new THREE.WebGLCubeRenderTarget(128, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRendererTarget);
scene.add(cubeCamera);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Track
const { curve, geometry } = createTrack(scene, world); // now we have the geometry
createTrimeshFromGeometry(geometry, world);     // convert it to physics

// ************* \\
// User controls \\
// ************* \\

document.addEventListener('keydown', (event) => {
  const maxSteerVal = Math.PI / 6;
  const maxForce = 700;

  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      vehicle.applyEngineForce(maxForce, 2); // Rear Left
      vehicle.applyEngineForce(maxForce, 3); // Rear Right
      break;
    case 's':
    case 'ArrowDown':
      vehicle.applyEngineForce(-maxForce, 2);
      vehicle.applyEngineForce(-maxForce, 3);
      break;
    case 'a':
    case 'ArrowLeft':
      vehicle.setSteeringValue(maxSteerVal, 0); // Front Left
      vehicle.setSteeringValue(maxSteerVal, 1); // Front Right
      break;
    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 1);
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
    case 's':
    case 'ArrowDown':
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
      break;
    case 'a':
    case 'ArrowLeft':
    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;
  }
});

// **** \\
// Menu \\
// **** \\
let isPaused = false;
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape'){
    isPaused = !isPaused;
    const menu = document.getElementById('pauseMenu');
    menu.style.display = isPaused ? 'flex' : 'none';
  }
})
const resumeBtn = document.getElementById('resumeButton');
const mapBtn = document.getElementById('mapButton');
const xBtn = document.getElementById('xButton');
const settingsBtn = document.getElementById('settingsButton');
resumeBtn.addEventListener('click', () => {
  isPaused = false;
  const menu = document.getElementById('pauseMenu');
  menu.style.display = 'none';
});
settingsBtn.addEventListener('click', () => {
  //const settingsMenu
})




// ***** \\
// Light \\
// ***** \\

const pointLight1 = new THREE.PointLight(0xffffff, 100, 200);
pointLight1.position.set(0, 13, 0);
pointLight1.castShadow = false;
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 100, 400);
pointLight2.position.set(-250, 4, -160);
pointLight2.castShadow = false;
scene.add(pointLight2);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemiLight);

// ******* \\
// Objects \\
// ******* \\

// cubes
/*
const cube1 = createCube(world, scene, {
  size: 8,
  mass: 1,
  position: { x: -8, y: 5, z: -10 },
});
*/

// Spheres
const sphere1 = createSphere(world, scene, {
  radius: 2,
  mass: 2,
  position: { x: -4, y: 10, z: 0 },
});
const sphere2 = createSphere2(world, scene, {
  radius: 1,
  mass: 1,
  position: { x: -1, y: 6, z: -14 },
  color: 0xff0000,
});

// Text
const loaderText1 = new FontLoader(); 
loaderText1.load('/fonts/RobotoCondensed.facetype.json', (font) => {
  const textGeometryLarge = new TextGeometry('Albin', {
  font: font,
  size: 1,
  curveSegments: 12,
  bevelEnabled: false,
});
const textGeometry = textGeometryLarge.scale(1, 1, 0.01);


  const textMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    emissive: 0xffffff,
    emissiveIntensity: 0.01,
    metalness: 0.9,
    roughness: 0.05,
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(4, 5, -4);
  textMesh.rotation.set(0, 0, 0);
  scene.add(textMesh);
});

// Polyhedrons
/*
const polyh1 = createConvexPolyhedron(world, scene, {
vertices: [
        new CANNON.Vec3(-1, -1, -1), // 0
        new CANNON.Vec3(1, -1, -1),  // 1
        new CANNON.Vec3(1, 1, -1),   // 2
        new CANNON.Vec3(-1, 1, -1),  // 3
        new CANNON.Vec3(-1, -1, 1),  // 4
        new CANNON.Vec3(1, -1, 1),   // 5 
        new CANNON.Vec3(1, 1, 1),    // 6
        new CANNON.Vec3(-1, 1, 1)    // 7
    ],
    indices: [
        [0, 1, 2, 3], 
        [4, 5, 6, 7], 
        [0, 1, 5, 4], 
        [1, 2, 6, 5], 
        [2, 3, 7, 6], 
        [3, 0, 4, 7], 
    ],
  mass: 4,
  position: { x: 4, y: 6, z: -2 },
  emissive: 0xffdddd,
  emissiveIntensity: 0.1,
  metalness: 0.9,
  roughness: 0.1,
});
*/
/*
const polyh2 = createConvexPolyhedron(world, scene, {
  vertices: [
    new CANNON.Vec3(0, 1, 0),
    new CANNON.Vec3(0, -1, -1),
    new CANNON.Vec3(1, -1, 1),
    new CANNON.Vec3(-1, -1, 1)
  ],
  indices: [
    [2, 1, 0],
    [3, 2, 0],
    [1, 3, 0],
    [1, 2, 3]
  ],
  mass: 1,
  position: { x: 6, y: 6, z: 0 }
});
*/





//const cubes = [cube1];
const spheres = [ sphere1, sphere2];
const polyhedrons = [];


const reflectiveMaterial = new THREE.MeshStandardMaterial({
  metalness: 1,
  roughness: 0,
  envMap: cubeRendererTarget.texture,
  envMapIntensity: 1,
});

const reflectiveSphere = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  reflectiveMaterial
);
reflectiveSphere.position.set(3, 3, -8);
scene.add(reflectiveSphere);



// ************** \\
// Initialize car \\
// ************** \\

let vehicle, chassisBody, carGroup, carMesh;

init();
async function init() {
  // physics and scene setup...

  try {
    ({ vehicle, chassisBody, carGroup, carMesh} = await createCar(world, scene));

    // Now start animation loop with car fully loaded:
    animate(vehicle, chassisBody, carGroup, carMesh);
  } catch (error) {
    console.error('Failed to load car:', error);
  }
}

// ************** \\
// Animation loop \\
// ************** \\

const fixedTimeStep = 1.0 / 60; // seconds
const maxSubSteps = 3;

function animate(vehicle, chassisBody, carGroup, carMesh) {
  requestAnimationFrame(() => animate(vehicle, chassisBody, carGroup, carMesh));

  if (!isPaused) {
    console.log('Animating...');
    world.step(fixedTimeStep, undefined, maxSubSteps);
    //cannonDebugger.update();

    carGroup.position.copy(chassisBody.position);
    carGroup.quaternion.copy(chassisBody.quaternion);

    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i);
      const t = vehicle.wheelInfos[i].worldTransform;
    }

    // Camera look at car
    const carPos = new THREE.Vector3(
      chassisBody.position.x,
      chassisBody.position.y,
      chassisBody.position.z
    )
    camera.lookAt(carPos);

    // Camera follow car
    const rotatedOffset = cameraOffset.clone().applyQuaternion(chassisBody.quaternion);
    const cameraPos = carPos.clone().add(rotatedOffset);
    camera.position.lerp(cameraPos, 0.1);

  /*
    cubes.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  */

    spheres.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });

    polyhedrons.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });

    cubeCamera.position.copy(reflectiveSphere.position);
    cubeCamera.update(renderer, scene);
  } else if (isPaused) {
    console.log('Paused');
  }

  renderer.render(scene, camera);
}