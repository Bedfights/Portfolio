import * as CANNON from 'cannon-es';

export function createTrimeshFromGeometry(geometry, world) {
  // Ensure the geometry has up-to-date attributes
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.computeVertexNormals();

  // If it's indexed, convert to non-indexed for simplicity
  const geo = geometry.index !== null ? geometry.toNonIndexed() : geometry;

  const positionAttr = geo.getAttribute('position');
  const vertices = [];
  const indices = [];

  for (let i = 0; i < positionAttr.count; i++) {
    vertices.push(positionAttr.getX(i), positionAttr.getY(i), positionAttr.getZ(i));
    indices.push(i);
  }

  if (!geometry || !geometry.isBufferGeometry) {
    console.error("Invalid geometry passed to createTrimeshFromGeometry");
    return;
  }
  
  const trimeshShape = new CANNON.Trimesh(vertices, indices);
  const body = new CANNON.Body({ mass: 0 }); // Static body
  body.addShape(trimeshShape);
  world.addBody(body);
}
