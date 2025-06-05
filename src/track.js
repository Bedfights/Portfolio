import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function createTrack(scene, world) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(10, 1, -180),
    new THREE.Vector3(-80, 2, -200),
    new THREE.Vector3(-100, 3, -160),
    new THREE.Vector3(-70, 4, -90),
    new THREE.Vector3(-100, 5, -70),
    new THREE.Vector3(-160, 6, -140),
    new THREE.Vector3(-150, 7, -220),
    new THREE.Vector3(-200, 8, -230),
    new THREE.Vector3(-250, 6, -160),
    new THREE.Vector3(-200, 5, -40),
    new THREE.Vector3(-148, 4, -30),
    new THREE.Vector3(-130, 3, 0),
    new THREE.Vector3(-154, 2, 30),
    new THREE.Vector3(-230, 1, 75),
    new THREE.Vector3(-210, 1, 140),
    new THREE.Vector3(-120, 1, 130),
    new THREE.Vector3(-80, 1, 180),
    new THREE.Vector3(0, 1, 180)
  ], false, 'catmullrom', 0.5);

  curve.closed = true;
  const roadWidth = 32;
  const trackHeight = 0.5;
  const segments = 600;

  const frames = curve.computeFrenetFrames(segments, true);

  for (let i = 0; i < segments; i++) {
  const t = i / segments;

  const position = curve.getPointAt(t);
  const nextPosition = curve.getPointAt((i + 1) / segments);

  const baseLength = position.distanceTo(nextPosition);
  const overlapFactor = 2;
  const segmentLength = baseLength * overlapFactor;

  const normal = frames.normals[i];
  const tangent = frames.tangents[i];
  const binormal = frames.binormals[i];

  const geometry = new THREE.BoxGeometry(segmentLength, trackHeight, roadWidth);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x666666,
    metalness: 0.9,
    roughness: 0.5,

  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const basisMatrix = new THREE.Matrix4();
  basisMatrix.makeBasis(tangent.clone().normalize(), normal.clone().normalize(), binormal.clone().normalize());

  const center = position.clone().lerp(nextPosition, 0.5);

  const transformMatrix = new THREE.Matrix4();
  transformMatrix.setPosition(center);
  transformMatrix.multiplyMatrices(transformMatrix, basisMatrix);

  mesh.setRotationFromMatrix(transformMatrix);
  mesh.position.copy(center);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(segmentLength / 2, trackHeight / 2, roadWidth / 2));
  const body = new CANNON.Body({ mass: 0 });

  const quaternion = new CANNON.Quaternion();
  const threeQuat = new THREE.Quaternion();
  mesh.getWorldQuaternion(threeQuat);
  quaternion.set(threeQuat.x, threeQuat.y, threeQuat.z, threeQuat.w);

  body.addShape(shape);
  body.position.set(center.x, center.y, center.z);
  body.quaternion.copy(quaternion);

  world.addBody(body);
}


  return { curve };
}
