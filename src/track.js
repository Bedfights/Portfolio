import * as THREE from 'three';
import * as CANNON from 'cannon-es';

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

  curve.closed = true;
  const roadWidth = 32;
  const trackHeight = 1;
  const segments = 600;

  const frames = curve.computeFrenetFrames(segments, true);

  for (let i = 0; i < segments; i++) {
    const t = i / segments;

    const position = curve.getPointAt(t);
    const tangent = frames.tangents[i];
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    const nextPosition = curve.getPointAt((i + 1) / segments);
    const segmentLength = position.distanceTo(nextPosition);

    // Create geometry
    const geometry = new THREE.BoxGeometry(segmentLength, trackHeight, roadWidth);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Set rotation using the Frenet frame
    const basisMatrix = new THREE.Matrix4();
    basisMatrix.makeBasis(tangent.clone().normalize(), normal.clone().normalize(), binormal.clone().normalize());

    const transformMatrix = new THREE.Matrix4();
    transformMatrix.setPosition(position);
    transformMatrix.multiplyMatrices(transformMatrix, basisMatrix);

    mesh.setRotationFromMatrix(transformMatrix);
    mesh.position.copy(position);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();

    scene.add(mesh);

    // Physics body
    const shape = new CANNON.Box(new CANNON.Vec3(segmentLength / 2, trackHeight / 2, roadWidth / 2));
    const body = new CANNON.Body({ mass: 0 });

    const quaternion = new CANNON.Quaternion();
    const threeQuat = new THREE.Quaternion();
    mesh.getWorldQuaternion(threeQuat);
    quaternion.set(threeQuat.x, threeQuat.y, threeQuat.z, threeQuat.w);

    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    body.quaternion.copy(quaternion);

    world.addBody(body);
  }

  return { curve };
}

