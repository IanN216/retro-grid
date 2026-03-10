Documentación Técnica: Sistema de Mosaicos (Tiled System)
1. Filosofía del Sistema

El sistema evoluciona de un renderizado basado en colores planos a uno basado en texturas dinámicas. La clave de esta arquitectura es el desacoplamiento total entre los datos binarios (la grilla) y su representación visual (los sprites).
2. Estructura de Datos y Estado

El sistema se apoya en tres pilares dentro del store de Zustand (useSimulationStore):
A. La Grilla Binaria (cells)

    Tipo: Uint8Array (Array tipado de 1 byte por celda).

    Valor: Cada celda almacena un ID numérico (0-255).

    Rol: Actúa como un puntero lógico. El motor no sabe qué "es" el ID 0, solo sabe que debe buscar su apariencia en el mapa de terrenos.

B. Definición Dinámica de Terrenos (terrains)

    Tipo: TerrainDefinition[]

    Estructura: { id: number, name: string, spriteIndex: number }

    Mecánica: Permite añadir terrenos ilimitados (hasta el límite de 256 del Uint8Array) sin modificar el código fuente.

C. El Asset Maestro (spriteSheet)

    Tipo: HTMLImageElement | null

    Requisito: Una imagen PNG que contenga mosaicos de 16x16 píxeles.

3. Lógica de Mapeo (Matemáticas del Sistema)

Para que el sistema sea compatible con plantillas de cualquier tamaño (siempre que las baldosas sean de 16x16), se utilizan las siguientes fórmulas matemáticas:
Cálculo del Índice (Desde la UI)

Cuando el usuario selecciona un mosaico en el AssetPanel, se calcula su posición lineal:
Index=⌊MouseY/16⌋×(AnchoImagen/16)+⌊MouseX/16⌋
Extracción de Coordenadas (Para el Renderizado)

El Renderer.ts debe convertir ese Index en coordenadas X e Y dentro de la imagen original (sx, sy):

    Columnas en la plantilla: cols=AnchoImagen/16

    Coordenada de Origen X (sx): (Index(modcols))×16

    Coordenada de Origen Y (sy): ⌊Index/cols⌋×16

4. Pipeline de Renderizado (Renderer.ts)

El motor de renderizado sigue estas reglas estrictas para evitar el "bloqueo" de la UI y mantener el estilo retro:

    Nitidez Pixelada: Se debe forzar ctx.imageSmoothingEnabled = false.

    Acceso Imperativo: El Renderer lee la grilla usando useSimulationStore.getState().cells para evitar la sobrecarga de re-renders de React a 60 FPS.

    Dibujo con Recorte:
    TypeScript

    ctx.drawImage(
      spriteSheet, 
      sx, sy, 16, 16,        // Recorte original (Source)
      dx, dy, cellSize, cellSize // Dibujo en Canvas (Destination)
    );

5. Interfaz de Usuario (Sidebar y Paneles)
Panel de Terrenos (Dinámico)

    Visualización: Los botones de la paleta ya no usan colores CSS, sino background-image con la URL del spriteSheet.

    Posicionamiento CSS: Para mostrar el mosaico correcto en un botón, se usa background-position con los valores de sx y sy calculados en negativo.

    Acción "Add Terrain": Permite crear un nuevo objeto en el array terrains, asignándole el siguiente ID disponible y el spriteIndex seleccionado.

6. Reglas para Futuras Extensiones (Prevención de Roturas)

    Regla de Reactividad de Arrays: Nunca modifiques el Uint8Array directamente (cells[i] = x). Siempre debes crear una copia (new Uint8Array) y pasarla al set() de Zustand para disparar la actualización.

    Regla de Tipos: Las constantes de ID (TERRAIN_IDS) deben residir en archivos .ts, nunca en .d.ts, para que Vite pueda incluirlas en el bundle final.

    Regla de Capas: Si se desea agregar "Objetos" o "Decoraciones" sobre el suelo, se debe crear un segundo Uint8Array (objectLayer) para mantener el rendimiento, en lugar de convertir las celdas en objetos complejos de JavaScript.

    Consistencia de Tamaño: Todos los assets externos deben ser múltiplos de 16 píxeles para mantener la coherencia con el sistema de coordenadas actual.

    Estado del Sistema: Operacional (v0.2.0)

    Arquitectura: Data-Driven Tiling Engine.