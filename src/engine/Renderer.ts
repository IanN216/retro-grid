import { TERRAIN_TYPE_BY_ID, type TerrainType } from '@/types/simulation';
import { useSimulationStore } from '@/store/useSimulationStore';

const TERRAIN_COLORS: Record<TerrainType, string> = {
  grass: '#2d5a1e',
  stone: '#6b6b6b',
  water: '#1a4a7a',
  sand: '#c4a43e',
  void: '#111111',
};

const TERRAIN_COLORS_ALT: Record<TerrainType, string> = {
  grass: '#3a6e28',
  stone: '#7a7a7a',
  water: '#2060a0',
  sand: '#d4b44e',
  void: '#1a1a1a',
};

const GRID_LINE_COLOR = 'rgba(0, 0, 0, 0.35)';
const SELECTED_COLOR = '#ffd700';
const HOVER_COLOR = 'rgba(255, 255, 255, 0.25)';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cellSize: number = 16;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas 2D context');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGrid() {
    const state = useSimulationStore.getState();
    const { cells, cols, rows, zoom, panX, panY, selectedCell, hoveredCell, spriteSheet, terrainSprites } = state;

    this.clear();
    const ctx = this.ctx;
    const cellSize = this.cellSize * zoom;

    ctx.save();
    ctx.translate(panX, panY);

    // Calculate visible bounds for culling
    const startCol = Math.max(0, Math.floor(-panX / cellSize));
    const startRow = Math.max(0, Math.floor(-panY / cellSize));
    const endCol = Math.min(cols, Math.ceil((this.width - panX) / cellSize));
    const endRow = Math.min(rows, Math.ceil((this.height - panY) / cellSize));

    // Draw terrain cells
    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const terrainId = cells[y * cols + x];
        const terrainType = TERRAIN_TYPE_BY_ID[terrainId];
        if (!terrainType) continue;

        const px = x * cellSize;
        const py = y * cellSize;

        if (spriteSheet) {
          const tileIndex = terrainSprites[terrainType] ?? 0;
          const colsSheet = Math.floor(spriteSheet.width / 16);
          const sx = (tileIndex % colsSheet) * 16;
          const sy = Math.floor(tileIndex / colsSheet) * 16;
          ctx.drawImage(spriteSheet, sx, sy, 16, 16, px, py, cellSize, cellSize);
        } else {
          // Checkerboard pattern for visual depth
          const isAlt = (x + y) % 2 === 0;
          ctx.fillStyle = isAlt
            ? TERRAIN_COLORS[terrainType]
            : TERRAIN_COLORS_ALT[terrainType];
          ctx.fillRect(px, py, cellSize, cellSize);

          // Draw pixel-art detail dots for grass terrain
          if (terrainType === 'grass' && cellSize >= 8) {
            ctx.fillStyle = isAlt ? '#4a8a35' : '#3d7a2a';
            const dotSize = Math.max(1, cellSize * 0.1);
            ctx.fillRect(px + cellSize * 0.25, py + cellSize * 0.25, dotSize, dotSize);
            ctx.fillRect(px + cellSize * 0.7, py + cellSize * 0.6, dotSize, dotSize);
          }

          if (terrainType === 'stone' && cellSize >= 8) {
            ctx.fillStyle = isAlt ? '#888888' : '#5e5e5e';
            const dotSize = Math.max(1, cellSize * 0.15);
            ctx.fillRect(px + cellSize * 0.3, py + cellSize * 0.5, dotSize, dotSize);
            ctx.fillRect(px + cellSize * 0.6, py + cellSize * 0.3, dotSize, dotSize);
          }

          if (terrainType === 'water' && cellSize >= 8) {
            ctx.fillStyle = '#3090d0';
            const dotSize = Math.max(1, cellSize * 0.2);
            const waveOffset = (Date.now() / 600 + x * 0.5) % 2;
            ctx.fillRect(px + cellSize * 0.2, py + cellSize * (0.3 + waveOffset * 0.05), dotSize, Math.max(1, dotSize * 0.4));
          }
        }
      }
    }

    // Draw grid lines
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;

    for (let x = startCol; x <= endCol; x++) {
      const px = Math.floor(x * cellSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, startRow * cellSize);
      ctx.lineTo(px, endRow * cellSize);
      ctx.stroke();
    }
    for (let y = startRow; y <= endRow; y++) {
      const py = Math.floor(y * cellSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(startCol * cellSize, py);
      ctx.lineTo(endCol * cellSize, py);
      ctx.stroke();
    }

    // Hover highlight
    if (hoveredCell && hoveredCell.x >= 0 && hoveredCell.x < cols && hoveredCell.y >= 0 && hoveredCell.y < rows) {
      ctx.fillStyle = HOVER_COLOR;
      ctx.fillRect(hoveredCell.x * cellSize, hoveredCell.y * cellSize, cellSize, cellSize);
    }

    // Selection highlight
    if (selectedCell && selectedCell.x >= 0 && selectedCell.x < cols && selectedCell.y >= 0 && selectedCell.y < rows) {
      ctx.strokeStyle = SELECTED_COLOR;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selectedCell.x * cellSize + 1,
        selectedCell.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
      // Inner glow
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        selectedCell.x * cellSize + 3,
        selectedCell.y * cellSize + 3,
        cellSize - 6,
        cellSize - 6
      );
    }

    // Grid border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cols * cellSize, rows * cellSize);

    ctx.restore();
  }

  getCellAtPosition(
    canvasX: number,
    canvasY: number,
    cols: number,
    rows: number,
    zoom: number,
    panX: number,
    panY: number
  ): { x: number; y: number } | null {
    const cellSize = this.cellSize * zoom;
    const gridX = Math.floor((canvasX - panX) / cellSize);
    const gridY = Math.floor((canvasY - panY) / cellSize);

    if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
      return { x: gridX, y: gridY };
    }
    return null;
  }
}