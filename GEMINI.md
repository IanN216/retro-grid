GEMINI.MD — Contexto para Agentes e IA

    Proyecto: 8-Bit Grid Simulator

    Propósito: Guía de arquitectura y lógica para asistencia en codificación, refactorización y extensión mediante IA.

1. Stack & Identidad Técnica

    Framework: React 19 + Vite 7 (Configurado para Single File Build).

    Lenguaje: TypeScript 5.9 (Strict Mode).

    Estado: Zustand 5 (Gestión de estado atómica fuera del árbol de React).

    Renderizado: HTML5 Canvas 2D (Modo imperativo para alto rendimiento).

    Estética: Pixel-art (DPR = 1, image-rendering: pixelated).

2. Arquitectura de 3 Capas

Para interactuar con el código, respeta esta separación:

    Capa de Presentación (React): Maneja el Sidebar, HUD y overlays. No debe procesar lógica de celdas pesada.

    Capa de Estado (Zustand): Única fuente de verdad. El estado se lee de forma reactiva en UI e imperativa en el motor.

    Capa de Renderizado (Engine): Clase pura Renderer.ts. Se ejecuta en un loop de requestAnimationFrame a 60 FPS.

3. Estructuras de Datos Críticas
Grilla (Array Plano)

    Contrato: cells: Cell[]. No es una matriz 2D.

    Fórmula de acceso: index = y * cols + x.

    Razón: Optimización de caché y simplicidad en la serialización.

Tipos de Terreno

    Unión: grass | stone | water | sand | void.

    Visual: Cada terreno tiene una variante ALT para generar un patrón de tablero (checkerboard) sin assets externos.

4. Archivos Clave para Contexto

    src/types/simulation.d.ts: Definición de interfaces Cell, Entity y State.

    src/store/useSimulationStore.ts: Lógica de mutación del mapa y acciones globales.

    src/engine/Renderer.ts: Lógica de dibujo, Viewport Culling y detección de clics (Hit Detection).

    src/components/simulation/GridCanvas.tsx: Puente entre los eventos del DOM (mouse/wheel) y el Store.

5. Patrones de Implementación Obligatorios

    Lectura de Estado: En el loop de animación, usa siempre useSimulationStore.getState() para evitar re-renders masivos en React.

    Inmutabilidad: Al modificar celdas, clona el array completo ([...cells]) para asegurar que Zustand detecte el cambio.

    Escalabilidad: Cualquier lógica de dibujo debe pasar por el filtro de Viewport Culling (solo dibujar lo que el pan y zoom permiten ver).

6. Flujos Comunes

    Selección: Mouse Event → Renderer.getCellAtPosition() → Store.setSelectedCell().

    Redimensionamiento: Store.setGridSize() → generateCells() → Center Grid Effect.