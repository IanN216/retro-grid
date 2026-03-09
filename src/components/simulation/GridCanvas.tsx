import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { Renderer } from '@/engine/Renderer';

export const GridCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const rafRef = useRef<number>(0);
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const cols = useSimulationStore((s) => s.cols);
  const rows = useSimulationStore((s) => s.rows);
  const zoom = useSimulationStore((s) => s.zoom);
  const selectedCell = useSimulationStore((s) => s.selectedCell);
  const hoveredCell = useSimulationStore((s) => s.hoveredCell);
  const setZoom = useSimulationStore((s) => s.setZoom);
  const setPan = useSimulationStore((s) => s.setPan);
  const setSelectedCell = useSimulationStore((s) => s.setSelectedCell);
  const setHoveredCell = useSimulationStore((s) => s.setHoveredCell);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    rendererRef.current = new Renderer(canvas);
  }, []);

  // Resize canvas to fill container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = 1; // Use 1 for pixel-perfect retro look
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        rendererRef.current?.resize(canvas.width, canvas.height);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const render = () => {
      const renderer = rendererRef.current;
      if (renderer) {
        const state = useSimulationStore.getState();
        renderer.drawGrid(
          state.cells,
          state.cols,
          state.rows,
          state.zoom,
          state.panX,
          state.panY,
          state.selectedCell,
          state.hoveredCell
        );
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Get canvas-relative coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
        // Middle click, right click, or shift+left click for panning
        isPanningRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      } else if (e.button === 0) {
        const coords = getCanvasCoords(e);
        const renderer = rendererRef.current;
        if (renderer) {
          const state = useSimulationStore.getState();
          const cell = renderer.getCellAtPosition(
            coords.x, coords.y,
            state.cols, state.rows,
            state.zoom, state.panX, state.panY
          );
          setSelectedCell(cell);
        }
      }
    },
    [getCanvasCoords, setSelectedCell]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        const state = useSimulationStore.getState();
        setPan(state.panX + dx, state.panY + dy);
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const coords = getCanvasCoords(e);
        const renderer = rendererRef.current;
        if (renderer) {
          const state = useSimulationStore.getState();
          const cell = renderer.getCellAtPosition(
            coords.x, coords.y,
            state.cols, state.rows,
            state.zoom, state.panX, state.panY
          );
          setHoveredCell(cell);
        }
      }
    },
    [getCanvasCoords, setPan, setHoveredCell]
  );

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPanningRef.current = false;
    setHoveredCell(null);
  }, [setHoveredCell]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const state = useSimulationStore.getState();
      const newZoom = Math.max(0.25, Math.min(4, state.zoom + delta));

      // Zoom towards mouse position
      const coords = getCanvasCoords(e);
      const zoomRatio = newZoom / state.zoom;
      const newPanX = coords.x - (coords.x - state.panX) * zoomRatio;
      const newPanY = coords.y - (coords.y - state.panY) * zoomRatio;

      setZoom(newZoom);
      setPan(newPanX, newPanY);
    },
    [getCanvasCoords, setZoom, setPan]
  );

  // Center grid when size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gridW = cols * 16 * zoom;
    const gridH = rows * 16 * zoom;
    const cx = (canvas.width - gridW) / 2;
    const cy = (canvas.height - gridH) / 2;
    setPan(cx, cy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-retro-bg"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />

      {/* HUD Overlay */}
      <div className="absolute top-2 left-2 font-pixel text-[8px] text-retro-text-dim bg-black/60 px-2 py-1 pointer-events-none select-none">
        <span className="text-retro-gold">{cols}×{rows}</span>
        {' | '}
        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
        {selectedCell && (
          <>
            {' | '}
            <span className="text-retro-success">
              Cell: ({selectedCell.x}, {selectedCell.y})
            </span>
          </>
        )}
        {hoveredCell && (
          <>
            {' | '}
            <span className="text-retro-info">
              Hover: ({hoveredCell.x}, {hoveredCell.y})
            </span>
          </>
        )}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-2 left-2 font-pixel text-[7px] text-retro-text-dim/60 pointer-events-none select-none">
        Click: Select | Shift+Drag: Pan | Scroll: Zoom
      </div>
    </div>
  );
};
