
---

# 🎨 Sistema de Mapeo de Sprites 16x16

Esta mecánica permite sustituir los colores planos de la simulación por texturas extraídas de una plantilla PNG externa. El sistema es dinámico: permite cargar cualquier imagen, calcular sus dimensiones y mapear índices numéricos a tipos de terreno específicos.

## 1. Arquitectura del Sistema

La mecánica se apoya en la estructura de **Typed Arrays** definida previamente, donde cada celda de la grilla es un valor de 1 byte en un `Uint8Array`.

### Componentes Clave

| Componente | Responsabilidad |
| --- | --- |
| **`SimulationState`** | Almacena el objeto `HTMLImageElement` de la plantilla y un mapa (`terrainSprites`) que asocia cada `TerrainType` con un índice de baldosa. |
| **`AssetPanel`** | Interfaz para cargar el archivo PNG y seleccionar visualmente qué cuadro de 16x16 corresponde a cada terreno. |
| **`Renderer`** | Motor que calcula las coordenadas de recorte ($sx, sy$) y dibuja la textura en el Canvas. |

---

## 2. Lógica de Mapeo y Selección

Para que el sistema funcione con plantillas de cualquier tamaño, el software no asume un número fijo de columnas en la imagen.

### Cálculo del Índice (UI)

Cuando un usuario hace clic en la plantilla cargada para asignar una baldosa, se calcula un **índice secuencial** basado en una cuadrícula de 16x16 píxeles.

$$Index = \lfloor \frac{MouseY}{16} \rfloor \times \left( \frac{\text{Ancho de Imagen}}{16} \right) + \lfloor \frac{MouseX}{16} \rfloor$$

Este índice se guarda en el store de Zustand bajo la propiedad `terrainSprites[terrainType]`.

---

## 3. Motor de Renderizado (Drawing Logic)

El archivo `Renderer.ts` ha sido modificado para priorizar el dibujo de imágenes sobre el de colores.

### Reglas de Oro del Renderizado

1. **Nitidez (Pixel Art):** Se debe mantener `imageSmoothingEnabled = false` para evitar el suavizado de los píxeles al escalar las baldosas.
2. **Culling:** El sistema solo renderiza las celdas visibles en el viewport para mantener los 60 FPS.

### Fórmulas de Extracción

Para dibujar una celda, el motor necesita saber de dónde recortar la imagen original. Primero determina cuántas columnas de baldosas tiene la plantilla cargada:

$$cols_{sheet} = \frac{\text{plantilla.width}}{16}$$

Luego, calcula las coordenadas de origen ($sx$, $sy$) dentro de la plantilla para el índice asignado a ese terreno:

* $sx = (index \pmod{cols_{sheet}}) \times 16$
* $sy = \lfloor \frac{index}{cols_{sheet}} \rfloor \times 16$

Finalmente, ejecuta el comando de dibujo:

```typescript
ctx.drawImage(spriteSheet, sx, sy, 16, 16, xCanvas, yCanvas, cellSize, cellSize);

```

---

## 4. Guía de Extensión: Cómo agregar nuevas texturas

Si un programador desea agregar una nueva capa (por ejemplo, "Decoraciones" o "Muebles"), debe seguir estos pasos:

1. **Definir el Contrato:** En `src/types/simulation.ts`, añadir el nuevo tipo al union type (ej. `type AccessoryType = 'chair' | 'table'`).
2. **Actualizar el Store:** Crear un nuevo `Uint8Array` en el store para representar esta capa, permitiendo que cada celda guarde el ID del accesorio.
3. **Mapear el Sprite:** En el `AssetPanel`, permitir que el usuario seleccione un índice de la plantilla para ese nuevo tipo.
4. **Añadir al Loop:** En `Renderer.ts`, añadir una segunda pasada de dibujo (`drawLayer`) que utilice las mismas fórmulas de $sx$ y $sy$ para superponer los nuevos sprites sobre el terreno base.

---

## 5. Consideraciones de Rendimiento

* **Memoria:** El uso de `Uint8Array` asegura que incluso con múltiples capas de sprites, el consumo de RAM siga siendo mínimo (1 byte por celda por capa).
* **Reactividad:** Al actualizar el mapeo de un sprite, es obligatorio clonar el objeto de mapeo en el store para disparar la actualización visual del motor de renderizado.

> **Nota para IAs:** Al modificar el sistema de renderizado, asegúrese de leer siempre el estado de los sprites mediante `useSimulationStore.getState()` para evitar re-renders innecesarios en los componentes de React durante el bucle de animación.

---
