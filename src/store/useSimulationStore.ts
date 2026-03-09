import { create } from 'zustand';
import { TERRAIN_IDS, type SimulationState, type SimulationActions } from '@/types/simulation';

function generateCells(cols: number, rows: number): Uint8Array {
  const cells = new Uint8Array(cols * rows);
  const grassId = TERRAIN_IDS['grass'];
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
}));