import * as THREE from 'three';

// Procedural micro-weave texture for realistic cotton/polyester fabric look
export function createFabricBumpTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Subtle knit weave pattern
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        // Fine fabric interlock weave formula
        const weave = Math.sin(x * 1.8) * Math.cos(y * 1.8) * 18 +
                      Math.sin((x + y) * 2.5) * 8 +
                      (Math.random() - 0.5) * 12;

        const val = Math.min(255, Math.max(0, 128 + weave));
        data[index] = val;     // R
        data[index + 1] = val; // G
        data[index + 2] = val; // B
        data[index + 3] = 255; // A
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.needsUpdate = true;
  return texture;
}
