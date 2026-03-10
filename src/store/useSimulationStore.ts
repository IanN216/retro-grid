import { create } from 'zustand';
import type { SimulationState, SimulationActions, TerrainDefinition } from '@/types/simulation';
import { createNoise2D } from 'simplex-noise';

function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1^h2^h3^h4) >>> 0;
}

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const tileModules = import.meta.glob('@/resources/tiles/*.webp', { eager: true });

function loadTerrains(): TerrainDefinition[] {
  const terrains: TerrainDefinition[] = [];
  const paths = Object.keys(tileModules).sort((a, b) => {
    const numA = parseInt(a.match(/_(\d+)\.webp/)?.[1] || '0', 10);
    const numB = parseInt(b.match(/_(\d+)\.webp/)?.[1] || '0', 10);
    return numA - numB;
  });

  paths.forEach((path, index) => {
    const module = tileModules[path] as { default: string };
    const src = module.default;
    const filename = path.split('/').pop()?.replace('.webp', '') || 'unknown';
    const name = filename.split('_')[0];
    const imageElement = new Image();
    imageElement.src = src;

    terrains.push({
      id: index,
      name,
      spriteIndex: index,
      color: '#000000',
      src,
      imageElement,
    });
  });

  return terrains;
}

const INITIAL_TERRAINS = loadTerrains();

function generateCells(cols: number, rows: number): Uint8Array {
  const cells = new Uint8Array(cols * rows);
  const grassId = 0; // grass is ID 0
  cells.fill(grassId);
  return cells;
}

const INITIAL_COLS = 20;
const INITIAL_ROWS = 20;

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  cols: INITIAL_COLS,
  rows: INITIAL_ROWS,
  cells: generateCells(INITIAL_COLS, INITIAL_ROWS),
  entities: [],
  selectedCell: null,
  hoveredCell: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  showMapMenu: true,
  inputCols: String(INITIAL_COLS),
  inputRows: String(INITIAL_ROWS),
  spriteSheet: null,
  terrains: INITIAL_TERRAINS,
  terrainSprites: INITIAL_TERRAINS.reduce((acc, t) => ({ ...acc, [t.id]: t.spriteIndex }), {}),

  setGridSize: (cols: number, rows: number) => {
    const clampedCols = Math.max(1, Math.min(100, cols));
    const clampedRows = Math.max(1, Math.min(100, rows));
    set({
      cols: clampedCols,
      rows: clampedRows,
      cells: generateCells(clampedCols, clampedRows),
      selectedCell: null,
      hoveredCell: null,
      entities: [],
      inputCols: String(clampedCols),
      inputRows: String(clampedRows),
    });
  },

  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setHoveredCell: (cell) => set({ hoveredCell: cell }),

  setCellTerrain: (x: number, y: number, terrainId: number) => {
    const state = get();
    const idx = y * state.cols + x;
    if (idx < 0 || idx >= state.cells.length) return;
    const newCells = new Uint8Array(state.cells);
    newCells[idx] = terrainId;
    set({ cells: newCells });
  },

  setZoom: (zoom: number) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),

  setPan: (x: number, y: number) => set({ panX: x, panY: y }),

  toggleMapMenu: () => set((s) => ({ showMapMenu: !s.showMapMenu })),

  setInputCols: (val: string) => set({ inputCols: val }),
  setInputRows: (val: string) => set({ inputRows: val }),

  // Placeholder for future turn-based simulation logic
  processTurn: () => {
    const state = get();
    // Future: iterate over cells and entities to compute next state
    console.log(`[Engine] Processing turn for ${state.cols}x${state.rows} grid (${state.cells.length} cells)`);
  },

  setSpriteSheet: (image: HTMLImageElement | null) => set({ spriteSheet: image }),
  
  updateTerrainSprite: (terrainId: number, tileIndex: number) => {
    const state = get();
    const newTerrains = state.terrains.map(t => 
      t.id === terrainId ? { ...t, spriteIndex: tileIndex } : t
    );
    set({
      terrains: newTerrains,
      terrainSprites: {
        ...state.terrainSprites,
        [terrainId]: tileIndex,
      },
    });
  },

  addTerrain: (name: string, spriteIndex: number, color?: string) => {
    const state = get();
    if (state.terrains.length >= 256) {
      console.warn('Cannot add more than 256 terrain types');
      return;
    }
    const newId = state.terrains.length;
    const newTerrain: TerrainDefinition = {
      id: newId,
      name,
      spriteIndex,
      color: color || '#ff00ff'
    };
    set({
      terrains: [...state.terrains, newTerrain],
      terrainSprites: {
        ...state.terrainSprites,
        [newId]: spriteIndex,
      },
    });
  },

  generateProceduralMap: (seed: string) => {
    const state = get();
    const seedNum = cyrb128(seed || '8bit');
    const randomFunc = mulberry32(seedNum);
    const noise2D = createNoise2D(randomFunc);
    
    const newCells = new Uint8Array(state.cells.length);
    
    const grassId = state.terrains.find(t => t.name === 'grass')?.id ?? 0;
    const stoneId = state.terrains.find(t => t.name === 'stone')?.id ?? 1;
    const waterId = state.terrains.find(t => t.name === 'water')?.id ?? 2;
    const sandId = state.terrains.find(t => t.name === 'sand')?.id ?? 3;

    const scale = 0.1;
    
    for (let y = 0; y < state.rows; y++) {
      for (let x = 0; x < state.cols; x++) {
        const nx = x * scale;
        const ny = y * scale;
        
        let e = 1 * noise2D(1 * nx, 1 * ny)
              + 0.5 * noise2D(2 * nx, 2 * ny)
              + 0.25 * noise2D(4 * nx, 4 * ny);
              
        e = e / (1 + 0.5 + 0.25);
        e = (e + 1) / 2;
        
        let terrainId = grassId;
        if (e < 0.3) terrainId = waterId;
        else if (e < 0.4) terrainId = sandId;
        else if (e < 0.7) terrainId = grassId;
        else terrainId = stoneId;
        
        const index = y * state.cols + x;
        newCells[index] = terrainId;
      }
    }
    
    set({ cells: newCells });
  }
}));