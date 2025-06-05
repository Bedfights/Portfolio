import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


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
    const body = new CANNON.Body ({ mass });
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
        metalness: 0.1,
        roughness: 0.9,
        color: 0xaaaaaa,
     });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return { body, mesh };
}
export function createReflectiveSphere(world, scene, {
    radius = 1,
    mass = 5,
    position = { x: 0, y: 5, z: -8 },
    envMap,
} = {}) {
    // Physics body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({ mass });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    world.addBody(body); // (not `add`, should be `addBody`)

    // Visual mesh
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        metalness: 1,
        roughness: 0,
        envMap,
        envMapIntensity: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    return { body, mesh };
}


//Text
export function createLetter(world, scene, options) {
  const { letter, font, size = 1, mass = 1, position = { x: 0, y: 1, z: 0 }, color = 0xffffff } = options;

  const textGeo = new TextGeometry(letter, {
    font: font,
    size: size,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: false,
  });
  textGeo.computeBoundingBox();
const centerOffset = new THREE.Vector3();
textGeo.boundingBox.getCenter(centerOffset).negate();
textGeo.translate(centerOffset.x, centerOffset.y, centerOffset.z);

textGeo.scale(1.2, 1.2, 0.015);

  const textMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0xaaaaaa
  });

  const mesh = new THREE.Mesh(textGeo, textMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);

  const bbox = new THREE.Box3().setFromObject(mesh);
  const sizeVec = new THREE.Vector3();
  bbox.getSize(sizeVec);

  const shape = new CANNON.Box(new CANNON.Vec3(sizeVec.x / 2, sizeVec.y / 2, sizeVec.z / 2));
  const body = new CANNON.Body({
    mass: mass,
    shape: shape,
    position: new CANNON.Vec3(position.x, position.y, position.z)
  });

  world.addBody(body);

  return { mesh, body };
}
export function createSmallLetter(world, scene, options) {
  const { letter, font, size = 1, mass = 1, position = { x: 0, y: 1, z: 0 }, color = 0xffffff } = options;

  const textGeo = new TextGeometry(letter, {
    font: font,
    size: size,
    height: 0.1,
    curveSegments: 12,
    bevelEnabled: false,
  });
  textGeo.computeBoundingBox();
const centerOffset = new THREE.Vector3();
textGeo.boundingBox.getCenter(centerOffset).negate();
textGeo.translate(centerOffset.x, centerOffset.y, centerOffset.z);

textGeo.scale(1.2, 1.2, 0.003);

  const textMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0xaaaaaa
  });

  const mesh = new THREE.Mesh(textGeo, textMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(position.x, position.y, position.z);
  scene.add(mesh);

  const bbox = new THREE.Box3().setFromObject(mesh);
  const sizeVec = new THREE.Vector3();
  bbox.getSize(sizeVec);

  const shape = new CANNON.Box(new CANNON.Vec3(sizeVec.x / 2, sizeVec.y / 2, sizeVec.z / 2));
  const body = new CANNON.Body({
    mass: mass,
    shape: shape,
    position: new CANNON.Vec3(position.x, position.y, position.z)
  });

  world.addBody(body);

  return { mesh, body };
}