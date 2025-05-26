import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createCar(world, scene) {
  return new Promise((resolve, reject) => {
    // physics setup (same as before)
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2.2));
    const chassisBody = new CANNON.Body({ mass: 250 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 10, 0);
    world.addBody(chassisBody);

    const vehicle = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });

    // wheel setup (same as before) ...
    const wheelOptions = {
      radius: 0.5,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true
    };

    const wheelPositions = [
      new CANNON.Vec3(-1, 0, -1.6),
      new CANNON.Vec3(1, 0, -1.6),
      new CANNON.Vec3(-1, 0, 1.6),
      new CANNON.Vec3(1, 0, 1.6)
    ];

    for (let pos of wheelPositions) {
      vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: pos.clone() });
    }

    vehicle.addToWorld(world);

    const carGroup = new THREE.Group();
    scene.add(carGroup);

    const loader = new GLTFLoader();
    loader.load(
      '/models/car.glb',
      (gltf) => {
        const carMesh = gltf.scene;
        carMesh.scale.set(0.01, 0.01, 0.01);
        carMesh.position.y -= 0.8;
        carMesh.castShadow = true;
        carMesh.receiveShadow = true;
        carGroup.add(carMesh);

        const leftPointLight = new THREE.PointLight(0x00ddff, 4, 20);
        leftPointLight.position.set(-0.8, -0.2, -2.5);
        leftPointLight.castShadow = true;
        carGroup.add(leftPointLight);
        const rightPointLight = new THREE.PointLight(0x00ddff, 4, 20);
        rightPointLight.position.set(0.8, -0.2, -2.5);
        rightPointLight.castShadow = true;
        carGroup.add(rightPointLight);
        const leftSpotLight = new THREE.SpotLight(0xccddff, 400, 200, Math.PI / 7, 0.5, 1);
        leftSpotLight.position.set(-0.8, -0.2, -2.1);
        leftSpotLight.target.position.set(-0.8, 0, -40);
        leftSpotLight.castShadow = true;
        carGroup.add(leftSpotLight);
        carGroup.add(leftSpotLight.target);
        const rightSpotLight = new THREE.SpotLight(0xccddff, 400, 200, Math.PI / 7, 0.5, 1);
        rightSpotLight.position.set(0.8, -0.2, -2.1);
        rightSpotLight.target.position.set(0.8, 0, -40);
        rightSpotLight.castShadow = true;
        carGroup.add(rightSpotLight);
        carGroup.add(rightSpotLight.target);
        const leftBreakLight = new THREE.PointLight(0xff0000, 1, 20);
        leftBreakLight.position.set(-0.7, -0.2, 2.1);
        leftBreakLight.castShadow = true;
        carGroup.add(leftBreakLight);
        const rightBreakLight = new THREE.PointLight(0xff0000, 1, 20);
        rightBreakLight.position.set(0.7, -0.2, 2.1);
        rightBreakLight.castShadow = true;
        carGroup.add(rightBreakLight);
        const lBWheelLight = new THREE.PointLight(0x00ddff, 0.03, 20);
        lBWheelLight.position.set(-1.1, -0.5, 1.6);
        lBWheelLight.castShadow = true;
        carGroup.add(lBWheelLight);
        const rBWheelLight = new THREE.PointLight(0x00ddff, 0.03, 20);
        rBWheelLight.position.set(1.1, -0.5, 1.6);
        rBWheelLight.castShadow = true;
        carGroup.add(rBWheelLight);

        // Resolve promise here, returning everything needed
        resolve({ 
          vehicle, 
          chassisBody, 
          carGroup, 
          carMesh, 
          leftPointLight, 
          rightPointLight, 
          leftSpotLight, 
          rightSpotLight, 
          leftBreakLight, 
          rightBreakLight,
          lBWheelLight,
          rBWheelLight
        });
      },
      undefined,
      (error) => {
        console.error('Error loading GLB model:', error);
        reject(error);  // reject promise on error
      }
    );
  });
}


/*
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export function createCar(world, scene) {
  // 1. Chassis
  const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.2, 0.7));
  const chassisBody = new CANNON.Body({ mass: 150 });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 10, 0);
  chassisBody.linearDamping = 0.35;
  world.addBody(chassisBody);

  // 2. Create vehicle
  const vehicle = new CANNON.RigidVehicle({ chassisBody });

  const wheelMaterial = new CANNON.Material('wheelMaterial');
  const wheelRadius = 0.4;
  const wheelGeometry = new THREE.SphereGeometry(wheelRadius, 16, 16);

  const wheelOffsets = [
    [-1, -0.23, -0.7],
    [1, -0.23, -0.7],
    [-1, -0.23, 0.7],
    [1, -0.23, 0.7]
  ];

  const wheelBodies = [];
  const wheelMeshes = [];

  for (let i = 0; i < 4; i++) {
    const wheelBody = new CANNON.Body({ mass: 8, material: wheelMaterial });
    wheelBody.addShape(new CANNON.Sphere(wheelRadius));
    vehicle.addWheel({
      body: wheelBody,
      position: new CANNON.Vec3(...wheelOffsets[i]),
    });
    wheelBodies.push(wheelBody);

    // Visual wheel
    const wheelMesh = new THREE.Mesh(
      wheelGeometry,
      new THREE.MeshBasicMaterial({ color: 0x888888 })
    );
    scene.add(wheelMesh);
    wheelMeshes.push(wheelMesh);
  }

  vehicle.addToWorld(world);

  // 3. Visual chassis
  const carMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.4, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  scene.add(carMesh);

  return { vehicle, chassisBody, carMesh, wheelBodies, wheelMeshes };
}
  */
