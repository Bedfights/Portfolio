import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createCar } from './car.js';
import { createTrack } from './track.js';
import { createSatellite, satelliteSound } from './satellite.js';
import { createStreetLight } from './streetlight.js';
import { createCube } from './objects.js';
import { createLetter} from './objects.js';
import { createSphere } from './objects.js';
import { createSphere2 } from './objects.js';
import { createDisplay } from './objects.js';
import { createSmallLetter } from './objects.js';
import { createReflectiveSphere } from './objects.js';
import { settings } from './config.js';
import CannonDebugger from 'cannon-es-debugger';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Create physics world
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});

// Setup Three.js scene
const scene = new THREE.Scene();

// Cannon debugger
const cannonDebugger = CannonDebugger(scene, world);

// Perspective camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, 10);
const cameraOffset = new THREE.Vector3(0, 3, 10);

// Cube camera
const cubeRendererTarget = new THREE.WebGLCubeRenderTarget(128, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});
const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRendererTarget);
scene.add(cubeCamera);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Track
const { curve, geometry } = createTrack(scene, world); // now we have the geometry

// Clickable objects
let hoverTextMesh;
let fontGlobal;

const fontLoader = new FontLoader();
fontLoader.load('/fonts/RobotoCondensed.facetype.json', (font) => {
  fontGlobal = font;

  const geometry = new TextGeometry('', {
    font: font,
    size: 0.3,
    height: 0.05,
    curveSegments: 12
  });
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00cc00,
  });

  hoverTextMesh = new THREE.Mesh(geometry, material);
  hoverTextMesh.visible = false;
  scene.add(hoverTextMesh);
});


function createButton({ text, url, position }) {
  const geometry = new THREE.BoxGeometry(3, 1, 0.2);
  const material = new THREE.MeshBasicMaterial({
    color: 0x001180
  });
  const button = new THREE.Mesh(geometry, material);
  button.position.set(position.x, position.y, position.z);
  button.rotation.y = THREE.MathUtils.degToRad(75);
  button.userData.url = url;
  button.userData.hoverText = text;

  const textLoader = new FontLoader();
  textLoader.load('/fonts/RobotoCondensed.facetype.json', (font) => {
    const textGeo = new TextGeometry(text, {
      font: font,
      size: 0.4,
    });
    textGeo.scale(1, 1, 0.001)
    const textMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0x444444
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textGeo.computeBoundingBox();
    const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    textMesh.position.set(-textWidth / 2, -0.2, 0.15);
    button.add(textMesh);
  });
  createRod(position, 3);

  scene.add(button);
  clickableObjects.push(button);
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];

document.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  // Normalize mouse coordinates to [-1, 1]
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Intersect with clickable objects only
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    const url = clickedObject.userData.url;
    if (url) {
      window.open(url, '_blank'); // or use `window.location.href = url;` to stay in tab
    }
  }
}

document.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
  if (!hoverTextMesh || !fontGlobal) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);

  if (intersects.length > 0) {
    const object = intersects[0].object;

    if (object.userData.hoverText) {
      const newGeometry = new TextGeometry(`open ${object.userData.hoverText}`, {
        font: fontGlobal,
        size: 0.3,
        curveSegments: 12
      });
      newGeometry.scale(1, 1, 0.01);
      newGeometry.center();

      hoverTextMesh.geometry.dispose(); // Clean up old
      hoverTextMesh.geometry = newGeometry;

      const objPos = object.position.clone();
      hoverTextMesh.position.set(objPos.x, objPos.y + 1.5, objPos.z);
      hoverTextMesh.visible = true;
    }
  } else {
    hoverTextMesh.visible = false;
  }
}


createButton({
  text: "GitHub",
  url: "https://github.com/Bedfights",
  position: { x: -10, y: 3.5, z: 5 },
});

createButton({
  text: "Instagram",
  url: "https://www.instagram.com/albin_jornevald?igsh=aXJqanc2c3U3YTMz&utm_source=qr",
  position: { x: -10, y: 3.5, z: 0 },
});

createButton({
  text: "Mail",
  url: "mailto:albin.jonevald@elev.boden.se",
  position: { x: -10, y: 3.5, z: -5 },
});

function createRod(position, height = 3) {
  // Create visual rod
  const rodGeometry = new THREE.BoxGeometry(0.1, height, 0.1);
  const rodMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x064000
  });
  const rodMesh = new THREE.Mesh(rodGeometry, rodMaterial);
  rodMesh.position.set(position.x, position.y - height / 2, position.z);
  scene.add(rodMesh);

  // Create physics body (static)
  const halfExtents = new CANNON.Vec3(0.05, height / 2, 0.05);
  const shape = new CANNON.Box(halfExtents);
  const rodBody = new CANNON.Body({ mass: 0 });
  rodBody.addShape(shape);
  rodBody.position.set(rodMesh.position.x, rodMesh.position.y, rodMesh.position.z);
  world.addBody(rodBody);
}

//Floor text
function createFloorLabel({ text, position }) {
  // Black square
  const baseGeometry = new THREE.BoxGeometry(1.5, 2.5, 1.5);
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    metalness: 0.8,
    roughness: 0.2
  });
  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
  baseMesh.position.set(position.x, position.y, position.z);
  scene.add(baseMesh);

  // Text
  const fontLoader = new FontLoader();
  fontLoader.load('/fonts/RobotoCondensed.facetype.json', (font) => {
    const textGeo = new TextGeometry(text, {
      font: font,
      size: 0.5,
      height: 0.05,
    });
    textGeo.scale(1, 1, 0.01);

    const textMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00ff00,
      emissiveIntensity: 0.6,
    });

    const textMesh = new THREE.Mesh(textGeo, textMat);
    textGeo.computeBoundingBox();

    const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    textMesh.position.set(
      position.x - textWidth / 2,
      position.y + 0.8,
      position.z
    );

    textMesh.rotation.x = -Math.PI / 2; // Lay flat on floor
    scene.add(textMesh);
  });
}
createFloorLabel({
  text: "W",
  position: { x: 3, y: 0.05, z: 3 },
});
createFloorLabel({
  text: "A",
  position: { x: 1.35, y: 0.05, z: 4.65 },
});
createFloorLabel({
  text: "S",
  position: { x: 3, y: 0.05, z: 4.65 }
});
createFloorLabel({
  text: "D",
  position: { x: 4.65, y: 0.05, z: 4.65 }
});
createFloorLabel({
  text: "ESC",
  position: { x: 7, y: 0.05, z: -1}
})
createFloorLabel({
  text: "R",
  position: { x: 10, y: 0.05, z: 1}
})

// ************* \\
// User controls \\
// ************* \\
document.addEventListener('keydown', (event) => {
  const maxSteerVal = Math.PI / 5;
  const maxForce = 700;

  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      vehicle.applyEngineForce(maxForce, 2); // Rear Left
      vehicle.applyEngineForce(maxForce, 3); // Rear Right
      break;
    case 's':
    case 'ArrowDown':
      vehicle.applyEngineForce(-maxForce, 2);
      vehicle.applyEngineForce(-maxForce, 3);
      break;
    case 'a':
    case 'ArrowLeft':
      vehicle.setSteeringValue(maxSteerVal, 0); // Front Left
      vehicle.setSteeringValue(maxSteerVal, 1); // Front Right
      break;
    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 1);
      break;
    case 'r':
      respawn();
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
    case 's':
    case 'ArrowDown':
      vehicle.applyEngineForce(0, 2);
      vehicle.applyEngineForce(0, 3);
      break;
    case 'a':
    case 'ArrowLeft':
    case 'd':
    case 'ArrowRight':
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;
  }
});

// **** \\
// Menu \\
// **** \\

let carLights = [];
let isPaused = false;
const startBtn = document.getElementById('startButton');
const resumeBtn = document.getElementById('resumeButton');
const mapBtn = document.getElementById('mapButton');
const creditsBtn = document.getElementById('creditsButton');
const settingsBtn = document.getElementById('settingsButton');
const backBtns = document.querySelectorAll('.backButton');
const startScreen = document.getElementById('startScreen');
const menu = document.getElementById('pauseMenu');
const settingsMenu = document.getElementById('settingsMenu');
const creditsMenu = document.getElementById('creditsMenu');
const buttonSound = document.getElementById('buttonSound');

isPaused = true;
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  isPaused = false;
  initSatellite();
  buttonSound.currentTime = 0;
  buttonSound.play();
  satelliteSound.play();
})
resumeBtn.addEventListener('click', () => {
  isPaused = false;
  menu.style.display = 'none';
  buttonSound.currentTime = 0;
  buttonSound.play();
});
creditsBtn.addEventListener('click', () => {
  creditsMenu.style.display = 'flex';
  menu.style.display = 'none';
  buttonSound.currentTime = 0;
  buttonSound.play();
})
settingsBtn.addEventListener('click', () => {
  settingsMenu.style.display = 'flex';
  menu.style.display = 'none';
  buttonSound.currentTime = 0;
  buttonSound.play();
});
backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
  creditsMenu.style.display = 'none';
  settingsMenu.style.display = 'none';
  menu.style.display = 'flex';
  buttonSound.currentTime = 0;
  buttonSound.play();
  });
});


document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape'){
    isPaused = !isPaused;
    menu.style.display = isPaused ? 'flex' : 'none';
    settingsMenu.style.display = 'none';
  }
});

const qualitySlider = document.getElementById('qualitySlider');
qualitySlider.addEventListener('input', (event) => {
  settings.quality = parseInt(event.target.value);
  const enableShadows = settings.quality === 2;
  carLights.forEach(light => {
    light.castShadow = enableShadows;
  });
});

// ***** \\
// Sound \\
// ***** \\

// ***** \\
// Light \\
// ***** \\

const pointLight1 = new THREE.PointLight(0xffffff, 100, 200);
pointLight1.position.set(0, 13, 0);
pointLight1.castShadow = false;
//scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 400, 200);
pointLight2.position.set(-250, 3, -160);
pointLight2.castShadow = false;
//scene.add(pointLight2);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.4);
scene.add(hemiLight);

// ******* \\
// Objects \\
// ******* \\

// cubes

const cube1 = createCube(world, scene, {
  size: 8,
  mass: 2,
  position: { x: -4, y: 20, z: -100 },
});


// Spheres
const sphere1 = createSphere(world, scene, {
  radius: 2,
  mass: 2,
  position: { x: -4, y: 10, z: 100 },
});
const sphere2 = createSphere2(world, scene, {
  radius: 2,
  mass: 30,
  position: { x: 0, y: 6, z: -90 },
  color: 0xff0000,
});

const reflectiveSphere = createReflectiveSphere(world, scene, {
  radius: 0.7,
  mass: 2,
  position: { x: 0, y: 5, z: -10 },
  envMap: cubeRendererTarget.texture,
});



// Text
const loaderText = new FontLoader();
loaderText.load('/fonts/RobotoCondensed.facetype.json', (font) => {
  const name = "ALBIN JORNEVALD";
  const letters = [];
  const startX1 = -8.5;
  const spacing1 = 1.2;

  for (let i = 0; i < name.length; i++) {
    const letterChar = name[i];
    const posX = startX1 + i * spacing1;
    const letter = createLetter(world, scene, {
      letter: letterChar,
      font: font,
      size: 1,
      mass: 1,
      position: { x: posX, y: 1.85, z: -25 },
      color: 0xffffff,
    });
    letters.push(letter);
  }

  const toMove = "Move:";
  const startX2 = -1.7;
  const spacing2 = 0.5;
  for (let i = 0; i < toMove.length; i++) {
    const letterChar = toMove[i];
    const posX = startX2 + i * spacing2;
    const letter = createSmallLetter(world, scene, {
      letter: letterChar,
      font: font, 
      size: 0.5,
      mass: 0.5,
      position: { x: posX, y: 1.8, z: 4.6},
      color: 0xffffff,
    });
    letters.push(letter);
  }

  const toMenu = "Menu:";
  const startX3 = 4;
  const spacing3 = 0.5;
  for (let i = 0; i < toMenu.length; i++) {
    const letterChar = toMenu[i];
    const posX = startX3 + i * spacing3;
    const letter = createSmallLetter(world, scene, {
      letter: letterChar,
      font: font,
      size: 0.5,
      mass: 0.5,
      position: { x: posX, y: 1.8, z: -1},
      color: 0xffffff,
    });
    letters.push(letter);
  }

  const toRespawn = "Respawn:";
  const startX4 = 5.5;
  const spacing4 = 0.5;
  for (let i = 0; i < toRespawn.length; i++) {
    const letterChar = toRespawn[i];
    const posX = startX4 + i * spacing4;
    const letter = createSmallLetter(world, scene, {
      letter: letterChar,
      font: font, 
      size: 0.5,
      mass: 0.5,
      position: { x: posX, y: 1.8, z: 1 },
      color: 0xffffff,
    });
    letters.push(letter);
  }

  // Update letter meshes each frame based on physics
  function updateLetters() {
    letters.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  }

  // Hook into your animation loop:
  const oldAnimate = animate;
  animate = function(vehicle, chassisBody, carGroup, carMesh) {
    oldAnimate(vehicle, chassisBody, carGroup, carMesh);
    updateLetters(); // Keep letters in sync with physics
  };
});



const cubes = [cube1];
const spheres = [ sphere1, sphere2, reflectiveSphere ];

//streetlights
//Area 51
createStreetLight(scene, world, { x: -13, y: 0, z: -13 }, -Math.PI / 4);
createStreetLight(scene, world, { x: 13, y: 0, z: -13 }, -Math.PI / 1.5);
createStreetLight(scene, world, { x: 13, y: 0, z: 13 }, Math.PI / 1.5);
createStreetLight(scene, world, { x: -13, y: 0, z: 13 }, Math.PI / 4);
//Area 52
createStreetLight(scene, world, { x: -170, y: 6, z: -245 }, -Math.PI / 4);
createStreetLight(scene, world, { x: -144, y: 6, z: -233 }, -Math.PI / 1.5);
createStreetLight(scene, world, { x: -139, y: 6, z: -207 }, Math.PI / 1.5);
createStreetLight(scene, world, { x: -164, y: 6, z: -214 }, Math.PI / 4);
//Area 53
createStreetLight(scene, world, { x: -238, y: 5, z: -80 }, -Math.PI / 4);
createStreetLight(scene, world, { x: -212, y: 5, z: -85 }, -Math.PI / 1.5);
createStreetLight(scene, world, { x: -200, y: 5, z: -60 }, Math.PI / 1.5);
createStreetLight(scene, world, { x: -223, y: 5, z: -50 }, Math.PI / 4);
//Area 54
createStreetLight(scene, world, { x: -50, y: 0, z: 180 }, -Math.PI / 4);
createStreetLight(scene, world, { x: -30, y: 0, z: 183 }, -Math.PI / 1.5);
createStreetLight(scene, world, { x: -30, y: 0, z: 208 }, Math.PI / 1.5);
createStreetLight(scene, world, { x: -50, y: 0, z: 205 }, Math.PI / 4);

createDisplay(scene, world, clickableObjects, {
  imagePath: '/images/MazeGameImg.png',
  position: { x: -160, y: 10, z: -250 },
  opacity: 0.5,
  url: '/MazeGameFolder/index.html'
});

createDisplay(scene, world, clickableObjects, {
  imagePath: '/images/ProjectileGameImg.png',
  position: { x: -150, y: 10, z: -247 },
  rotationY: -Math.PI / 6,
  opacity: 0.5,
  url: '/CanvasProjectileImproved/index.html'
});

createDisplay(scene, world, clickableObjects, {
  imagePath: '/images/PdfLogo.png',
  position: { x: -134, y: 10, z: -220 },
  rotationY: -Math.PI / 3,
  opacity: 0.5,
  url: '/CV.html'
});

// ************************** \\
// Initialize car & satellite \\
// ************************** \\
let satelliteMesh;
let vehicle, chassisBody, carGroup, carMesh, audioListener;

init();
async function initSatellite() {
  try {
    satelliteMesh = await createSatellite(audioListener);
    scene.add(satelliteMesh);
  } catch (error) {
    console.error("Failed to load satellite", error);
  }
}

async function init() {
  try {
    const car = await createCar(world, scene);
    
    vehicle = car.vehicle;
    chassisBody = car.chassisBody;
    carGroup = car.carGroup;
    carMesh = car.carMesh;
    audioListener = car.listener;

    carLights = [
      car.leftPointLight,
      car.rightPointLight,
      car.leftSpotLight,
      car.rightSpotLight,
      car.leftBreakLight,
      car.rightBreakLight,
      car.lBWheelLight,
      car.rBWheelLight
    ];

    await initSatellite();
    
    animate(vehicle, chassisBody, carGroup, carMesh);
  } catch (error) {
    console.error('Failed to load car:', error);
  }
}

function respawn() {
  const respawnPosition = new CANNON.Vec3(0, 10, 0); // Change this to your desired respawn point
  const respawnRotation = new CANNON.Quaternion(0, 0, 0, 1);

  chassisBody.velocity.setZero();
  chassisBody.angularVelocity.setZero();
  chassisBody.position.copy(respawnPosition);
  chassisBody.quaternion.copy(respawnRotation);
}

// ************** \\
// Animation loop \\
// ************** \\

const fixedTimeStep = 1.0 / 60; // seconds
const maxSubSteps = 3;

function animate(vehicle, chassisBody, carGroup, carMesh) {
  requestAnimationFrame(() => animate(vehicle, chassisBody, carGroup, carMesh));

  if (!isPaused) {
    console.log('Animating...');
    world.step(fixedTimeStep, undefined, maxSubSteps);
    //cannonDebugger.update();

    carGroup.position.copy(chassisBody.position);
    carGroup.quaternion.copy(chassisBody.quaternion);

    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i);
      const t = vehicle.wheelInfos[i].worldTransform;
    }

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
  
    spheres.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });

    cubeCamera.position.copy(reflectiveSphere.mesh.position);
    cubeCamera.update(renderer, scene);
  } else if (isPaused) {
    console.log('Paused');
  }

  hoverTextMesh.lookAt(camera.position);

  renderer.render(scene, camera);
}