import * as THREE from 'three';

/**
 * Adds a simple streetlight to the scene at the specified position.
 * @param {THREE.Scene} scene - The THREE.js scene to add the streetlight to.
 * @param {{ x: number, y: number, z: number }} position - The base position of the streetlight.
 * @param {number} rotationY - Rotation in radians around the Y-axis.
 */
export function createStreetLight(scene, position = { x: 0, y: 0, z: 0 }, rotationY = 0) {
  const streetlight = new THREE.Group();
  const poleHeight = 6;

  // Pole
  const poleGeometry = new THREE.BoxGeometry(0.2, poleHeight, 0.2);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(0, poleHeight / 2, 0);
  pole.castShadow = true;
  pole.receiveShadow = true;

  // Arm
  const armGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.3);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.set(0.5, poleHeight, 0);

  // Light source
  const light = new THREE.PointLight(0xffffcc, 15, 20);
  light.position.set(1, poleHeight - 0.15, 0);
  light.castShadow = false;

  // Bulb
  const bulbGeometry = new THREE.SphereGeometry(0.1, 5, 5);
  const bulbMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xffffcc,
    color: 0x222200,
  });
  const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.position.copy(light.position);

  streetlight.add(pole, arm, bulb, light);
  streetlight.position.set(position.x, position.y, position.z);
  streetlight.rotation.y = rotationY;

  scene.add(streetlight);
  return streetlight;
}

