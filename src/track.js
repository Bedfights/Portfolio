import * as THREE from 'three';
import { createTrimeshFromGeometry } from './trimesh.js';

export function createTrack(scene, world) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(10, 1, -180),
    new THREE.Vector3(-80, 2, -200),
    new THREE.Vector3(-100, 2, -160),
    new THREE.Vector3(-70, 3, -90),
    new THREE.Vector3(-100, 4, -70),
    new THREE.Vector3(-160, 5, -140),
    new THREE.Vector3(-150, 4, -220),
    new THREE.Vector3(-200, 4, -230),
    new THREE.Vector3(-250, 3, -160),
    new THREE.Vector3(-200, 2, -40),
    new THREE.Vector3(-148, 1, -30),
    new THREE.Vector3(-130, 1, 0),
    new THREE.Vector3(-154, 1, 30),
    new THREE.Vector3(-230, 1, 75),
    new THREE.Vector3(-210, 1, 140),
    new THREE.Vector3(-120, 1, 130),
    new THREE.Vector3(-80, 1, 180),
    new THREE.Vector3(0, 1, 180)
  ], false, 'catmullrom', 0.5);

  curve.tension = 0.5;

  curve.closed = true;
  const roadWidth = 32;
  const segments = 600;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const indices = [];
  

const frames = curve.computeFrenetFrames(segments, true);

for (let i = 0; i < segments; i++) {
  const point1 = curve.getPointAt(i / segments);
  const point2 = curve.getPointAt((i + 1) / segments);

  const binormal1 = frames.binormals[i];
  const binormal2 = frames.binormals[(i + 1) % segments]; // wrap around

  const side1 = binormal1.clone().multiplyScalar(roadWidth / 2);
  const side2 = binormal2.clone().multiplyScalar(roadWidth / 2);

  const left1 = point1.clone().add(side1);
  const right1 = point1.clone().sub(side1);
  const left2 = point2.clone().add(side2);
  const right2 = point2.clone().sub(side2);

  const baseIndex = positions.length / 3;

  positions.push(...left1.toArray(), ...right1.toArray(), ...left2.toArray());
  positions.push(...right1.toArray(), ...right2.toArray(), ...left2.toArray());

  indices.push(
    baseIndex, baseIndex + 1, baseIndex + 2,
    baseIndex + 3, baseIndex + 4, baseIndex + 5
  );
}


  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    emissive: 0x00ffaa,
    emissiveIntensity: 0,
    metalness: 0.98,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  const roadMesh = new THREE.Mesh(geometry, material);
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  // Add physics
  createTrimeshFromGeometry(geometry, world);

  return { curve, geometry };
}