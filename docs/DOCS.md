# 🎮 8-Bit Grid Simulator — Documentación Técnica Completa

> **Versión:** 0.1.0  
> **Stack:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4 · Zustand 5 · HTML5 Canvas  
> **Estética:** Retro 8-bit inspirada en Cladun X2  

---

## Tabla de Contenidos

1. [Cómo Correr el Sistema](#1-cómo-correr-el-sistema)
2. [Arquitectura General](#2-arquitectura-general)
3. [Estructura de Archivos](#3-estructura-de-archivos)
4. [Configuración del Proyecto](#4-configuración-del-proyecto)
5. [Sistema de Tipos](#5-sistema-de-tipos)
6. [Estado Global (Zustand Store)](#6-estado-global-zustand-store)
7. [Motor de Renderizado (Engine)](#7-motor-de-renderizado-engine)
8. [Componentes UI 8-bit](#8-componentes-ui-8-bit)
9. [Componentes de Simulación](#9-componentes-de-simulación)
10. [Punto de Entrada (App)](#10-punto-de-entrada-app)
11. [Sistema de Estilos y Temas](#11-sistema-de-estilos-y-temas)
12. [Flujo de Datos](#12-flujo-de-datos)
13. [Guía de Extensión](#13-guía-de-extensión)
14. [Decisiones Técnicas y Justificación](#14-decisiones-técnicas-y-justificación)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Cómo Correr el Sistema

### 1.1 Prerrequisitos

Antes de clonar o ejecutar el proyecto, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Verificar con              |
|-------------|---------------|----------------------------|
| **Node.js** | 18.x o superior | `node --version`          |
| **npm**     | 9.x o superior  | `npm --version`           |
| **Git**     | Cualquier versión estable | `git --version` |

> **Nota:** Si usas `nvm` para gestionar versiones de Node, ejecuta `nvm use 20` para usar Node 20 LTS.

### 1.2 Instalación Paso a Paso

```bash
# 1. Clonar el repositorio (reemplaza <URL> con la URL real del repo)
git clone <URL> 8bit-grid-simulator
cd 8bit-grid-simulator

# 2. Instalar todas las dependencias
npm install
```

El comando `npm install` descargará e instalará:

| Paquete              | Propósito                                              |
|----------------------|--------------------------------------------------------|
| `react`, `react-dom` | Framework de UI                                       |
| `zustand`            | Gestión de estado global sin boilerplate               |
| `clsx`               | Utilidad para combinar class names condicionalmente    |
| `tailwind-merge`     | Resuelve conflictos de clases Tailwind                 |
| `vite`               | Bundler ultrarrápido con HMR                           |
| `@vitejs/plugin-react` | Plugin de Vite para soporte de React + JSX          |
| `tailwindcss`        | Framework CSS utility-first                            |
| `@tailwindcss/vite`  | Integración nativa de Tailwind con Vite                |
| `typescript`         | Superset tipado de JavaScript                          |
| `vite-plugin-singlefile` | Empaqueta todo en un solo archivo HTML para producción |

### 1.3 Ejecutar en Modo Desarrollo (con Hot Reload)

```bash
npm run dev
```

**¿Qué sucede internamente?**

1. Vite arranca un servidor de desarrollo en `http://localhost:5173` (o el siguiente puerto disponible).
2. Carga `index.html` como punto de entrada HTML.
3. `index.html` contiene `<script type="module" src="/src/main.tsx"></script>`, que importa el módulo raíz.
4. `main.tsx` monta el componente `<App />` en el `<div id="root">` del HTML.
5. La fuente **"Press Start 2P"** se descarga desde Google Fonts (requiere conexión a Internet la primera vez).
6. El Canvas se inicializa, el store de Zustand se crea con una grilla de 20×20, y el `requestAnimationFrame` loop comienza a renderizar a ~60 FPS.
7. La aplicación está lista para interactuar.

**Abre tu navegador en:** [`http://localhost:5173`](http://localhost:5173)

> Si el puerto 5173 está ocupado, Vite elegirá otro automáticamente. Revisa la terminal para ver el puerto real.

### 1.4 Compilar para Producción

```bash
npm run build
```

**¿Qué sucede internamente?**

1. Vite ejecuta `tsc` implícitamente para verificar tipos TypeScript.
2. Vite compila y empaqueta todo el código fuente en la carpeta `dist/`.
3. El plugin `vite-plugin-singlefile` toma todos los assets (JS, CSS) y los inyecta inline dentro de `dist/index.html`.
4. El resultado es un **único archivo HTML** completamente autónomo.

```
dist/
└── index.html    ← Archivo único que contiene TODO (HTML + CSS + JS)
```

### 1.5 Previsualizar el Build de Producción

```bash
npm run preview
```

Esto arranca un servidor estático local sirviendo la carpeta `dist/`, permitiéndote verificar que el build de producción funciona correctamente antes de desplegarlo.

**Abre tu navegador en:** [`http://localhost:4173`](http://localhost:4173)

### 1.6 Desplegar

Dado que el build genera un solo `index.html`, puedes:

- **Subirlo a cualquier hosting estático** (Vercel, Netlify, GitHub Pages).
- **Abrirlo directamente** en un navegador haciendo doble clic en el archivo (funciona como una aplicación offline).
- **Servirlo** con cualquier servidor HTTP: `npx serve dist`.

### 1.7 Verificación Post-Lanzamiento

Al cargar la aplicación correctamente deberás ver:

| Elemento                             | Ubicación en Pantalla     |
|--------------------------------------|---------------------------|
| Cuadrícula verde (20×20 por defecto) | Centro-izquierda          |
| HUD con "20×20 \| Zoom: 100%"       | Esquina superior izquierda|
| Hint "Click: Select \| Shift+Drag..." | Esquina inferior izquierda |
| Barra lateral "SIMULATOR"           | Lado derecho              |
| Botón dorado "◈ MAP"                | Parte superior del sidebar|
| Panel "Map Config" expandido         | Debajo del botón MAP      |
| Panel "Terrain"                      | Más abajo en el sidebar   |
| Panel "Inspector"                    | Más abajo                 |
| Panel "Engine"                       | Parte inferior del sidebar|

Si la fuente aparece como texto serif o sans-serif genérico, la fuente "Press Start 2P" no se cargó. Verifica tu conexión a Internet.

---

## 2. Arquitectura General

El proyecto sigue una arquitectura de **3 capas** diseñada para performance y escalabilidad:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CAPA DE PRESENTACIÓN                       │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────────────┐       │
│  │    GridCanvas.tsx     │    │       Sidebar.tsx             │       │
│  │  (Canvas + Eventos)  │    │  (Controles UI 8-bit)        │       │
│  └──────────┬───────────┘    └──────────────┬───────────────┘       │
│             │                               │                       │
│  ┌──────────▼───────────┐    ┌──────────────▼───────────────┐       │
│  │   Button8bit.tsx     │    │     Card8bit.tsx              │       │
│  │   Input8bit.tsx      │    │     (Componentes atómicos)    │       │
│  └──────────────────────┘    └──────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                         CAPA DE ESTADO                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │            useSimulationStore.ts (Zustand)                │       │
│  │  • cols, rows, cells[], entities[]                        │       │
│  │  • selectedCell, hoveredCell                              │       │
│  │  • zoom, panX, panY                                       │       │
│  │  • Actions: setGridSize, setCellTerrain, processTurn...   │       │
│  └──────────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                         CAPA DE RENDERIZADO                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                  Renderer.ts (Clase Pura JS)              │       │
│  │  • drawGrid() → Viewport culling + Canvas 2D API         │       │
│  │  • getCellAtPosition() → Hit detection por coordenadas    │       │
│  │  • clear(), resize()                                      │       │
│  └──────────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                      CAPA DE TIPOS / CONTRATOS                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                  simulation.d.ts                           │       │
│  │  • Cell, Entity, TerrainType                              │       │
│  │  • SimulationState, SimulationActions                     │       │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separación Canvas ↔ React:** El renderizado de la cuadrícula se delega a una clase pura JS (`Renderer.ts`) fuera del ciclo de vida de React. React no gestiona 10,000 elementos DOM; gestiona solo el sidebar y los overlays.

2. **Single Source of Truth:** Todo el estado mutable vive en Zustand. Ni el Renderer ni los componentes UI guardan estado duplicado.

3. **requestAnimationFrame Loop:** El canvas se redibuja cada frame (~60 FPS) leyendo directamente del store, sin causar re-renders en React.

4. **Viewport Culling:** Solo se dibujan las celdas visibles en pantalla, lo que permite escalar a 100×100 (10,000 celdas) sin degradación.

---

## 3. Estructura de Archivos

```
📁 raíz/
├── 📄 index.html                          → HTML principal con fuente Google Fonts
├── 📄 package.json                        → Dependencias y scripts
├── 📄 tsconfig.json                       → Configuración TypeScript
├── 📄 vite.config.ts                      → Configuración Vite + plugins
├── 📄 DOCS.md                             → Esta documentación
│
└── 📁 src/
    ├── 📄 main.tsx                        → Punto de montaje React (createRoot)
    ├── 📄 App.tsx                         → Layout principal (GridCanvas + Sidebar)
    ├── 📄 index.css                       → Tema Tailwind + estilos globales retro
    │
    ├── 📁 types/
    │   └── 📄 simulation.d.ts             → Interfaces y tipos del dominio
    │
    ├── 📁 store/
    │   └── 📄 useSimulationStore.ts       → Store Zustand (estado + acciones)
    │
    ├── 📁 engine/
    │   └── 📄 Renderer.ts                 → Motor de renderizado Canvas 2D
    │
    ├── 📁 utils/
    │   └── 📄 cn.ts                       → Helper clsx + tailwind-merge
    │
    └── 📁 components/
        ├── 📁 ui/8bit/
        │   ├── 📄 Button8bit.tsx          → Botón estilo 8-bit con variantes
        │   ├── 📄 Card8bit.tsx            → Tarjeta con doble borde retro
        │   └── 📄 Input8bit.tsx           → Input pixelado con label
        │
        └── 📁 simulation/
            ├── 📄 GridCanvas.tsx          → Canvas interactivo con zoom/pan
            └── 📄 Sidebar.tsx             → Panel de control lateral
```

---

## 4. Configuración del Proyecto

### 4.1 `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>8-Bit Grid Simulator — Retro Dungeon Map Editor</title>
    <!-- Fuente pixelada cargada desde Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Notas importantes:**
- El `<link rel="preconnect">` optimiza la carga de la fuente reduciendo la latencia DNS.
- El atributo `crossorigin` es obligatorio para preconnect con Google Fonts.
- El `type="module"` indica a Vite que use ESM nativo.

### 4.2 `vite.config.ts`

```typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

| Configuración | Propósito |
|---------------|-----------|
| `react()` | Habilita JSX transform, Fast Refresh (HMR) |
| `tailwindcss()` | Integra Tailwind CSS 4 como plugin de Vite nativo |
| `viteSingleFile()` | Empaqueta todo en un solo `.html` en producción |
| `alias "@"` | Permite importar como `@/store/...` en lugar de rutas relativas |

### 4.3 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
```

**Punto clave:** Los `paths` de TypeScript deben coincidir con el `alias` de Vite. Ambos mapean `@/` → `src/`.

---

## 5. Sistema de Tipos

**Archivo:** `src/types/simulation.d.ts`

Este archivo define el contrato de datos de toda la aplicación. Ningún componente debería usar tipos `any` para las estructuras del dominio.

### 5.1 TerrainType

```typescript
export type TerrainType = 'grass' | 'stone' | 'water' | 'sand' | 'void';
```

Tipo unión literal que restringe los valores de terreno válidos. Al añadir un nuevo terreno, se debe actualizar este tipo, el mapa de colores en `Renderer.ts`, y las opciones en `Sidebar.tsx`.

### 5.2 Cell

```typescript
export interface Cell {
  x: number;          // Columna (0-indexed, de izquierda a derecha)
  y: number;          // Fila (0-indexed, de arriba a abajo)
  terrainType: TerrainType;  // Tipo de terreno visual
  entityId?: string | null;  // ID de la entidad ocupante (futuro)
}
```

**Diseño del array plano:**  
Las celdas se almacenan en un array unidimensional, no en una matriz 2D. La fórmula de acceso es:

```
index = y * cols + x
```

Ejemplo para una grilla 5×5, la celda (2, 3) está en el índice `3 * 5 + 2 = 17`.

**Razón:** Un array plano tiene mejor locality de caché y es más eficiente para iteraciones secuenciales que un `Cell[][]`.

### 5.3 Entity

```typescript
export interface Entity {
  id: string;         // Identificador único (e.g., UUID)
  name: string;       // Nombre visible ("Goblin", "Hero")
  spriteKey: string;  // Clave para buscar el sprite en un futuro atlas
  x: number;          // Posición columna
  y: number;          // Posición fila
  hp: number;         // Puntos de vida
  attack: number;     // Valor de ataque
  defense: number;    // Valor de defensa
}
```

**Estado actual:** Las entidades están definidas pero no se crean aún. El array `entities` del store está vacío. El campo `entityId` en `Cell` es el enlace preparado para conectar ambos.

### 5.4 SimulationState y SimulationActions

```typescript
export interface SimulationState {
  cols: number;                              // Columnas de la grilla
  rows: number;                              // Filas de la grilla
  cells: Cell[];                             // Array plano de celdas
  entities: Entity[];                        // Entidades en el mapa
  selectedCell: { x: number; y: number } | null;  // Celda seleccionada
  hoveredCell: { x: number; y: number } | null;   // Celda bajo el cursor
  zoom: number;                              // Factor de zoom (0.25 a 4.0)
  panX: number;                              // Desplazamiento horizontal en px
  panY: number;                              // Desplazamiento vertical en px
  showMapMenu: boolean;                      // Visibilidad del panel Map Config
  inputCols: string;                         // Valor del input de columnas (string para UX)
  inputRows: string;                         // Valor del input de filas (string para UX)
}

export interface SimulationActions {
  setGridSize: (cols: number, rows: number) => void;
  setSelectedCell: (cell: { x: number; y: number } | null) => void;
  setHoveredCell: (cell: { x: number; y: number } | null) => void;
  setCellTerrain: (x: number, y: number, terrain: TerrainType) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleMapMenu: () => void;
  setInputCols: (val: string) => void;
  setInputRows: (val: string) => void;
  processTurn: () => void;
}
```

**Nota de diseño:** `inputCols` e `inputRows` son `string` (no `number`) intencionalmente para evitar problemas con inputs controlados (e.g., el usuario escribe "1" y quiere escribir "10", pero si se parsea inmediatamente como número, el "0" se pierde).

---

## 6. Estado Global (Zustand Store)

**Archivo:** `src/store/useSimulationStore.ts`

### 6.1 Creación del Store

```typescript
import { create } from 'zustand';

export const useSimulationStore = create<SimulationState & SimulationActions>((set, get) => ({
  // Estado inicial...
  // Acciones...
}));
```

Zustand usa el patrón `create` que retorna un hook (`useSimulationStore`). Este hook:
- **En componentes React:** Provoca re-render cuando el slice seleccionado cambia.
- **Fuera de React:** Se puede leer con `useSimulationStore.getState()` sin suscripciones.

### 6.2 Función `generateCells`

```typescript
function generateCells(cols: number, rows: number): Cell[] {
  const cells: Cell[] = new Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells[y * cols + x] = {
        x,
        y,
        terrainType: 'grass',
        entityId: null,
      };
    }
  }
  return cells;
}
```

- Pre-aloca el array con `new Array(cols * rows)` para evitar resizing dinámico.
- Todas las celdas inician como `'grass'` sin entidad.
- Para 100×100, genera exactamente 10,000 objetos `Cell`.

### 6.3 Acciones del Store

| Acción | Comportamiento |
|--------|---------------|
| `setGridSize(cols, rows)` | Clampea valores a [1, 100], regenera todo el array de celdas, limpia selección y entidades, actualiza los inputs. Es un **reset completo** del mapa. |
| `setSelectedCell(cell)` | Establece o limpia (`null`) la celda seleccionada. |
| `setHoveredCell(cell)` | Establece o limpia la celda bajo el cursor. Se llama en cada `mousemove` del canvas. |
| `setCellTerrain(x, y, terrain)` | Clona el array `cells`, reemplaza el tipo de terreno de la celda específica. Usa spread para inmutabilidad. |
| `setZoom(zoom)` | Clampea el zoom entre 0.25 (25%) y 4.0 (400%). |
| `setPan(x, y)` | Establece el desplazamiento del viewport sin restricciones (libre scrolling). |
| `toggleMapMenu()` | Alterna la visibilidad del panel de configuración del mapa. |
| `setInputCols/setInputRows(val)` | Actualiza los valores de los inputs como strings. |
| `processTurn()` | **Placeholder.** Actualmente solo imprime un log. Preparado para iterar sobre celdas y entidades. |

### 6.4 Patrones de Uso

**Desde componentes React (con suscripción selectiva):**
```typescript
// Solo re-renderiza cuando 'cols' cambia
const cols = useSimulationStore((s) => s.cols);

// Múltiples selectores = múltiples suscripciones
const setGridSize = useSimulationStore((s) => s.setGridSize);
```

**Desde el Renderer (sin suscripción, lectura directa):**
```typescript
// En el requestAnimationFrame loop
const state = useSimulationStore.getState();
renderer.drawGrid(state.cells, state.cols, ...);
```

Esto es crucial: el loop de renderizado **NO** usa el hook, sino `getState()` para evitar que React se involucre en cada frame.

---

## 7. Motor de Renderizado (Engine)

**Archivo:** `src/engine/Renderer.ts`

### 7.1 Visión General

La clase `Renderer` es una **clase pura de JavaScript** sin dependencias de React. Recibe un `HTMLCanvasElement` en el constructor y expone métodos de dibujo.

```typescript
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cellSize: number = 16; // Tamaño base de celda en píxeles
}
```

### 7.2 Constructor

```typescript
constructor(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');
  this.ctx = ctx;
  this.ctx.imageSmoothingEnabled = false; // Crítico para pixel art
}
```

`imageSmoothingEnabled = false` asegura que las imágenes y el dibujo se rendericen con bordes nítidos, sin antialiasing. Esto es esencial para la estética retro.

### 7.3 Mapas de Colores de Terreno

```typescript
const TERRAIN_COLORS: Record<TerrainType, string> = {
  grass: '#2d5a1e',   // Verde oscuro
  stone: '#6b6b6b',   // Gris medio
  water: '#1a4a7a',   // Azul oscuro
  sand:  '#c4a43e',   // Dorado arena
  void:  '#111111',   // Casi negro
};

const TERRAIN_COLORS_ALT: Record<TerrainType, string> = {
  grass: '#3a6e28',   // Verde ligeramente más claro
  stone: '#7a7a7a',
  water: '#2060a0',
  sand:  '#d4b44e',
  void:  '#1a1a1a',
};
```

Se usan **dos variantes** de color por terreno para crear un patrón de **tablero de ajedrez** (checkerboard) que da profundidad visual sin sprites.

### 7.4 Método `drawGrid()` — El Corazón del Renderizado

```typescript
drawGrid(
  cells: Cell[],
  cols: number,
  rows: number,
  zoom: number,
  panX: number,
  panY: number,
  selectedCell: { x: number; y: number } | null,
  hoveredCell: { x: number; y: number } | null
)
```

**Flujo de ejecución:**

1. **Clear:** Llena todo el canvas de negro.
2. **Calcular tamaño de celda:** `cellSize = 16 * zoom`.
3. **Save + Translate:** Guarda el estado del contexto y aplica el paneo.
4. **Viewport Culling:** Calcula qué rango de celdas es visible:
   ```
   startCol = max(0, floor(-panX / cellSize))
   endCol   = min(cols, ceil((canvasWidth - panX) / cellSize))
   ```
   Solo las celdas dentro de este rango se dibujan. Para una grilla 100×100 con zoom normal, típicamente solo ~30×20 celdas son visibles.
5. **Dibujar terreno:** Itera sobre las celdas visibles y dibuja rectángulos con el color correspondiente (alternando con el patrón checkerboard).
6. **Detalles pixel-art:** Si la celda es lo suficientemente grande (≥ 8px), dibuja pequeños puntos decorativos:
   - **Grass:** Dos puntitos verdes claros (simulando briznas).
   - **Stone:** Dos puntitos grises (simulando fragmentos).
   - **Water:** Un "trazo" azul claro con animación ondulante basada en `Date.now()`.
7. **Indicador de entidad:** Si `cell.entityId` no es null, dibuja un cuadrado rojo centrado (placeholder para futuros sprites).
8. **Líneas de grilla:** Líneas negras semi-transparentes separando cada celda.
9. **Hover highlight:** Relleno blanco semi-transparente sobre la celda bajo el cursor.
10. **Selection highlight:** Doble borde dorado sobre la celda seleccionada (borde exterior + borde interior "glow").
11. **Borde de mapa:** Marco dorado alrededor de toda la grilla.
12. **Restore:** Restaura el estado del contexto.

### 7.5 Método `getCellAtPosition()` — Hit Detection

```typescript
getCellAtPosition(
  canvasX: number, canvasY: number,
  cols: number, rows: number,
  zoom: number, panX: number, panY: number
): { x: number; y: number } | null
```

Convierte coordenadas de píxel del canvas a coordenadas de celda:

```
gridX = floor((canvasX - panX) / (16 * zoom))
gridY = floor((canvasY - panY) / (16 * zoom))
```

Retorna `null` si las coordenadas están fuera de los límites de la grilla.

### 7.6 Rendimiento

| Grilla  | Celdas Totales | Celdas Visibles (típico) | FPS Esperado |
|---------|---------------|-------------------------|--------------|
| 10×10   | 100           | 100                     | 60           |
| 20×20   | 400           | 400                     | 60           |
| 50×50   | 2,500         | ~600                    | 60           |
| 100×100 | 10,000        | ~600                    | 60           |

El viewport culling asegura que el costo de renderizado es **proporcional al viewport, no a la grilla total**.

---

## 8. Componentes UI 8-bit

Estos componentes replican la estética de `8bitcn/ui` con bordes biselados, sombras pixeladas y la fuente "Press Start 2P".

### 8.1 `Button8bit`

**Archivo:** `src/components/ui/8bit/Button8bit.tsx`

**Props:**

| Prop      | Tipo                                        | Default     | Descripción                    |
|-----------|---------------------------------------------|-------------|--------------------------------|
| `variant` | `'default' \| 'accent' \| 'gold' \| 'ghost'` | `'default'` | Estilo visual del botón       |
| `size`    | `'sm' \| 'md' \| 'lg'`                       | `'md'`      | Tamaño (afecta padding y font) |
| `...rest` | `ButtonHTMLAttributes`                        | —           | Todos los atributos nativos   |

**Variantes visuales:**

- **default:** Fondo panel oscuro, borde gris. Uso general.
- **accent:** Fondo rojo (#e94560), borde rosa. Acciones importantes.
- **gold:** Fondo dorado, borde amarillo. Acciones principales/destacadas.
- **ghost:** Transparente, sin borde. Acciones secundarias.

**Efectos CSS:**

- `active:translate-y-[2px]` → Efecto de "presión" al hacer clic.
- `shadow` con `inset` → Simula bisel 3D retro (borde superior iluminado, inferior oscuro).
- `disabled:opacity-50` → Atenuación visual cuando está deshabilitado.

### 8.2 `Card8bit`

**Archivo:** `src/components/ui/8bit/Card8bit.tsx`

**Props:**

| Prop      | Tipo                                    | Default     | Descripción                  |
|-----------|-----------------------------------------|-------------|------------------------------|
| `title`   | `string \| undefined`                   | —           | Título opcional con prefijo ">" |
| `variant` | `'default' \| 'gold' \| 'accent'`       | `'default'` | Color del borde y título     |
| `children`| `ReactNode`                              | —           | Contenido de la tarjeta      |

**Estructura DOM:**
```
<div class="card-exterior">      ← Borde de 3px + sombra de doble borde
  <div class="inner-highlight">  ← Borde interior blanco sutil (simulación de bisel)
  {title && <h3 + <hr>}          ← Encabezado con separador
  {children}                     ← Contenido
</div>
```

### 8.3 `Input8bit`

**Archivo:** `src/components/ui/8bit/Input8bit.tsx`

**Props:**

| Prop    | Tipo                           | Default | Descripción              |
|---------|--------------------------------|---------|--------------------------|
| `label` | `string \| undefined`          | —       | Etiqueta superior        |
| `...rest`| `InputHTMLAttributes`          | —       | Atributos nativos del input |

**Detalles de estilo:**
- Sombra `inset` para simular que el input está "hundido".
- Al enfocar: borde dorado + glow exterior.
- Oculta spinners nativos del input numérico con CSS para mantener la estética.

---

## 9. Componentes de Simulación

### 9.1 `GridCanvas`

**Archivo:** `src/components/simulation/GridCanvas.tsx`

Este es el componente más complejo del sistema. Conecta el Canvas HTML5 con React.

**Refs internas:**
| Ref             | Tipo                | Propósito                              |
|-----------------|---------------------|----------------------------------------|
| `canvasRef`     | `HTMLCanvasElement`  | Referencia al elemento canvas del DOM  |
| `containerRef`  | `HTMLDivElement`     | Contenedor para calcular dimensiones   |
| `rendererRef`   | `Renderer`           | Instancia del motor de renderizado     |
| `rafRef`        | `number`             | ID del requestAnimationFrame activo    |
| `isPanningRef`  | `boolean`            | Bandera de arrastre activo             |
| `lastMouseRef`  | `{x, y}`            | Última posición del mouse para calcular delta |

**Effects y su propósito:**

| `useEffect` | Dependencias | Qué hace |
|-------------|-------------|----------|
| Init Renderer | `[]` | Crea la instancia de `Renderer` una sola vez. |
| Resize Observer | `[]` | Usa `ResizeObserver` para ajustar el canvas al tamaño del contenedor. Usa DPR=1 para mantener el look pixelado. |
| Animation Loop | `[]` | Inicia el `requestAnimationFrame` loop. Lee el estado con `getState()` cada frame y llama a `renderer.drawGrid()`. Limpia con `cancelAnimationFrame` al desmontar. |
| Center Grid | `[cols, rows]` | Recalcula `panX/panY` para centrar la grilla cuando cambia el tamaño. |

**Manejo de eventos del mouse:**

| Evento        | Comportamiento |
|---------------|---------------|
| `mousedown` (btn 0) | Calcula la celda bajo el cursor y la selecciona. |
| `mousedown` (btn 1/2 o shift+btn 0) | Activa modo paneo. |
| `mousemove` (panning) | Calcula delta y actualiza `panX/panY`. |
| `mousemove` (normal) | Calcula la celda bajo el cursor y actualiza `hoveredCell`. |
| `mouseup` | Desactiva modo paneo. |
| `mouseleave` | Desactiva paneo y limpia `hoveredCell`. |
| `wheel` | Ajusta zoom hacia/desde la posición del cursor (zoom focal). |

**Fórmula de zoom focal:**
```typescript
const zoomRatio = newZoom / currentZoom;
const newPanX = mouseX - (mouseX - panX) * zoomRatio;
const newPanY = mouseY - (mouseY - panY) * zoomRatio;
```

Esto mantiene el punto bajo el cursor fijo mientras se hace zoom, dando una experiencia similar a Google Maps.

**Overlays HTML:**

Sobre el canvas se renderizan dos elementos HTML (no dibujados en el canvas):
- **HUD superior izquierdo:** Muestra tamaño de grilla, zoom%, celda seleccionada y celda hover.
- **Hint inferior izquierdo:** Instrucciones de controles.

Ambos tienen `pointer-events-none` para no interferir con los eventos del canvas.

### 9.2 `Sidebar`

**Archivo:** `src/components/simulation/Sidebar.tsx`

Panel de control lateral de 280px de ancho fijo, dividido en secciones:

**Estructura vertical:**

```
┌──────────────────┐
│    HEADER        │  ← Título "SIMULATOR" + versión
├──────────────────┤
│  SCROLLABLE AREA │
│                  │
│  ◈ MAP (toggle)  │  ← Botón gold que muestra/oculta Map Config
│                  │
│  ┌── Map Config ─┐│ ← Card gold: inputs de tamaño + presets + zoom
│  │ Cols [ ] Rows  ││
│  │ [APPLY SIZE]   ││
│  │ 10×10 20×20... ││
│  │ Zoom: [-][+]   ││
│  └────────────────┘│
│                    │
│  ┌── Terrain ────┐ │ ← Card default: paleta de 5 terrenos
│  │ ● Grass    ◄  │ │
│  │ ● Stone       │ │
│  │ ● Water       │ │
│  │ [Paint Cell]  │ │
│  └───────────────┘ │
│                    │
│  ┌── Inspector ──┐ │ ← Card accent: datos de celda seleccionada
│  │ Pos: (x, y)   │ │
│  │ Terrain: grass │ │
│  │ Entity: None   │ │
│  └───────────────┘ │
│                    │
│  ┌── Engine ─────┐ │ ← Card default: controles de simulación
│  │ [Process Turn] │ │
│  │ Cells: 400     │ │
│  └───────────────┘ │
│                    │
├────────────────────┤
│    FOOTER          │  ← Decoración pixelada
└────────────────────┘
```

**Estado local:**
- `activeTerrain: TerrainType` — El terreno seleccionado en la paleta, usado al pintar celdas.

**Flujos de interacción:**

1. **Cambiar tamaño del mapa:**
   - El usuario escribe en los inputs Cols/Rows.
   - Los valores se almacenan como strings (`inputCols`, `inputRows`) en el store.
   - Al presionar "APPLY SIZE", se parsean a enteros y se llama a `setGridSize()`.
   - `setGridSize()` clampea los valores, regenera las celdas, y limpia la selección.

2. **Usar presets:**
   - Click en "10×10", "20×20", etc. llama directamente a `setGridSize(cols, rows)`.
   - El preset activo se resalta con variante `gold`.

3. **Pintar terreno:**
   - El usuario selecciona un tipo de terreno en la paleta.
   - Luego hace click en una celda del canvas para seleccionarla.
   - Presiona "Paint Cell" → llama a `setCellTerrain(x, y, activeTerrain)`.

4. **Inspeccionar celda:**
   - Al seleccionar una celda, el panel Inspector muestra posición, terreno, entidad e índice en el array.

---

## 10. Punto de Entrada (App)

**Archivo:** `src/App.tsx`

```typescript
export function App() {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-retro-bg">
      <GridCanvas />
      <Sidebar />
    </div>
  );
}
```

Layout extremadamente simple:
- Un `flex` container de pantalla completa.
- `GridCanvas` ocupa todo el espacio disponible (`flex-1`).
- `Sidebar` tiene ancho fijo de 280px (`w-[280px] min-w-[280px]`).
- `overflow-hidden` previene scrollbars del body.

**Archivo:** `src/main.tsx`

```typescript
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`StrictMode` está habilitado, lo que en desarrollo provoca doble ejecución de effects para detectar side-effects no limpiados. En producción no tiene efecto.

---

## 11. Sistema de Estilos y Temas

**Archivo:** `src/index.css`

### 11.1 Tema Personalizado (Tailwind CSS 4)

Tailwind CSS 4 usa `@theme` para definir design tokens:

```css
@theme {
  --font-pixel: 'Press Start 2P', monospace;
  --color-retro-bg: #1a1a2e;
  --color-retro-panel: #16213e;
  --color-retro-card: #0f3460;
  --color-retro-accent: #e94560;
  --color-retro-gold: #ffd700;
  --color-retro-gold-dark: #b8960f;
  --color-retro-text: #e0e0e0;
  --color-retro-text-dim: #8888aa;
  --color-retro-border: #533483;
  --color-retro-success: #4ade80;
  --color-retro-info: #60a5fa;
  --color-retro-grass: #2d5a1e;
  --color-retro-stone: #6b6b6b;
  --color-retro-water: #1a4a7a;
  --color-retro-sand: #c4a43e;
  --color-retro-void: #111111;
}
```

Estos se usan en clases de Tailwind como `bg-retro-bg`, `text-retro-gold`, `border-retro-accent`, etc.

### 11.2 Paleta de Colores

| Token              | Hex       | Uso                           |
|--------------------|-----------|-------------------------------|
| `retro-bg`         | `#1a1a2e` | Fondo general de la app       |
| `retro-panel`      | `#16213e` | Fondo del sidebar y tarjetas  |
| `retro-card`       | `#0f3460` | Fondo de secciones destacadas |
| `retro-accent`     | `#e94560` | Acciones importantes, alertas |
| `retro-gold`       | `#ffd700` | Elementos premium/activos     |
| `retro-gold-dark`  | `#b8960f` | Variante oscura del dorado    |
| `retro-text`       | `#e0e0e0` | Texto principal               |
| `retro-text-dim`   | `#8888aa` | Texto secundario/atenuado     |
| `retro-border`     | `#533483` | Bordes de paneles (púrpura)   |
| `retro-success`    | `#4ade80` | Indicadores positivos         |
| `retro-info`       | `#60a5fa` | Información contextual        |

### 11.3 Estilos Globales

```css
* { image-rendering: pixelated; }  /* Todo se renderiza sin antialiasing */

body {
  background-color: var(--color-retro-bg);
  color: var(--color-retro-text);
  font-family: var(--font-pixel);
  overflow: hidden;  /* Sin scrollbars */
}
```

### 11.4 Scrollbar Personalizado

```css
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--color-retro-bg); }
::-webkit-scrollbar-thumb {
  background: var(--color-retro-border);
  border: 1px solid var(--color-retro-gold-dark);
}
```

### 11.5 Utilidad `cn()`

**Archivo:** `src/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Combina:
- `clsx`: Permite arrays, objetos condicionales, y strings como argumentos.
- `twMerge`: Resuelve conflictos de clases Tailwind (e.g., `bg-red-500` + `bg-blue-500` → solo `bg-blue-500`).

---

## 12. Flujo de Datos

### 12.1 Diagrama de Flujo Completo

```
                                        ┌─────────────────────┐
                                        │    index.html        │
                                        │  <div id="root">    │
                                        └────────┬────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────────┐
                                        │     main.tsx         │
                                        │  createRoot().render │
                                        └────────┬────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────────┐
                                        │      App.tsx         │
                                        │  flex: Grid + Side   │
                                        └───┬─────────────┬───┘
                                            │             │
                              ┌─────────────▼──┐    ┌─────▼──────────┐
                              │  GridCanvas.tsx │    │  Sidebar.tsx   │
                              │  (Canvas)      │    │  (Controls)    │
                              └───────┬────────┘    └───────┬────────┘
                                      │                     │
          ┌───────────────────────────▼─────────────────────▼────────┐
          │                    Zustand Store                          │
          │  useSimulationStore.ts                                   │
          │  ┌────────────────────────────────────────────────────┐  │
          │  │ state: { cols, rows, cells[], zoom, pan, ... }    │  │
          │  │ actions: { setGridSize, setCellTerrain, ... }     │  │
          │  └────────────────────────────────────────────────────┘  │
          └───────────────────────────┬─────────────────────────────┘
                                      │ .getState()
                                      ▼
                              ┌───────────────┐
                              │  Renderer.ts   │
                              │  drawGrid()    │  ← llamado 60 veces/segundo
                              │  Canvas 2D API │     via requestAnimationFrame
                              └───────────────┘
```

### 12.2 Flujo: El Usuario Cambia el Tamaño del Mapa

```
1. Usuario escribe "50" en input Cols  →  setInputCols("50")
2. Usuario escribe "50" en input Rows  →  setInputRows("50")
3. Usuario presiona "APPLY SIZE"       →  handleApplySize()
4. handleApplySize() parsea "50" → 50  →  setGridSize(50, 50)
5. setGridSize clampea [1,100]         →  50 está en rango ✓
6. generateCells(50, 50)               →  Crea array de 2,500 Cell
7. Store actualiza:
   - cols: 50, rows: 50
   - cells: [2500 items]
   - selectedCell: null
   - entities: []
   - inputCols: "50", inputRows: "50"
8. GridCanvas useEffect[cols, rows]    →  Recalcula panX/panY para centrar
9. Siguiente frame de rAF:
   - Renderer.drawGrid() lee nuevo estado
   - Dibuja nueva grilla de 50×50
10. Sidebar re-renderiza:
    - Inspector muestra "Click a cell to inspect"
    - Engine stats muestra "Total Cells: 2,500"
```

### 12.3 Flujo: El Usuario Hace Click en una Celda

```
1. MouseEvent 'mousedown' en canvas
2. GridCanvas.handleMouseDown()
3. getCanvasCoords(e) → {x: 245, y: 180}
4. renderer.getCellAtPosition(245, 180, cols, rows, zoom, panX, panY)
5. Cálculo: gridX = floor((245 - panX) / (16 * zoom)) = 8
             gridY = floor((180 - panY) / (16 * zoom)) = 5
6. Retorna { x: 8, y: 5 }
7. setSelectedCell({ x: 8, y: 5 })
8. Store actualiza selectedCell
9. Siguiente frame de rAF:
   - Renderer dibuja borde dorado en celda (8, 5)
10. Sidebar re-renderiza:
    - Inspector muestra "Position: (8, 5), Terrain: grass, Entity: None, Index: 168"
```

### 12.4 Flujo: El Usuario Pinta una Celda

```
1. Usuario selecciona "stone" en paleta de Terrain → setActiveTerrain('stone')
2. Usuario ya tiene celda (8, 5) seleccionada
3. Usuario presiona "Paint Cell"
4. handlePaintCell() → setCellTerrain(8, 5, 'stone')
5. Store calcula: idx = 5 * cols + 8
6. Clona array cells, reemplaza cells[idx].terrainType = 'stone'
7. Store actualiza cells
8. Siguiente frame de rAF:
   - Renderer dibuja celda (8, 5) en gris (color de stone)
9. Inspector actualiza: "Terrain: stone"
```

---

## 13. Guía de Extensión

### 13.1 Añadir un Nuevo Tipo de Terreno

1. **`simulation.d.ts`:** Agregar al union type:
   ```typescript
   export type TerrainType = 'grass' | 'stone' | 'water' | 'sand' | 'void' | 'lava';
   ```

2. **`Renderer.ts`:** Agregar colores a ambos mapas:
   ```typescript
   const TERRAIN_COLORS: Record<TerrainType, string> = {
     // ...existentes...
     lava: '#cc3300',
   };
   const TERRAIN_COLORS_ALT: Record<TerrainType, string> = {
     // ...existentes...
     lava: '#ff5500',
   };
   ```

3. **`Renderer.ts` (opcional):** Añadir detalle visual en `drawGrid()`:
   ```typescript
   if (cell.terrainType === 'lava' && cellSize >= 8) {
     ctx.fillStyle = '#ff9900';
     // dibujar partículas de lava...
   }
   ```

4. **`index.css`:** Agregar color para el swatch de la paleta:
   ```css
   --color-retro-lava: #cc3300;
   ```

5. **`Sidebar.tsx`:** Agregar a `TERRAIN_OPTIONS`:
   ```typescript
   { type: 'lava', label: 'Lava', color: 'bg-retro-lava' },
   ```

### 13.2 Implementar el Sistema de Entidades

1. **Crear entidad en el store:**
   ```typescript
   addEntity: (entity: Entity) => {
     const state = get();
     const idx = entity.y * state.cols + entity.x;
     const newCells = [...state.cells];
     newCells[idx] = { ...newCells[idx], entityId: entity.id };
     set({
       entities: [...state.entities, entity],
       cells: newCells,
     });
   },
   ```

2. **Renderizar sprites en `Renderer.ts`:**
   ```typescript
   if (cell.entityId) {
     const entity = entities.find(e => e.id === cell.entityId);
     if (entity) {
       // Cargar y dibujar sprite desde un atlas
       ctx.drawImage(spriteAtlas, spriteX, spriteY, 16, 16, px, py, cellSize, cellSize);
     }
   }
   ```

3. **Implementar `processTurn()`:**
   ```typescript
   processTurn: () => {
     const state = get();
     const newCells = [...state.cells];
     const newEntities = state.entities.map(entity => {
       // Lógica de movimiento, combate, etc.
       return { ...entity, hp: entity.hp - 1 }; // Ejemplo
     });
     set({ cells: newCells, entities: newEntities });
   },
   ```

### 13.3 Añadir Sprite Atlas de 16×16

1. Colocar imagen en `public/sprites/atlas.png`.
2. Pre-cargar en `Renderer.ts`:
   ```typescript
   private spriteAtlas: HTMLImageElement | null = null;

   loadSpriteAtlas(url: string): Promise<void> {
     return new Promise((resolve) => {
       const img = new Image();
       img.onload = () => { this.spriteAtlas = img; resolve(); };
       img.src = url;
     });
   }
   ```
3. Dibujar en `drawGrid()`:
   ```typescript
   ctx.drawImage(this.spriteAtlas, sx, sy, 16, 16, px, py, cellSize, cellSize);
   ```

### 13.4 Añadir Sistema de Guardado/Carga

```typescript
// En el store:
exportMap: () => {
  const { cols, rows, cells } = get();
  return JSON.stringify({ cols, rows, cells });
},

importMap: (json: string) => {
  const data = JSON.parse(json);
  set({
    cols: data.cols,
    rows: data.rows,
    cells: data.cells,
    // reset UI state...
  });
},
```

---

## 14. Decisiones Técnicas y Justificación

### 14.1 ¿Por Qué Canvas y No DOM/SVG?

| Enfoque | 100×100 Grid | Rendimiento |
|---------|-------------|-------------|
| 10,000 `<div>` | 10K nodos DOM | ❌ ~5 FPS, garbage collection masivo |
| 10,000 `<rect>` SVG | 10K nodos SVG | ❌ ~15 FPS, repaints costosos |
| 1 `<canvas>` | 1 nodo DOM | ✅ 60 FPS, solo operaciones de píxeles |

### 14.2 ¿Por Qué Zustand y No Context/Redux?

- **vs Context:** Context provoca re-renders en TODOS los consumidores cuando cualquier valor cambia. Zustand permite suscripciones selectivas.
- **vs Redux:** Redux requiere actions, reducers, dispatch, y mucho boilerplate. Zustand es una sola función `create()`.
- **vs Jotai/Recoil:** Zustand permite `getState()` fuera de React, esencial para el loop de rAF.

### 14.3 ¿Por Qué Array Plano y No Map 2D?

```typescript
// ❌ Map 2D — O(1) acceso pero peor cache locality
const cells: Cell[][] = Array.from({ length: rows }, () => 
  Array.from({ length: cols }, () => ({ ... }))
);

// ✅ Array plano — O(1) acceso con mejor cache locality
const cells: Cell[] = new Array(cols * rows);
// Acceso: cells[y * cols + x]
```

Los arrays planos son más amigables con la caché del procesador al iterar secuencialmente.

### 14.4 ¿Por Qué DPR = 1?

Para juegos retro, un DPR > 1 (como 2 en pantallas Retina) haría que los píxeles se vean suaves. Al forzar DPR = 1 + `image-rendering: pixelated`, cada "píxel lógico" del canvas se renderiza como un bloque cuadrado nítido, preservando la estética 8-bit.

### 14.5 ¿Por Qué `getState()` en el rAF Loop?

```typescript
// ❌ Esto causaría re-renders en React 60 veces/segundo
const cells = useSimulationStore((s) => s.cells);
// ... usar en rAF loop

// ✅ Esto lee el valor SIN suscribir al componente React
const state = useSimulationStore.getState();
```

El loop de renderizado opera FUERA del ciclo de vida de React. Usar `getState()` es la forma correcta de leer estado imperativamente.

---

## 15. Troubleshooting

### La fuente no se ve pixelada / se ve una fuente genérica

**Causa:** La fuente "Press Start 2P" no se cargó (sin Internet, bloqueador de contenido, o DNS lento).

**Solución:** 
1. Verifica tu conexión a Internet.
2. Abre DevTools → Network → busca "Press+Start+2P". ¿Devuelve 200?
3. Alternativa: descarga la fuente como archivo `.woff2` y colócala en `public/fonts/`.

### El canvas aparece en negro sin grilla

**Causa posible:** El contenedor tiene 0px de alto.

**Solución:** Asegúrate de que el `<div>` padre tiene `h-screen` y no está colapsado.

### Al cambiar a 100×100 la app se congela brevemente

**Causa:** `generateCells(100, 100)` crea 10,000 objetos y React re-renderiza el Sidebar.

**Solución aceptable:** Es un one-time cost (<50ms). Si se vuelve problema, usar `requestIdleCallback` para diferir la generación.

### El zoom se siente "invertido"

**Causa:** Algunos touchpads/mice invierten `deltaY`.

**Solución:** Invertir el signo en `handleWheel`:
```typescript
const delta = e.deltaY > 0 ? 0.15 : -0.15; // Invertido
```

### Los cambios en el código no se reflejan en el navegador

**Solución:**
1. Verifica que `npm run dev` está corriendo.
2. Haz hard-refresh: `Ctrl+Shift+R` (o `Cmd+Shift+R` en Mac).
3. Limpia caché de Vite: `rm -rf node_modules/.vite` y reinicia.

### Error: "Cannot find module '@/...'"

**Causa:** El alias `@/` no está configurado correctamente.

**Verificar:**
1. `tsconfig.json` tiene `"paths": { "@/*": ["src/*"] }`.
2. `vite.config.ts` tiene `alias: { "@": path.resolve(__dirname, "src") }`.

---

## Apéndice A: Controles de Interacción

| Acción del Usuario         | Efecto                                   |
|---------------------------|------------------------------------------|
| Click izquierdo en canvas | Seleccionar celda                        |
| Shift + Arrastrar         | Paneo (mover el viewport)                |
| Click derecho + Arrastrar | Paneo (alternativo)                      |
| Click central + Arrastrar | Paneo (alternativo)                      |
| Scroll rueda del mouse    | Zoom (centrado en el cursor)             |
| Input Cols/Rows + APPLY   | Cambiar dimensiones de la grilla         |
| Click en preset           | Cambiar a tamaño predefinido             |
| Click en paleta + Paint   | Cambiar terreno de celda seleccionada    |
| Botón Process Turn        | Ejecutar un ciclo de simulación (futuro) |
| Botón ◈ MAP               | Mostrar/ocultar panel de configuración   |

---

## Apéndice B: Scripts npm Disponibles

| Comando           | Script Real     | Descripción                              |
|-------------------|----------------|------------------------------------------|
| `npm run dev`     | `vite`          | Servidor de desarrollo con HMR           |
| `npm run build`   | `vite build`    | Compilación para producción              |
| `npm run preview` | `vite preview`  | Previsualización del build de producción |

---

> **Documento generado para:** 8-Bit Grid Simulator v0.1.0  
> **Última actualización:** 2025  
> **Autor técnico:** Senior Software Architect  
