import * as THREE from 'three';
import * as CANNON from 'cannon-es';

/*
@param {CANNON.World} world - The Cannon physics world.
@param {THREE.Scene} scene - The Three.js scene.
@param {Object} options - Configuration for the cube.
@param {number} options.size - Lenght of the cube's sides.
@param {number} options.mass - Mass of the physics body.
@param {Object} options.position - Initial position {x, y, z}.
@param {Object} - The Cannon body and Three.js mesh.
*/

export function createCube(world, scene, {
    size = 3,
    mass = 5,
    position = { x: -20, y: 10, z: 0},
} = {}) {
    //create physics body
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    world.addBody(body);

    //create visual mesh
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { body, mesh };
}