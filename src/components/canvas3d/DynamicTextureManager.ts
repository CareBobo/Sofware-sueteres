import * as THREE from 'three';
import type { DesignElement } from '../../types';

export interface TextureZoneOptions {
  shirtColor: string;
  frontDesignColor: string;
  backDesignColor: string;
  sleeveSeamsColor: string;
  leftSleeveColor: string;
  rightSleeveColor: string;
  collarSeamsColor: string;
  showSleeveSeams: boolean;
  showCollarSeams: boolean;
  showLeftSleeve: boolean;
  showRightSleeve: boolean;
}

export class DynamicTextureManager {
  private frontCanvas: HTMLCanvasElement;
  private frontCtx: CanvasRenderingContext2D;
  public frontTexture: THREE.CanvasTexture;

  private backCanvas: HTMLCanvasElement;
  private backCtx: CanvasRenderingContext2D;
  public backTexture: THREE.CanvasTexture;

  // Legacy accessor for backwards compatibility
  public get texture(): THREE.CanvasTexture {
    return this.frontTexture;
  }

  private imageCache: Map<string, HTMLImageElement> = new Map();
  private isRendering = false;
  private pendingUpdate = false;
  private lastOptions?: TextureZoneOptions;
  private lastElements: DesignElement[] = [];
  public onUpdate?: () => void;

  constructor(resolution = 4096) {
    // 1. Create Front Canvas & Texture (Ultra 4K)
    this.frontCanvas = document.createElement('canvas');
    this.frontCanvas.width = resolution;
    this.frontCanvas.height = resolution;
    const fCtx = this.frontCanvas.getContext('2d', { willReadFrequently: false });
    if (!fCtx) throw new Error('Could not get Front 2D canvas context');
    this.frontCtx = fCtx;
    this.frontCtx.imageSmoothingEnabled = true;
    this.frontCtx.imageSmoothingQuality = 'high';

    this.frontTexture = new THREE.CanvasTexture(this.frontCanvas);
    this.frontTexture.colorSpace = THREE.SRGBColorSpace;
    this.frontTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.frontTexture.magFilter = THREE.LinearFilter;
    this.frontTexture.anisotropy = 16;
    this.frontTexture.generateMipmaps = true;

    // 2. Create Back Canvas & Texture (Ultra 4K)
    this.backCanvas = document.createElement('canvas');
    this.backCanvas.width = resolution;
    this.backCanvas.height = resolution;
    const bCtx = this.backCanvas.getContext('2d', { willReadFrequently: false });
    if (!bCtx) throw new Error('Could not get Back 2D canvas context');
    this.backCtx = bCtx;
    this.backCtx.imageSmoothingEnabled = true;
    this.backCtx.imageSmoothingQuality = 'high';

    this.backTexture = new THREE.CanvasTexture(this.backCanvas);
    this.backTexture.colorSpace = THREE.SRGBColorSpace;
    this.backTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.backTexture.magFilter = THREE.LinearFilter;
    this.backTexture.anisotropy = 16;
    this.backTexture.generateMipmaps = true;

    // Initial clear
    this.clear();
  }

  public clear() {
    this.frontCtx.fillStyle = '#FFFFFF';
    this.frontCtx.fillRect(0, 0, this.frontCanvas.width, this.frontCanvas.height);
    this.frontTexture.needsUpdate = true;

    this.backCtx.fillStyle = '#FFFFFF';
    this.backCtx.fillRect(0, 0, this.backCanvas.width, this.backCanvas.height);
    this.backTexture.needsUpdate = true;
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return Promise.resolve(this.imageCache.get(url)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  public async update(elements: DesignElement[], options?: Partial<TextureZoneOptions>) {
    this.lastElements = elements;
    if (options) {
      this.lastOptions = {
        shirtColor: options.shirtColor || '#FFFFFF',
        frontDesignColor: options.frontDesignColor || options.shirtColor || '#FFFFFF',
        backDesignColor: options.backDesignColor || options.shirtColor || '#FFFFFF',
        sleeveSeamsColor: options.sleeveSeamsColor || options.shirtColor || '#FFFFFF',
        leftSleeveColor: options.leftSleeveColor || options.shirtColor || '#FFFFFF',
        rightSleeveColor: options.rightSleeveColor || options.shirtColor || '#FFFFFF',
        collarSeamsColor: options.collarSeamsColor || options.shirtColor || '#FFFFFF',
        showSleeveSeams: options.showSleeveSeams !== undefined ? options.showSleeveSeams : true,
        showCollarSeams: options.showCollarSeams !== undefined ? options.showCollarSeams : true,
        showLeftSleeve: options.showLeftSleeve !== undefined ? options.showLeftSleeve : true,
        showRightSleeve: options.showRightSleeve !== undefined ? options.showRightSleeve : true,
      };
    }

    const opt = this.lastOptions || {
      shirtColor: '#FFFFFF',
      frontDesignColor: '#FFFFFF',
      backDesignColor: '#FFFFFF',
      sleeveSeamsColor: '#FFFFFF',
      leftSleeveColor: '#FFFFFF',
      rightSleeveColor: '#FFFFFF',
      collarSeamsColor: '#FFFFFF',
      showSleeveSeams: true,
      showCollarSeams: true,
      showLeftSleeve: true,
      showRightSleeve: true,
    };

    if (this.isRendering) {
      this.pendingUpdate = true;
      return;
    }

    this.isRendering = true;

    try {
      const res = this.frontCanvas.width; // 4096

      // Pre-load all images
      const imageElements = elements.filter(el => el.type === 'image' && el.url && el.visible);
      await Promise.all(imageElements.map(el => this.loadImage(el.url!).catch(() => null)));

      // 1. Render Front Canvas
      this.frontCtx.fillStyle = opt.frontDesignColor || opt.shirtColor;
      this.frontCtx.fillRect(0, 0, res, res);

      const frontElements = elements.filter(el => el.side === 'front' && el.visible).sort((a, b) => a.zIndex - b.zIndex);
      for (const el of frontElements) {
        this.renderElement(this.frontCtx, el, res);
      }
      this.frontTexture.needsUpdate = true;

      // 2. Render Back Canvas
      this.backCtx.fillStyle = opt.backDesignColor || opt.shirtColor;
      this.backCtx.fillRect(0, 0, res, res);

      const backElements = elements.filter(el => el.side === 'back' && el.visible).sort((a, b) => a.zIndex - b.zIndex);
      for (const el of backElements) {
        this.renderElement(this.backCtx, el, res);
      }
      this.backTexture.needsUpdate = true;

      if (this.onUpdate) this.onUpdate();
    } finally {
      this.isRendering = false;
      if (this.pendingUpdate) {
        this.pendingUpdate = false;
        this.update(this.lastElements, this.lastOptions);
      }
    }
  }

  private renderElement(ctx: CanvasRenderingContext2D, el: DesignElement, res: number) {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    // Sublimation print area dimensions (relative to 4K canvas)
    // Standard print area covers ~80% of width and ~80% of height with margins
    const availableW = res * 0.78;
    const availableH = res * 0.78;
    const marginX = res * 0.11;
    const marginY = res * 0.11;

    const posX = marginX + el.x * availableW;
    const posY = marginY + el.y * availableH;

    ctx.translate(posX, posY);
    ctx.rotate((el.rotation * Math.PI) / 180);

    const sX = (el.scaleX !== undefined ? el.scaleX : 1) * el.scale;
    const sY = (el.scaleY !== undefined ? el.scaleY : 1) * el.scale;

    if (el.type === 'image' && el.url) {
      const img = this.imageCache.get(el.url);
      if (img && img.width > 0 && img.height > 0) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const baseW = (el.widthCm / 35) * availableW * sX;
        const baseH = (el.heightCm / 45) * availableH * sY;

        ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
      }
    } else if (el.type === 'text' && el.text) {
      const fontSz = (el.fontSize || 36) * (res / 1024) * sY;
      const fontFam = el.fontFamily || 'Impact, sans-serif';
      const weight = el.fontWeight || 'bold';
      const style = el.fontStyle || 'normal';

      ctx.font = `${style} ${weight} ${fontSz}px ${fontFam}`;
      ctx.fillStyle = el.textColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 4;
      ctx.fillText(el.text, 0, 0);
    }

    ctx.restore();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.frontCanvas;
  }

  public getBackCanvas(): HTMLCanvasElement {
    return this.backCanvas;
  }

  public dispose() {
    this.frontTexture.dispose();
    this.backTexture.dispose();
    this.imageCache.clear();
  }
}
