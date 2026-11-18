import React, { useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useEditorStore } from '../../store/editorStore';
import { DynamicTextureManager } from './DynamicTextureManager';
import { TShirtMesh } from './TShirtMesh';
import { CameraController } from './CameraController';

interface StudioCanvasProps {
  onTextureManagerReady?: (manager: DynamicTextureManager) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({ onTextureManagerReady, canvasRef }) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const elements = useEditorStore((s) => s.elements);

  // Initialize Dynamic Texture Manager once
  const textureManager = useMemo(() => {
    return new DynamicTextureManager(2048);
  }, []);

  useEffect(() => {
    if (onTextureManagerReady) {
      onTextureManagerReady(textureManager);
    }
    return () => {
      textureManager.dispose();
    };
  }, [textureManager, onTextureManagerReady]);

  const shirtColor = useEditorStore((s) => s.shirtColor);
  const frontDesignColor = useEditorStore((s) => s.frontDesignColor);
  const backDesignColor = useEditorStore((s) => s.backDesignColor);
  const sleeveSeamsColor = useEditorStore((s) => s.sleeveSeamsColor);
  const leftSleeveColor = useEditorStore((s) => s.leftSleeveColor);
  const rightSleeveColor = useEditorStore((s) => s.rightSleeveColor);
  const collarSeamsColor = useEditorStore((s) => s.collarSeamsColor);
  const showSleeveSeams = useEditorStore((s) => s.showSleeveSeams);
  const showCollarSeams = useEditorStore((s) => s.showCollarSeams);
  const showLeftSleeve = useEditorStore((s) => s.showLeftSleeve);
  const showRightSleeve = useEditorStore((s) => s.showRightSleeve);

  // Sync canvas graphics whenever store elements, colors or visibility change
  useEffect(() => {
    textureManager.update(elements, {
      shirtColor,
      frontDesignColor,
      backDesignColor,
      sleeveSeamsColor,
      leftSleeveColor,
      rightSleeveColor,
      collarSeamsColor,
      showSleeveSeams,
      showCollarSeams,
      showLeftSleeve,
      showRightSleeve,
    });
  }, [
    elements,
    shirtColor,
    frontDesignColor,
    backDesignColor,
    sleeveSeamsColor,
    leftSleeveColor,
    rightSleeveColor,
    collarSeamsColor,
    showSleeveSeams,
    showCollarSeams,
    showLeftSleeve,
    showRightSleeve,
    textureManager,
  ]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        ref={canvasRef as any}
        camera={{ position: [0, 0.15, 2.8], fov: 42 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          toneMappingExposure: 1.15,
        }}
        className="w-full h-full"
      >
        {/* Studio Lighting System */}
        <ambientLight intensity={0.8} />
        
        {/* Main Key Light */}
        <directionalLight
          position={[3, 4, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Soft Fill Light from opposite angle */}
        <directionalLight position={[-3, 2, 3]} intensity={0.7} />
        
        {/* Back Rim Light for clothing edge separation */}
        <directionalLight position={[0, 4, -4]} intensity={0.9} />
        
        {/* Subtle Under Light */}
        <pointLight position={[0, -2, 2]} intensity={0.3} />

        {/* 3D T-Shirt Mesh */}
        <TShirtMesh textureManager={textureManager} />

        {/* Realistic Floor Contact Shadow */}
        <ContactShadows
          position={[0, -0.92, 0]}
          opacity={0.65}
          scale={3.5}
          blur={1.8}
          far={1.6}
        />

        {/* Camera Controls & Preset Navigator */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={1.2}
          maxDistance={4.8}
          maxPolarAngle={Math.PI / 1.75}
          minPolarAngle={Math.PI / 4.5}
          dampingFactor={0.08}
        />
        <CameraController controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
};
