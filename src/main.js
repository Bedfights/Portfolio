import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createTrack } from './track.js';
import { createCar } from './car.js';
import { createCube } from './objects.js';


// 1. Create physics world first
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});

const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// 2. Setup Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 5, 10);
const cameraOffset = new THREE.Vector3(10, 5, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

import CannonDebugger from 'cannon-es-debugger';
const cannonDebugger = CannonDebugger(scene, world);

// 3. Create track and car
const { trackCurve } = createTrack(scene);
const { vehicle, chassisBody, carMesh, wheelBodies, wheelMeshes } = createCar(world, scene); // Corrected return destructuring

// 4. Animation loop
const fixedTimeStep = 1.0 / 60.0; // seconds
const maxSubSteps = 3;

// Add user controls

document.addEventListener('keydown', (event) => {
  const maxSteerVal = Math.PI / 8;
  const maxForce = 100;

  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      vehicle.setWheelForce(maxForce, 0);
      vehicle.setWheelForce(maxForce, 2);
      break;
    case 's':
    case 'ArrowDown':
      vehicle.setWheelForce(-maxForce / 2, 0);
      vehicle.setWheelForce(-maxForce / 2, 2);
      break;
    case 'a':
    case 'ArrowLeft':
      vehicle.setSteeringValue(maxSteerVal, 0);
      vehicle.setSteeringValue(maxSteerVal, 2);
      break;
    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 2);
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 2);
      break;
    case 's':
    case 'ArrowDown':
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 2);
      break;
    case 'a':
    case 'ArrowLeft':
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 2);
      break;
    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 2);
      break;
  }
});

// Add light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(15, 10, 15);
scene.add(directionalLight);

//cubes
const cube1 = createCube(world, scene, {
  size: 3,
  mass: 1,
  position: { x: -20, y: 8, z: 0 },
});

const cubes = [cube1];



function animate() {
  requestAnimationFrame(animate);

  // Step physics
  world.step(fixedTimeStep, undefined, maxSubSteps);

  // Debugger
  cannonDebugger.update();

  // Sync car mesh with physics body
  carMesh.position.copy(chassisBody.position);
  carMesh.quaternion.copy(chassisBody.quaternion);

  // Sync wheels
  wheelBodies.forEach((wheelBody, i) => {
    wheelMeshes[i].position.copy(wheelBody.position);
    wheelMeshes[i].quaternion.copy(wheelBody.quaternion);
  });

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

  cubes.forEach(({ body, mesh }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  renderer.render(scene, camera);
}

animate();