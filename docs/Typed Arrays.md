## 1. El Corazón del Sistema: La Grilla Binaria

La mayor actualización es el paso de `Cell[]` a `Uint8Array`.

### ¿Por qué `Uint8Array`?

En lugar de tener 10,000 objetos `{ x, y, terrainType }` consumiendo memoria RAM y generando trabajo para el recolector de basura (Garbage Collector), ahora tenemos un solo bloque de memoria contigua donde cada celda ocupa exactamente **1 byte**.

### El Mapa de Terrenos (`TERRAIN_IDS`)

Para que el sistema sepa qué significa cada número en el array, utilizamos un mapeo estricto en `src/types/simulation.ts`:

* **0**: `grass`
* **1**: `stone`
* **2**: `water`
* **3**: `sand`
* **4**: `void`

---

## 2. Lógica de Acceso Espacial (Matemáticas)

Al ser un array plano (unidimensional), no podemos acceder como `grid[x][y]`. Debemos calcular la posición lineal.

### De Coordenadas a Índice

Para encontrar una celda en el array basándonos en su posición en la pantalla:


$$index = y \times \text{cols} + x$$

### De Índice a Coordenadas

Si tienes el índice y necesitas saber en qué fila o columna está:

* $x = index \pmod{\text{cols}}$
* $y = \lfloor \frac{index}{\text{cols}} \rfloor$

---

## 3. Archivos Críticos y sus Variables

Si cambias el nombre o la estructura de estos archivos, el sistema fallará.

| Archivo | Rol Crítico | Variables Clave |
| --- | --- | --- |
| **`src/types/simulation.ts`** | **Contratos de datos.** Debe ser `.ts` (no `.d.ts`) porque exporta la constante `TERRAIN_IDS`. | `TerrainType`, `TERRAIN_IDS`, `SimulationState`. |
| **`src/store/useSimulationStore.ts`** | **Cerebro del sistema.** Gestiona la reactividad de la grilla. | `cells` (Uint8Array), `setGridSize`, `setCellTerrain`. |
| **`src/engine/Renderer.ts`** | **Motor gráfico.** Dibuja los datos binarios en el Canvas. | `drawGrid`, `TERRAIN_COLORS`, `cellSize`. |
| **`src/components/simulation/GridCanvas.tsx`** | **Interacción.** Convierte clics de mouse en coordenadas de grilla. | `handleMouseDown`, `handleWheel` (Zoom Focal). |

---

## 4. Reglas de Oro para No Romper el Sistema

### ⚠️ El error de `simulation.d.ts` vs `simulation.ts`

* **Regla:** Nunca vuelvas a usar `.d.ts` si el archivo contiene constantes como `TERRAIN_IDS`.
* **Por qué:** Vite y TypeScript necesitan que el archivo sea un módulo ejecutable (`.ts`) para poder importar los valores numéricos de los terrenos en el Sidebar o el Renderer.

### ⚡ Reactividad con Typed Arrays

Zustand no detecta cambios "dentro" de un `Uint8Array` si solo cambias un valor.

* **Forma Incorrecta:** `state.cells[idx] = 1;` (No dispara el re-renderizado).
* **Forma Correcta:** ```typescript
const newCells = new Uint8Array(state.cells);
newCells[idx] = newTerrainId;
set({ cells: newCells }); // Esto notifica a React y al motor.
```


```



### 🖼️ El Loop de Renderizado (Performance)

El archivo `Renderer.ts` **no debe usar hooks de React**.

* Para leer la grilla dentro del loop de 60 FPS, usa siempre `useSimulationStore.getState().cells`. Esto evita que React se sature con actualizaciones innecesarias.

---

