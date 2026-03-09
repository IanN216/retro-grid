export interface TerrainDefinition {
  id: number;
  name: string;
  spriteIndex: number;
  color: string;
}

export interface Entity {
  id: string;
  name: string;
  spriteKey: string;
  x: number;
  y: number;
  hp: number;
  attack: number;
  defense: number;
}

export type SpriteMapping = Record<number, number>; // maps terrain ID to sprite index

export interface SimulationState {
  cols: number;
  rows: number;
  cells: Uint8Array;
  entities: Entity[];
  selectedCell: { x: number; y: number } | null;
  hoveredCell: { x: number; y: number } | null;
  zoom: number;
  panX: number;
  panY: number;
  showMapMenu: boolean;
  inputCols: string;
  inputRows: string;
  spriteSheet: HTMLImageElement | null;
  terrains: TerrainDefinition[];
  terrainSprites: SpriteMapping;
}

export interface SimulationActions {
  setGridSize: (cols: number, rows: number) => void;
  setSelectedCell: (cell: { x: number; y: number } | null) => void;
  setHoveredCell: (cell: { x: number; y: number } | null) => void;
  setCellTerrain: (x: number, y: number, terrainId: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleMapMenu: () => void;
  setInputCols: (val: string) => void;
  setInputRows: (val: string) => void;
  processTurn: () => void;
  setSpriteSheet: (image: HTMLImageElement | null) => void;
  updateTerrainSprite: (terrainId: number, tileIndex: number) => void;
  addTerrain: (name: string, spriteIndex: number, color?: string) => void;
}