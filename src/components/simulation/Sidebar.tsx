import React, { useCallback, useState } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { Button8bit } from '@/components/ui/8bit/Button8bit';
import { Card8bit } from '@/components/ui/8bit/Card8bit';
import { Input8bit } from '@/components/ui/8bit/Input8bit';
import { TERRAIN_IDS, TERRAIN_TYPE_BY_ID, type TerrainType } from '@/types/simulation';

const TERRAIN_OPTIONS: { type: TerrainType; label: string; color: string }[] = [
  { type: 'grass', label: 'Grass', color: 'bg-retro-grass' },
  { type: 'stone', label: 'Stone', color: 'bg-retro-stone' },
  { type: 'water', label: 'Water', color: 'bg-retro-water' },
  { type: 'sand', label: 'Sand', color: 'bg-retro-sand' },
  { type: 'void', label: 'Void', color: 'bg-retro-void' },
];

const PRESET_SIZES = [
  { label: '10×10', cols: 10, rows: 10 },
  { label: '20×20', cols: 20, rows: 20 },
  { label: '50×50', cols: 50, rows: 50 },
  { label: '100×100', cols: 100, rows: 100 },
];

export const Sidebar: React.FC = () => {
  const showMapMenu = useSimulationStore((s) => s.showMapMenu);
  const toggleMapMenu = useSimulationStore((s) => s.toggleMapMenu);
  const setGridSize = useSimulationStore((s) => s.setGridSize);
  const cols = useSimulationStore((s) => s.cols);
  const rows = useSimulationStore((s) => s.rows);
  const cells = useSimulationStore((s) => s.cells);
  const selectedCell = useSimulationStore((s) => s.selectedCell);
  const setCellTerrain = useSimulationStore((s) => s.setCellTerrain);
  const setZoom = useSimulationStore((s) => s.setZoom);
  const zoom = useSimulationStore((s) => s.zoom);
  const processTurn = useSimulationStore((s) => s.processTurn);
  const inputCols = useSimulationStore((s) => s.inputCols);
  const inputRows = useSimulationStore((s) => s.inputRows);
  const setInputCols = useSimulationStore((s) => s.setInputCols);
  const setInputRows = useSimulationStore((s) => s.setInputRows);

  const [activeTerrain, setActiveTerrain] = useState<TerrainType>('grass');

  const handleApplySize = useCallback(() => {
    const c = parseInt(inputCols) || cols;
    const r = parseInt(inputRows) || rows;
    setGridSize(c, r);
  }, [inputCols, inputRows, cols, rows, setGridSize]);

  const handlePaintCell = useCallback(() => {
    if (selectedCell) {
      setCellTerrain(selectedCell.x, selectedCell.y, TERRAIN_IDS[activeTerrain]);
    }
  }, [selectedCell, activeTerrain, setCellTerrain]);

  let selectedCellData = null;
  if (selectedCell) {
    const idx = selectedCell.y * cols + selectedCell.x;
    const terrainId = cells[idx];
    selectedCellData = {
      x: selectedCell.x,
      y: selectedCell.y,
      terrainType: TERRAIN_TYPE_BY_ID[terrainId],
      index: idx
    };
  }

  return (
    <div className="w-[280px] min-w-[280px] bg-retro-panel border-l-[3px] border-retro-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b-[3px] border-retro-border bg-retro-card">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-retro-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" />
          <h1 className="font-pixel text-[11px] text-retro-gold tracking-wider">
            SIMULATOR
          </h1>
          <div className="w-3 h-3 bg-retro-accent shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" />
        </div>
        <p className="font-pixel text-[7px] text-retro-text-dim mt-1">
          Grid Map Editor v0.1
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Map toggle button */}
        <Button8bit
          variant="gold"
          size="lg"
          className="w-full"
          onClick={toggleMapMenu}
        >
          ◈ MAP {showMapMenu ? '▲' : '▼'}
        </Button8bit>

        {/* Map configuration panel */}
        {showMapMenu && (
          <Card8bit title="Map Config" variant="gold">
            <div className="flex flex-col gap-3">
              {/* Size inputs */}
              <div className="flex gap-2">
                <Input8bit
                  label="Cols (X)"
                  type="number"
                  min={1}
                  max={100}
                  value={inputCols}
                  onChange={(e) => setInputCols(e.target.value)}
                  className="w-full"
                />
                <Input8bit
                  label="Rows (Y)"
                  type="number"
                  min={1}
                  max={100}
                  value={inputRows}
                  onChange={(e) => setInputRows(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button8bit
                variant="accent"
                size="md"
                className="w-full"
                onClick={handleApplySize}
              >
                ✦ APPLY SIZE
              </Button8bit>

              {/* Presets */}
              <div>
                <p className="font-pixel text-[7px] text-retro-text-dim uppercase mb-2">
                  Quick Presets
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SIZES.map((preset) => (
                    <Button8bit
                      key={preset.label}
                      variant={cols === preset.cols && rows === preset.rows ? 'gold' : 'default'}
                      size="sm"
                      onClick={() => setGridSize(preset.cols, preset.rows)}
                    >
                      {preset.label}
                    </Button8bit>
                  ))}
                </div>
              </div>

              {/* Zoom controls */}
              <div>
                <p className="font-pixel text-[7px] text-retro-text-dim uppercase mb-2">
                  Zoom: {(zoom * 100).toFixed(0)}%
                </p>
                <div className="flex gap-1.5">
                  <Button8bit size="sm" onClick={() => setZoom(zoom - 0.25)}>
                    −
                  </Button8bit>
                  <Button8bit size="sm" onClick={() => setZoom(1)} variant="ghost" className="flex-1">
                    Reset
                  </Button8bit>
                  <Button8bit size="sm" onClick={() => setZoom(zoom + 0.25)}>
                    +
                  </Button8bit>
                </div>
              </div>
            </div>
          </Card8bit>
        )}

        {/* Terrain Palette */}
        <Card8bit title="Terrain" variant="default">
          <div className="flex flex-col gap-1.5">
            {TERRAIN_OPTIONS.map((t) => (
              <button
                key={t.type}
                onClick={() => setActiveTerrain(t.type)}
                className={`
                  flex items-center gap-2 px-2 py-1.5 font-pixel text-[8px]
                  border-2 transition-all cursor-pointer
                  ${
                    activeTerrain === t.type
                      ? 'border-retro-gold bg-retro-card text-retro-gold shadow-[inset_0_0_8px_rgba(255,215,0,0.15)]'
                      : 'border-transparent text-retro-text-dim hover:text-retro-text hover:border-retro-text-dim/30'
                  }
                `}
              >
                <div className={`w-4 h-4 ${t.color} border border-black/50 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]`} />
                <span className="uppercase">{t.label}</span>
                {activeTerrain === t.type && (
                  <span className="ml-auto text-retro-gold">◄</span>
                )}
              </button>
            ))}
          </div>
          <Button8bit
            variant="default"
            size="sm"
            className="w-full mt-2"
            onClick={handlePaintCell}
            disabled={!selectedCell}
          >
            ✎ Paint Cell
          </Button8bit>
        </Card8bit>

        {/* Cell Inspector */}
        <Card8bit title="Inspector" variant="accent">
          {selectedCellData ? (
            <div className="font-pixel text-[8px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-retro-text-dim">Position:</span>
                <span className="text-retro-gold">
                  ({selectedCellData.x}, {selectedCellData.y})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-retro-text-dim">Terrain:</span>
                <span className="text-retro-success uppercase">
                  {selectedCellData.terrainType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-retro-text-dim">Entity:</span>
                <span className="text-retro-text-dim/50">
                  None
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-retro-text-dim">Index:</span>
                <span className="text-retro-info">
                  {selectedCellData.index}
                </span>
              </div>
            </div>
          ) : (
            <p className="font-pixel text-[8px] text-retro-text-dim/50 text-center py-2">
              Click a cell to inspect
            </p>
          )}
        </Card8bit>

        {/* Engine Controls */}
        <Card8bit title="Engine" variant="default">
          <div className="flex flex-col gap-2">
            <Button8bit
              variant="accent"
              size="md"
              className="w-full"
              onClick={processTurn}
            >
              ⚡ Process Turn
            </Button8bit>
            <div className="font-pixel text-[7px] text-retro-text-dim space-y-1">
              <div className="flex justify-between">
                <span>Total Cells:</span>
                <span className="text-retro-gold">{cells.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Grid Size:</span>
                <span className="text-retro-info">{cols} × {rows}</span>
              </div>
              <div className="flex justify-between">
                <span>Entities:</span>
                <span className="text-retro-text-dim/50">0</span>
              </div>
            </div>
          </div>
        </Card8bit>
      </div>

      {/* Footer */}
      <div className="p-2 border-t-[3px] border-retro-border bg-retro-card">
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5"
              style={{
                backgroundColor: i % 2 === 0 ? '#ffd700' : '#e94560',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
        <p className="font-pixel text-[6px] text-retro-text-dim/40 text-center mt-1">
          8-BIT GRID SIMULATOR
        </p>
      </div>
    </div>
  );
};