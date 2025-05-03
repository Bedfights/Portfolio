import * as THREE from 'three';

export function createCar(scene) {
  const carGeometry = new THREE.BoxGeometry(1, 0.5, 1);
  const carMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const car = new THREE.Mesh(carGeometry, carMaterial);
  scene.add(car);
  return car;
}

