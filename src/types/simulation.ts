export type TerrainType = 'grass' | 'stone' | 'water' | 'sand' | 'void';

export const TERRAIN_IDS: Record<TerrainType, number> = {
  grass: 0,
  stone: 1,
  water: 2,
  sand: 3,
  void: 4,
};

export const TERRAIN_TYPE_BY_ID: Record<number, TerrainType> = Object.entries(TERRAIN_IDS).reduce(
  (acc, [key, val]) => ({ ...acc, [val]: key as TerrainType }),
  {}
);

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

export type SpriteMapping = Record<TerrainType, number>;

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
  updateTerrainSprite: (terrain: TerrainType, tileIndex: number) => void;
}