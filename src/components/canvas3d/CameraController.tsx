import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useEditorStore } from '../../store/editorStore';

export const CameraController: React.FC<{ controlsRef: React.RefObject<OrbitControlsImpl | null> }> = ({ controlsRef }) => {
  const { camera } = useThree();
  const cameraPreset = useEditorStore((s) => s.cameraPreset);
  const cameraPresetNonce = useEditorStore((s) => s.cameraPresetNonce);

  const targetPosition = useRef(new THREE.Vector3(0, 0.1, 2.7));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!cameraPreset) return;

    isTransitioning.current = true;
    switch (cameraPreset) {
      case 'front':
        targetPosition.current.set(0, 0.05, 2.65);
        break;
      case 'back':
        targetPosition.current.set(0, 0.05, -2.65);
        break;
      case 'left':
        targetPosition.current.set(-2.65, 0.05, 0);
        break;
      case 'right':
        targetPosition.current.set(2.65, 0.05, 0);
        break;
      case 'reset':
      default:
        targetPosition.current.set(0, 0.15, 2.8);
        break;
    }

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, [cameraPreset, cameraPresetNonce, controlsRef]);

  useFrame((_, delta) => {
    if (isTransitioning.current) {
      camera.position.lerp(targetPosition.current, Math.min(1, delta * 5));
      if (camera.position.distanceTo(targetPosition.current) < 0.02) {
        camera.position.copy(targetPosition.current);
        isTransitioning.current = false;
      }
      if (controlsRef.current) {
        controlsRef.current.update();
      }
    }
  });

  return null;
};
