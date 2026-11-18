import { ProjectData, OrderItem } from '../types';

const DB_NAME = 'shadana_3d_studio_db';
const DB_VERSION = 1;

const STORES = {
  PROJECTS: 'projects',
  ORDERS: 'orders',
  ASSETS: 'assets',
};

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
            db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.ORDERS)) {
            db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.ASSETS)) {
            db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  // --- PROJECTS ---
  async saveProject(project: ProjectData): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROJECTS, 'readwrite');
      tx.objectStore(STORES.PROJECTS).put(project);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProjects(): Promise<ProjectData[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROJECTS, 'readonly');
      const request = tx.objectStore(STORES.PROJECTS).getAll();
      request.onsuccess = () => {
        const list = (request.result || []) as ProjectData[];
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProjectById(id: string): Promise<ProjectData | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROJECTS, 'readonly');
      const request = tx.objectStore(STORES.PROJECTS).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PROJECTS, 'readwrite');
      tx.objectStore(STORES.PROJECTS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- ORDERS ---
  async saveOrder(order: OrderItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ORDERS, 'readwrite');
      tx.objectStore(STORES.ORDERS).put(order);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getOrders(): Promise<OrderItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ORDERS, 'readonly');
      const request = tx.objectStore(STORES.ORDERS).getAll();
      request.onsuccess = () => {
        const list = (request.result || []) as OrderItem[];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrder(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ORDERS, 'readwrite');
      tx.objectStore(STORES.ORDERS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- ASSETS (Uploaded images cached locally) ---
  async saveAsset(id: string, dataUrl: string, name: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ASSETS, 'readwrite');
      tx.objectStore(STORES.ASSETS).put({ id, dataUrl, name, date: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAssets(): Promise<{ id: string; dataUrl: string; name: string }[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.ASSETS, 'readonly');
      const request = tx.objectStore(STORES.ASSETS).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

export const storageService = new StorageService();
