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

//Cube
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

//Sphere
export function createSphere(world, scene, {
    radius = 2,
    mass = 5,
    position = { x: -4, y: 10, z: -10},
} = {}) {
    //physics body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body ({ mass});
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    world.addBody(body);

    //visual mesh
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
        metalness: 0.95,
        roughness: 0.01,
        color: 0x4444ff,
     });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return { body, mesh };
}
export function createSphere2(world, scene, {
    radius = 2,
    mass = 5,
    position = { x: -4, y: 10, z: -10},
} = {}) {
    //physics body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body ({ mass});
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    world.addBody(body);

    //visual mesh
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const loader = new THREE.TextureLoader();
    const roadTexture = loader.load('/textures/Asphalt026C.png');
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 1);
    const material = new THREE.MeshStandardMaterial({
        map: roadTexture, 
        metalness: 0.98,
        roughness: 0.1,
     });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return { body, mesh };
}

//Polyhedron
export function createConvexPolyhedron(world, scene, {
    vertices = [
        new CANNON.Vec3(-1, -1, -1), //1
        new CANNON.Vec3(1, -1, -1),  //2
        new CANNON.Vec3(1, 1, -1),   //3
        new CANNON.Vec3(-1, 1, -1),  //4
        new CANNON.Vec3(-1, -1, 1),  //5
        new CANNON.Vec3(1, -1, 1),   //6
        new CANNON.Vec3(1, 1, 1),    //7
        new CANNON.Vec3(-1, 1, 1)    //8
    ],
    indices = [
        [0, 1, 2, 3], // front
        [4, 5, 6, 7], // back]
        [4, 7, 6, 5], 
        [0, 4, 5, 1], 
        [1, 5, 6, 2], 
        [2, 6, 7, 3], 
        [3, 7, 4, 0], 
    ],
    mass = 2,
    position = { x: 0, y: 4, z: 0},
} = {}) {
    //physics body
    const shape = new CANNON.ConvexPolyhedron({ vertices, faces: indices });
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    world.addBody(body);

    //visual mesh
    // Build geometry from the face indices
    const geometry = new THREE.BufferGeometry();
    const positionArray = [];

    for (const face of indices) {
        for (const i of face) {
            const v = vertices[i];
            positionArray.push(v.x, v.y, v.z);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ color: 0xffdddd });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return { body, mesh };
}