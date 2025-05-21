import * as THREE from 'three';
import { createTrimeshFromGeometry } from './trimesh.js';

export function createTrack(scene, world) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-100, 0, 0),
    new THREE.Vector3(-110, 4, -40),
    new THREE.Vector3(-55, 4, -35),
    new THREE.Vector3(-45, 8, -45),
    new THREE.Vector3(-80, 0, -80),
    new THREE.Vector3(-110, 0, -75),
    new THREE.Vector3(-80, 0, -120),
    new THREE.Vector3(0, 0, -100),
    new THREE.Vector3(-5, 0, -85),
    new THREE.Vector3(5, 0, -82),
    new THREE.Vector3(35, 0, -110),
    new THREE.Vector3(60, 0, -105),
    new THREE.Vector3(55, 0, -75),
    new THREE.Vector3(90, 0, -30),
    new THREE.Vector3(90, 0, 0)
  ], false, 'catmullrom', 0.5);

  curve.closed = true;
  const roadWidth = 10;
  const segments = 600;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const indices = [];

  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;

    const point1 = curve.getPointAt(t1);
    const point2 = curve.getPointAt(t2);

    const tangent = curve.getTangentAt(t1);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(up, tangent).normalize().multiplyScalar(roadWidth / 2);

    const left1 = new THREE.Vector3().copy(point1).add(side);
    const right1 = new THREE.Vector3().copy(point1).sub(side);
    const left2 = new THREE.Vector3().copy(point2).add(side);
    const right2 = new THREE.Vector3().copy(point2).sub(side);

    const baseIndex = positions.length / 3;

    // Push two triangles (quad)
    positions.push(...left1.toArray(), ...right1.toArray(), ...left2.toArray());
    positions.push(...right1.toArray(), ...right2.toArray(), ...left2.toArray());

    indices.push(
      baseIndex, baseIndex + 1, baseIndex + 2,
      baseIndex + 3, baseIndex + 4, baseIndex + 5
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffaa,
    emissive: 0x00ffaa,
    emissiveIntensity: 1,
    metalness: 0.2,
    roughness: 0.1,
    side: THREE.DoubleSide,
  });

  const roadMesh = new THREE.Mesh(geometry, material);
  scene.add(roadMesh);

  // Add physics
  createTrimeshFromGeometry(geometry, world);

  return { curve, geometry };
}




/*
export function createTrack(scene) {
  // Define curve path
  const points = [
    new THREE.Vector3(-30, 0, 0),
    new THREE.Vector3(-20, 0, 5),
    new THREE.Vector3(-10, 0, 10),
    new THREE.Vector3(0, 0, 15),
    new THREE.Vector3(10, 0, 20),
    new THREE.Vector3(20, 0, 25),
    new THREE.Vector3(30, 0, 30),
    new THREE.Vector3(40, 0, 40),
    new THREE.Vector3(50, 0, 50),
    new THREE.Vector3(60, 0, 60),
    new THREE.Vector3(70, 0, 70),
    new THREE.Vector3(80, 0, 80),
    new THREE.Vector3(90, 0, 90),
    new THREE.Vector3(100, 0, 100),
    new THREE.Vector3(120, 0, 120),
    new THREE.Vector3(130, 2, 140),
    new THREE.Vector3(140, 2, 160),
    new THREE.Vector3(150, 2, 180),
    new THREE.Vector3(160, 1, 200),
    new THREE.Vector3(170, 0, 210),
    new THREE.Vector3(180, 0, 230),
    new THREE.Vector3(190, 0, 240),
    new THREE.Vector3(200, 0, 250),
    new THREE.Vector3(210, 0, 270),
    new THREE.Vector3(220, 0, 280),
    new THREE.Vector3(230, 0, 300),
    new THREE.Vector3(240, 0, 310),
    new THREE.Vector3(250, 0, 320),
    new THREE.Vector3(260, 0, 330),
    new THREE.Vector3(270, 0, 340),
    new THREE.Vector3(280, 0, 350),
    new THREE.Vector3(290, 0, 370),
    new THREE.Vector3(300, 0, 380),
    new THREE.Vector3(310, 0, 390),
    new THREE.Vector3(320, 0, 400),
    new THREE.Vector3(330, 0, 410),
    new THREE.Vector3(340, 0, 420),
    new THREE.Vector3(350, 0, 430),
    new THREE.Vector3(360, 0, 440),
    new THREE.Vector3(370, 0, 450),
    new THREE.Vector3(380, 0, 460),
    new THREE.Vector3(390, 0, 470),
    new THREE.Vector3(400, 0, 480),
    new THREE.Vector3(410, 0, 490),
    new THREE.Vector3(420, 0, 500),
    new THREE.Vector3(430, 0, 510),
    new THREE.Vector3(440, 0, 520),
    new THREE.Vector3(450, 0, 530),
    new THREE.Vector3(460, 0, 540),
    new THREE.Vector3(470, 0, 550),
    new THREE.Vector3(480, 0, 560),
    new THREE.Vector3(490, 0, 570),
    new THREE.Vector3(50, 0, -100),
    new THREE.Vector3(-30, 0, 3)
  ];
  
  const trackCurve = new THREE.CatmullRomCurve3(points);
  trackCurve.closed = true; // Make it loop back at the end  

  // Use TubeGeometry to get Frenet Frames
  const tube = new THREE.TubeGeometry(trackCurve, 200, 1, 8, true);
  const frenetFrames = trackCurve.computeFrenetFrames(200, true);

  // Create road geometry (flat ribbon)
  const roadWidth = 6;
  const roadGeometry = new THREE.BufferGeometry();
  const positions = [];
  const indices = [];

  for (let i = 0; i < 200; i++) {
    const u = i / 200;
    const pos = trackCurve.getPointAt(u);
    const binormal = frenetFrames.binormals[i];

    const left = new THREE.Vector3().copy(pos).addScaledVector(binormal, -roadWidth / 2);
    const right = new THREE.Vector3().copy(pos).addScaledVector(binormal, roadWidth / 2);

    positions.push(left.x, left.y, left.z);
    positions.push(right.x, right.y, right.z);

    if (i < 199) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roadGeometry.setIndex(indices);
  roadGeometry.computeVertexNormals();

  const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
  const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
  scene.add(roadMesh);

  return { trackCurve };
}

*/