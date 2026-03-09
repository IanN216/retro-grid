import React, { useRef, MouseEvent } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import { Button8bit } from '@/components/ui/8bit/Button8bit';
import { Card8bit } from '@/components/ui/8bit/Card8bit';
import { TerrainType } from '@/types/simulation';

interface AssetPanelProps {
  activeTerrain: TerrainType;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({ activeTerrain }) => {
  const spriteSheet = useSimulationStore((s) => s.spriteSheet);
  const setSpriteSheet = useSimulationStore((s) => s.setSpriteSheet);
  const updateTerrainSprite = useSimulationStore((s) => s.updateTerrainSprite);
  const terrainSprites = useSimulationStore((s) => s.terrainSprites);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      setSpriteSheet(img);
    };
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!spriteSheet) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = spriteSheet.width / rect.width;
    const scaleY = spriteSheet.height / rect.height;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const actualX = x * scaleX;
    const actualY = y * scaleY;

    const cols = Math.floor(spriteSheet.width / 16);
    const tileCol = Math.floor(actualX / 16);
    const tileRow = Math.floor(actualY / 16);

    const index = tileRow * cols + tileCol;
    updateTerrainSprite(activeTerrain, index);
  };

  return (
    <Card8bit title="Assets" variant="default">
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/png"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button8bit size="sm" onClick={() => fileInputRef.current?.click()} className="w-full">
          Upload Sprite Sheet
        </Button8bit>

        {spriteSheet && (
          <div className="mt-2 flex flex-col items-center">
            <p className="font-pixel text-[8px] text-retro-text-dim mb-1 text-center">
              Select tile for <span className="text-retro-gold">{activeTerrain.toUpperCase()}</span>
            </p>
            <div 
              className="relative cursor-pointer border-2 border-retro-border"
              onClick={handleImageClick}
              style={{ width: '100%', maxWidth: `${spriteSheet.width}px`, aspectRatio: `${spriteSheet.width} / ${spriteSheet.height}`, overflow: 'hidden' }}
            >
              <img 
                src={spriteSheet.src} 
                alt="Sprite Sheet" 
                style={{ imageRendering: 'pixelated', width: '100%', height: '100%', objectFit: 'contain' }} 
                draggable={false}
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundSize: `${(16 / spriteSheet.width) * 100}% ${(16 / spriteSheet.height) * 100}%`,
                  backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
                  `
                }}
              />
              {terrainSprites[activeTerrain] !== undefined && (
                <div 
                  className="absolute border-2 border-retro-gold pointer-events-none"
                  style={{
                    width: `${(16 / spriteSheet.width) * 100}%`,
                    height: `${(16 / spriteSheet.height) * 100}%`,
                    left: `${((terrainSprites[activeTerrain] % Math.floor(spriteSheet.width / 16)) * 16 / spriteSheet.width) * 100}%`,
                    top: `${(Math.floor(terrainSprites[activeTerrain] / Math.floor(spriteSheet.width / 16)) * 16 / spriteSheet.height) * 100}%`
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Card8bit>
  );
};
