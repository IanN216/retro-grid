import { create } from 'zustand';
import type { SimulationState, SimulationActions, TerrainDefinition } from '@/types/simulation';

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
  }
}));