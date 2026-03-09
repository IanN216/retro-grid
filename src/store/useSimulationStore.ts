import { create } from 'zustand';
import type { SimulationState, SimulationActions, TerrainDefinition } from '@/types/simulation';

const INITIAL_TERRAINS: TerrainDefinition[] = [
  { id: 0, name: 'grass', spriteIndex: 0, color: '#2d5a1e' },
  { id: 1, name: 'stone', spriteIndex: 1, color: '#6b6b6b' },
  { id: 2, name: 'water', spriteIndex: 2, color: '#1a4a7a' },
  { id: 3, name: 'sand',  spriteIndex: 3, color: '#c4a43e' },
  { id: 4, name: 'void',  spriteIndex: 4, color: '#111111' },
];

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