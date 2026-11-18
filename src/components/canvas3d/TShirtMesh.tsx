import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useEditorStore } from '../../store/editorStore';
import { createTShirtGeometry } from './tshirtGeometry';
import { createFabricBumpTexture } from './fabricTexture';
import { DynamicTextureManager } from './DynamicTextureManager';

interface TShirtMeshProps {
  textureManager: DynamicTextureManager;
}

export const TShirtMesh: React.FC<TShirtMeshProps> = ({ textureManager }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const garmentType = useEditorStore((s) => s.garmentType);
  const size = useEditorStore((s) => s.size);
  const customModelUrl = useEditorStore((s) => s.customModelUrl);

  // Material settings from store (Image 3)
  const fabricRoughness = useEditorStore((s) => s.fabricRoughness);
  const fabricMetalness = useEditorStore((s) => s.fabricMetalness);
  const fabricReflectivity = useEditorStore((s) => s.fabricReflectivity);
  const fabricOpacity = useEditorStore((s) => s.fabricOpacity);

  // Colors & Visibility from Partes tab (Image 2)
  const shirtColor = useEditorStore((s) => s.shirtColor);
  const collarSeamsColor = useEditorStore((s) => s.collarSeamsColor);
  const sleeveSeamsColor = useEditorStore((s) => s.sleeveSeamsColor);
  const leftSleeveColor = useEditorStore((s) => s.leftSleeveColor);
  const rightSleeveColor = useEditorStore((s) => s.rightSleeveColor);

  const showCollarSeams = useEditorStore((s) => s.showCollarSeams);
  const showSleeveSeams = useEditorStore((s) => s.showSleeveSeams);
  const showLeftSleeve = useEditorStore((s) => s.showLeftSleeve);
  const showRightSleeve = useEditorStore((s) => s.showRightSleeve);

  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);

  // Generate parametric 3D geometry for fallback
  const fallbackGeometry = useMemo(() => {
    return createTShirtGeometry(garmentType);
  }, [garmentType]);

  // Procedural micro-weave fabric bump map
  const bumpTexture = useMemo(() => {
    return createFabricBumpTexture();
  }, []);

  // Subtle physical scale based on size
  const sizeScale = useMemo(() => {
    const scaleMap: Record<string, number> = {
      XS: 0.94,
      S: 0.97,
      M: 1.0,
      L: 1.04,
      XL: 1.08,
      XXL: 1.13,
      '4': 0.82,
      '6': 0.88,
      '8': 0.94,
      '10': 1.0,
      '12': 1.05,
      '14': 1.1,
      '16': 1.15,
    };
    return scaleMap[size] || 1.0;
  }, [size]);

  // Dedicated Materials for each garment part
  // [0] Front Torso (Front 4K Decals Texture)
  // [1] Back Torso (Back 4K Decals Texture)
  // [2] Collar & Upper Seams (Costuras superiores)
  // [3] Sleeve Seams (Costuras de las mangas)
  // [4] Left Sleeve (Manga izquierda)
  // [5] Right Sleeve (Manga derecha)
  const materials = useMemo(() => {
    const commonProps = {
      roughness: fabricRoughness,
      metalness: fabricMetalness,
      bumpMap: bumpTexture,
      bumpScale: 0.0035 * Math.max(0.2, 1 - fabricReflectivity * 0.5),
      transparent: fabricOpacity < 0.99,
      opacity: fabricOpacity,
      side: THREE.DoubleSide,
    };

    const matFront = new THREE.MeshStandardMaterial({
      ...commonProps,
      color: 0xffffff,
      map: textureManager.frontTexture,
    });

    const matBack = new THREE.MeshStandardMaterial({
      ...commonProps,
      color: 0xffffff,
      map: textureManager.backTexture,
    });

    const matCollar = new THREE.MeshStandardMaterial({
      ...commonProps,
      color: new THREE.Color(collarSeamsColor || shirtColor),
      visible: showCollarSeams,
    });

    const matSleeveSeams = new THREE.MeshStandardMaterial({
      ...commonProps,
      color: new THREE.Color(sleeveSeamsColor || shirtColor),
      visible: showSleeveSeams,
    });

    const matLeftSleeve = new THREE.MeshStandardMaterial({
      ...commonProps,
      color: new THREE.Color(leftSleeveColor || shirtColor),
      visible: showLeftSleeve,
    });

    const matRightSleeve = new THREE.MeshStandardMaterial({
      ...commonProps,
      color: new THREE.Color(rightSleeveColor || shirtColor),
      visible: showRightSleeve,
    });

    return [matFront, matBack, matCollar, matSleeveSeams, matLeftSleeve, matRightSleeve];
  }, [
    fabricRoughness,
    fabricMetalness,
    fabricReflectivity,
    fabricOpacity,
    bumpTexture,
    textureManager.frontTexture,
    textureManager.backTexture,
    collarSeamsColor,
    sleeveSeamsColor,
    leftSleeveColor,
    rightSleeveColor,
    shirtColor,
    showCollarSeams,
    showSleeveSeams,
    showLeftSleeve,
    showRightSleeve,
  ]);

  // Keep loaded scene materials synchronized
  useEffect(() => {
    if (loadedScene) {
      loadedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = materials;
        }
      });
    }
  }, [loadedScene, materials]);

  // Load GLB model (prioritizing customModelUrl, then Meshy model, then camiseta.glb)
  useEffect(() => {
    const candidateUrls = customModelUrl
      ? [customModelUrl]
      : [
          '/models/Meshy_AI_hazla_3d_1024164425_generate.glb',
          '/models/camiseta.glb',
        ];

    const loader = new GLTFLoader();

    const tryLoad = (index: number) => {
      if (index >= candidateUrls.length) {
        setLoadedScene(null);
        return;
      }

      loader.load(
        candidateUrls[index],
        (gltf) => {
          const scene = gltf.scene;

          // Auto-center and normalize size
          const box = new THREE.Box3().setFromObject(scene);
          const center = box.getCenter(new THREE.Vector3());
          const sizeVec = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
          const targetScale = 1.9 / (maxDim || 1);

          scene.position.sub(center.multiplyScalar(targetScale));
          scene.position.y += 0.08;
          scene.scale.setScalar(targetScale);

          // Process all meshes and partition triangles into the 6 material groups
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              const geom = m.geometry;

              if (!geom.attributes.normal) {
                geom.computeVertexNormals();
              }

              const pos = geom.attributes.position;
              const norm = geom.attributes.normal;
              const count = pos.count;

              // Generate clean UVs: front torso [0 to 1], back torso [0 to 1]
              const uvs = new Float32Array(count * 2);
              for (let i = 0; i < count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const nz = norm.getZ(i);

                const normX = Math.min(1, Math.max(0, (x + 0.44) / 0.88));
                const normY = Math.min(1, Math.max(0, (y + 0.95) / 1.65));

                if (nz >= 0) {
                  // Front
                  uvs[i * 2] = normX;
                  uvs[i * 2 + 1] = normY;
                } else {
                  // Back: inverted X so left/right aligns naturally from behind
                  uvs[i * 2] = 1 - normX;
                  uvs[i * 2 + 1] = normY;
                }
              }
              geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

              // Partition triangles into groups
              if (geom.index) {
                const origIndices = geom.index.array;
                const numTris = origIndices.length / 3;

                const gFront: number[] = [];
                const gBack: number[] = [];
                const gCollar: number[] = [];
                const gSeams: number[] = [];
                const gLeft: number[] = [];
                const gRight: number[] = [];

                for (let t = 0; t < numTris; t++) {
                  const i0 = origIndices[t * 3];
                  const i1 = origIndices[t * 3 + 1];
                  const i2 = origIndices[t * 3 + 2];

                  const tx = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3;
                  const ty = (pos.getY(i0) + pos.getY(i1) + pos.getY(i2)) / 3;
                  const tnz = (norm.getZ(i0) + norm.getZ(i1) + norm.getZ(i2)) / 3;

                  // 1. Collar & Upper Seams
                  if ((Math.abs(tx) < 0.28 && ty > 0.68) || (ty > 0.78 && Math.abs(tx) <= 0.55)) {
                    gCollar.push(i0, i1, i2);
                  }
                  // 2. Sleeve Seams
                  else if (Math.abs(tx) >= 0.44 && Math.abs(tx) <= 0.52 && ty >= 0.12 && ty <= 0.80) {
                    gSeams.push(i0, i1, i2);
                  }
                  // 3. Left Sleeve (+X)
                  else if (tx > 0.52 && ty >= 0.10 && ty <= 0.82) {
                    gLeft.push(i0, i1, i2);
                  }
                  // 4. Right Sleeve (-X)
                  else if (tx < -0.52 && ty >= 0.10 && ty <= 0.82) {
                    gRight.push(i0, i1, i2);
                  }
                  // 5. Front Torso
                  else if (tnz >= 0.0) {
                    gFront.push(i0, i1, i2);
                  }
                  // 6. Back Torso
                  else {
                    gBack.push(i0, i1, i2);
                  }
                }

                const newIndices = new Uint32Array(origIndices.length);
                let curOffset = 0;
                geom.clearGroups();

                const addGrp = (arr: number[], matIdx: number) => {
                  newIndices.set(arr, curOffset);
                  geom.addGroup(curOffset, arr.length, matIdx);
                  curOffset += arr.length;
                };

                addGrp(gFront, 0); // Front Torso -> matFront
                addGrp(gBack, 1);  // Back Torso -> matBack
                addGrp(gCollar, 2); // Collar -> matCollar
                addGrp(gSeams, 3);  // Sleeve Seams -> matSleeveSeams
                addGrp(gLeft, 4);   // Left Sleeve -> matLeftSleeve
                addGrp(gRight, 5);  // Right Sleeve -> matRightSleeve

                geom.setIndex(new THREE.BufferAttribute(newIndices, 1));
              }

              m.material = materials;
              m.castShadow = true;
              m.receiveShadow = true;
            }
          });

          setLoadedScene(scene);
        },
        undefined,
        () => {
          tryLoad(index + 1);
        }
      );
    };

    tryLoad(0);
  }, [customModelUrl]);

  // Link texture updates to material maps
  useEffect(() => {
    textureManager.onUpdate = () => {
      materials.forEach((m) => {
        if (m.map) m.map.needsUpdate = true;
        m.needsUpdate = true;
      });
    };
  }, [textureManager, materials]);

  return (
    <group scale={[sizeScale, sizeScale, sizeScale]} position={[0, -0.05, 0]}>
      {loadedScene ? (
        <primitive object={loadedScene} />
      ) : (
        <mesh
          ref={meshRef}
          geometry={fallbackGeometry}
          material={materials}
          castShadow
          receiveShadow
        />
      )}
    </group>
  );
};
