import * as THREE from 'three';
import { GarmentType } from '../../types';

export function createTShirtGeometry(garmentType: GarmentType): THREE.BufferGeometry {
  const isKids = garmentType === 'kids';
  const isOversized = garmentType === 'oversized';
  const isLongSleeve = garmentType === 'long_sleeve';
  const isPolo = garmentType === 'polo';

  // Proportions based on garment type
  const scale = isKids ? 0.75 : 1.0;
  const torsoWidth = (isOversized ? 0.78 : isKids ? 0.52 : 0.65) * scale;
  const torsoDepth = (isOversized ? 0.38 : isKids ? 0.26 : 0.32) * scale;
  const torsoHeight = (isOversized ? 1.6 : isKids ? 1.2 : 1.45) * scale;
  const shoulderSlope = isOversized ? 0.22 : 0.18;
  const sleeveLength = (isLongSleeve ? 1.35 : isOversized ? 0.55 : 0.42) * scale;
  const sleeveRadius = (isOversized ? 0.22 : isKids ? 0.14 : 0.18) * scale;
  const neckRadiusX = 0.22 * scale;
  const neckRadiusZ = 0.16 * scale;

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // 1. Build Torso Body as a lofted curved tube with slices from bottom hem to neck/shoulders
  const verticalSteps = 36;
  const radialSteps = 48;

  const yBottom = -torsoHeight * 0.55;
  const yShoulder = torsoHeight * 0.42;

  for (let j = 0; j <= verticalSteps; j++) {
    const vFraction = j / verticalSteps; // 0 at bottom, 1 at shoulder
    const y = yBottom + vFraction * (yShoulder - yBottom);

    // Natural body silhouette contour
    // Slight waist indentation around vFraction = 0.4, widening at chest vFraction = 0.75
    let widthFactor = 1.0;
    if (vFraction < 0.35) {
      widthFactor = 0.98 + 0.04 * (1 - vFraction / 0.35); // Slight flare at hem
    } else if (vFraction < 0.65) {
      widthFactor = 0.94 + 0.06 * Math.sin(((vFraction - 0.35) / 0.3) * Math.PI); // Gentle waist
    } else {
      widthFactor = 0.96 + 0.14 * Math.sin(((vFraction - 0.65) / 0.35) * Math.PI); // Chest curve
    }

    const curWidth = torsoWidth * widthFactor;
    const curDepth = torsoDepth * (0.92 + 0.12 * Math.sin(vFraction * Math.PI));

    // Subtle natural cloth wrinkles/waves
    const foldAmplitude = 0.012 * (1 - vFraction * 0.6);

    for (let i = 0; i <= radialSteps; i++) {
      const uFraction = i / radialSteps;
      const angle = uFraction * Math.PI * 2; // 0 to 2PI

      // Elliptical cross section with flatter front and back, curved sides
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Superellipse formula for natural human torso cross-section
      const px = Math.sign(cosA) * Math.pow(Math.abs(cosA), 0.88) * curWidth;
      const pz = Math.sign(sinA) * Math.pow(Math.abs(sinA), 0.88) * curDepth;

      // Small wrinkle wave
      const wrinkle = Math.sin(angle * 6 + vFraction * 14) * foldAmplitude;
      const x = px + cosA * wrinkle;
      const z = pz + sinA * wrinkle;

      vertices.push(x, y, z);

      // Normal placeholder (will recompute with computeVertexNormals)
      normals.push(cosA, 0.1, sinA);

      // UV MAPPING for front and back sublimation areas!
      // u: 0.0 to 0.5 is FRONT, 0.5 to 1.0 is BACK
      // Front is around angle = Math.PI / 2 (z > 0), Back is around angle = 3 * Math.PI / 2 (z < 0)
      let u = 0.50;
      const v = 0.0244 + vFraction * 0.9512;

      if (z >= 0) {
        // FRONT: map x from -curWidth to +curWidth into u = [0.0976, 0.4638]
        const normX = Math.min(1, Math.max(0, (x / (curWidth * 1.05) + 1) * 0.5));
        u = 0.0976 + normX * 0.3662;
      } else {
        // BACK: map x from +curWidth to -curWidth into u = [0.5361, 0.9023]
        const normX = Math.min(1, Math.max(0, (x / (curWidth * 1.05) + 1) * 0.5));
        u = 0.5361 + (1 - normX) * 0.3662;
      }

      uvs.push(u, v);
    }
  }

  // Generate torso indices
  const stride = radialSteps + 1;
  for (let j = 0; j < verticalSteps; j++) {
    for (let i = 0; i < radialSteps; i++) {
      const a = j * stride + i;
      const b = (j + 1) * stride + i;
      const c = (j + 1) * stride + (i + 1);
      const d = j * stride + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // 2. Build Shoulder/Chest Cap to Neck Opening
  const shoulderBaseIndex = vertices.length / 3;
  const topTorsoRowStart = verticalSteps * stride;

  for (let i = 0; i <= radialSteps; i++) {
    const angle = (i / radialSteps) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Neck ring opening
    const nx = cosA * neckRadiusX;
    const nz = sinA * neckRadiusZ;
    const ny = yShoulder + 0.18 * scale - (Math.abs(cosA) * shoulderSlope * scale);

    vertices.push(nx, ny, nz);
    normals.push(0, 1, 0);

    let u = 0;
    if (sinA >= 0) {
      const normX = (cosA + 1) * 0.5;
      u = 0.04 + normX * 0.42;
    } else {
      const normX = (-cosA + 1) * 0.5;
      u = 0.54 + normX * 0.42;
    }
    uvs.push(u, 0.95);
  }

  // Connect top torso row to neck opening
  for (let i = 0; i < radialSteps; i++) {
    const a = topTorsoRowStart + i;
    const b = shoulderBaseIndex + i;
    const c = shoulderBaseIndex + (i + 1);
    const d = topTorsoRowStart + (i + 1);

    indices.push(a, b, d);
    indices.push(b, c, d);
  }

  // 3. Ribbed Crewneck Collar / Neckband
  const collarStart = vertices.length / 3;
  const collarHeight = 0.045 * scale;
  const collarThickness = 0.02 * scale;
  const collarSteps = radialSteps;

  for (let j = 0; j <= 2; j++) {
    const rOffset = j === 1 ? collarThickness : 0;
    const yOffset = j * (collarHeight * 0.5);

    for (let i = 0; i <= collarSteps; i++) {
      const angle = (i / collarSteps) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const cx = cosA * (neckRadiusX + rOffset);
      const cz = sinA * (neckRadiusZ + rOffset);
      const cy = yShoulder + 0.18 * scale - (Math.abs(cosA) * shoulderSlope * scale) + yOffset;

      vertices.push(cx, cy, cz);
      normals.push(cosA, 0.5, sinA);
      // Collar UV mapped to dedicated collar zone
      uvs.push(0.50, 0.927);
    }
  }

  const collarStride = collarSteps + 1;
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < collarSteps; i++) {
      const a = collarStart + j * collarStride + i;
      const b = collarStart + (j + 1) * collarStride + i;
      const c = collarStart + (j + 1) * collarStride + (i + 1);
      const d = collarStart + j * collarStride + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // 4. Sleeves: Left & Right Arm Sleeves
  const buildSleeve = (isLeft: boolean) => {
    const sleeveStartIdx = vertices.length / 3;
    const sign = isLeft ? 1 : -1;
    const shoulderX = sign * (torsoWidth * 0.88);
    const shoulderY = yShoulder * 0.85;
    const shoulderZ = 0;

    const sleeveAngleDown = 0.48; // Angle downwards (~27 degrees)
    const sleeveStepsR = 24;
    const sleeveStepsL = isLongSleeve ? 20 : 10;

    for (let j = 0; j <= sleeveStepsL; j++) {
      const lenFrac = j / sleeveStepsL;
      // Sleeve extension vector
      const dist = lenFrac * sleeveLength;
      const curX = shoulderX + sign * Math.cos(sleeveAngleDown) * dist;
      const curY = shoulderY - Math.sin(sleeveAngleDown) * dist;
      const curZ = shoulderZ;

      // Slight taper towards cuff
      const curRadius = sleeveRadius * (1 - lenFrac * (isLongSleeve ? 0.35 : 0.15));

      for (let i = 0; i <= sleeveStepsR; i++) {
        const theta = (i / sleeveStepsR) * Math.PI * 2;
        // Ring perpendicular to sleeve direction
        const rx = -sign * Math.sin(sleeveAngleDown) * Math.cos(theta) * curRadius * 0.4;
        const ry = Math.cos(sleeveAngleDown) * Math.cos(theta) * curRadius;
        const rz = Math.sin(theta) * curRadius;

        vertices.push(curX + rx, curY + ry, curZ + rz);
        normals.push(sign * 0.7, -0.4, Math.sin(theta));
        // Sleeves mapped to dedicated left/right sleeve zones
        uvs.push(0.0439, isLeft ? 0.78 : 0.243);
      }
    }

    const sStride = sleeveStepsR + 1;
    for (let j = 0; j < sleeveStepsL; j++) {
      for (let i = 0; i < sleeveStepsR; i++) {
        const a = sleeveStartIdx + j * sStride + i;
        const b = sleeveStartIdx + (j + 1) * sStride + i;
        const c = sleeveStartIdx + (j + 1) * sStride + (i + 1);
        const d = sleeveStartIdx + j * sStride + (i + 1);

        if (isLeft) {
          indices.push(a, b, d);
          indices.push(b, c, d);
        } else {
          indices.push(a, d, b);
          indices.push(b, d, c);
        }
      }
    }
  };

  buildSleeve(true);  // Left sleeve
  buildSleeve(false); // Right sleeve

  // 5. Polo Collar details if polo
  if (isPolo) {
    const poloStart = vertices.length / 3;
    // Polo collar flap leaves
    const flapWidth = 0.14 * scale;
    const flapLength = 0.22 * scale;
    const placketY = yShoulder - 0.28 * scale;

    // Left collar flap
    vertices.push(
      0.02, yShoulder + 0.12 * scale, neckRadiusZ + 0.02,
      flapWidth, yShoulder + 0.08 * scale, neckRadiusZ + 0.05,
      flapWidth * 1.3, yShoulder - 0.06 * scale, neckRadiusZ + 0.04,
      0.01, placketY + 0.14 * scale, neckRadiusZ + 0.01
    );
    // Right collar flap
    vertices.push(
      -0.02, yShoulder + 0.12 * scale, neckRadiusZ + 0.02,
      -flapWidth, yShoulder + 0.08 * scale, neckRadiusZ + 0.05,
      -flapWidth * 1.3, yShoulder - 0.06 * scale, neckRadiusZ + 0.04,
      -0.01, placketY + 0.14 * scale, neckRadiusZ + 0.01
    );

    for (let i = 0; i < 8; i++) {
      normals.push(0, 0.4, 0.9);
      uvs.push(0.01, 0.01);
    }

    indices.push(
      poloStart, poloStart + 1, poloStart + 2,
      poloStart, poloStart + 2, poloStart + 3,
      poloStart + 4, poloStart + 6, poloStart + 5,
      poloStart + 4, poloStart + 7, poloStart + 6
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
