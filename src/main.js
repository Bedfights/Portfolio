import * as THREE from 'three';
import { createTrack } from './track.js';
import { createCar } from './car.js';
import * as CANNON from 'cannon-es';

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
camera.lookAt(0, 0, 0);

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

  renderer.render(scene, camera);
}

animate();







/*
import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define curve path
const points = [
  new THREE.Vector3(-10, 0, 0),
  new THREE.Vector3(-5, 0, 5),
  new THREE.Vector3(0, 0, 10),
  new THREE.Vector3(5, 0, 5),
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(5, 0, -5),
  new THREE.Vector3(0, 0, -10),
  new THREE.Vector3(-5, 0, -5),
  new THREE.Vector3(-10, 0, 0),
];
const trackCurve = new THREE.CatmullRomCurve3(points);
trackCurve.closed = true;

// Use TubeGeometry to get Frenet Frames
const tube = new THREE.TubeGeometry(trackCurve, 200, 1, 8, true);
const frenetFrames = trackCurve.computeFrenetFrames(200, true);

// Create road geometry (flat ribbon)
const roadWidth = 6;
const roadGeometry = new THREE.BufferGeometry();
const positions = [];
const indices = [];

for (let i = 0; i < 200; i++) {
  const u = i / 200;
  const pos = trackCurve.getPointAt(u);
  const binormal = frenetFrames.binormals[i];

  const left = new THREE.Vector3().copy(pos).addScaledVector(binormal, -roadWidth / 2);
  const right = new THREE.Vector3().copy(pos).addScaledVector(binormal, roadWidth / 2);

  positions.push(left.x, left.y, left.z);
  positions.push(right.x, right.y, right.z);

  // Wrap final segment back to the first
  const base = i * 2;
  const nextBase = ((i + 1) % 200) * 2;
  indices.push(base, base + 1, nextBase);
  indices.push(base + 1, nextBase + 1, nextBase);
}

roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
roadGeometry.setIndex(indices);
roadGeometry.computeVertexNormals();

const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
scene.add(roadMesh);

// Add car (a green cube)
const carGeometry = new THREE.BoxGeometry(1, 0.5, 1);
const carMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const car = new THREE.Mesh(carGeometry, carMaterial);
scene.add(car);

// Animate car along path
let t = 0;

function animate() {
  requestAnimationFrame(animate);

  t = (t + 0.001) % 1;

  const pos = trackCurve.getPointAt(t);
  const tangent = trackCurve.getTangentAt(t);
  const lookAt = new THREE.Vector3().copy(pos).add(tangent);

  car.position.copy(pos);
  car.lookAt(lookAt);
  car.position.y += 0.25; // Lift the car above the road

  // Camera follows the car
  camera.position.lerpVectors(camera.position, new THREE.Vector3(
    car.position.x + 5,
    car.position.y + 5,
    car.position.z + 10
  ), 0.05);
  camera.lookAt(car.position);

  renderer.render(scene, camera);
}

animate();

*/
