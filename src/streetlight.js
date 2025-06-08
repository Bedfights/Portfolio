import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/**
 * Adds a simple streetlight to the scene at the specified position.
 * @param {THREE.Scene} scene - The THREE.js scene to add the streetlight to.
 * @param {{ x: number, y: number, z: number }} position - The base position of the streetlight.
 * @param {number} rotationY - Rotation in radians around the Y-axis.
 */
export function createStreetLight(scene, world, position = { x: 0, y: 0, z: 0 }, rotationY = 0) {
  const streetlight = new THREE.Group();
  const poleHeight = 7;

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
  const light = new THREE.PointLight(0xffffcc, 50, 20);
  light.position.set(1, poleHeight - 0.15, 0);
  light.castShadow = false;

  // Bulb
  const bulbGeometry = new THREE.SphereGeometry(0.2, 5, 5);
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

  // CANNON.js static physics body (just the pole for simplicity)
  const halfExtents = new CANNON.Vec3(0.1, poleHeight / 2, 0.1);
  const shape = new CANNON.Box(halfExtents);
  const body = new CANNON.Body({ mass: 0 }); // static
  body.addShape(shape);

  // Apply rotation to physics too
  const quat = new CANNON.Quaternion();
  quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationY);
  body.quaternion.copy(quat);

  // Position in CANNON world (match center of pole)
  body.position.set(
    position.x,
    position.y + poleHeight / 2,
    position.z
  );

  world.addBody(body);

  return { mesh: streetlight, body };
}

