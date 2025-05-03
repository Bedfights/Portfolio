import * as THREE from 'three';
import { createTrack } from './track.js';
import { createCar } from './car.js';
import * as CANNON from 'cannon-es';

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

// Track and car setup
const { trackCurve } = createTrack(scene);
const car = createCar(scene);

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
