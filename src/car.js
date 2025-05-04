import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export function createCar(world, scene) {
  // 1. Chassis
  const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.3, 0.7));
  const chassisBody = new CANNON.Body({ mass: 150 });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 5, 0);
  chassisBody.linearDamping = 0.5;
  world.addBody(chassisBody);

  // 2. Create vehicle
  const vehicle = new CANNON.RigidVehicle({ chassisBody });

  const wheelMaterial = new CANNON.Material('wheelMaterial');
  const wheelRadius = 0.4;
  const wheelGeometry = new THREE.SphereGeometry(wheelRadius, 16, 16);

  const wheelOffsets = [
    [-1, -0.3, -0.8],
    [1, -0.3, -0.8],
    [-1, -0.3, 0.8],
    [1, -0.3, 0.8]
  ];

  const wheelBodies = [];
  const wheelMeshes = [];

  for (let i = 0; i < 4; i++) {
    const wheelBody = new CANNON.Body({ mass: 10, material: wheelMaterial });
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
    new THREE.BoxGeometry(4, 0.6, 1.4),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  scene.add(carMesh);

  return { vehicle, chassisBody, carMesh, wheelBodies, wheelMeshes };
}
