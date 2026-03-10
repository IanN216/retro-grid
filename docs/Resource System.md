# Resource System

## Añadir Nuevos Terrenos

El sistema de recursos ha sido actualizado para cargar dinámicamente cada tipo de terreno desde imágenes individuales, simplificando enormemente el proceso de expansión del mapa.

Para añadir nuevos terrenos, **solo hace falta soltar un archivo `.webp` de 16x16 píxeles en la carpeta `src/resources/tiles/`.**

### ¿Cómo funciona?

1. **Auto-descubrimiento:** El sistema utiliza la función `import.meta.glob` de Vite para buscar y registrar automáticamente todas las imágenes `.webp` ubicadas en `src/resources/tiles/` en el momento de la construcción (build).
2. **Asignación de IDs:** A cada imagen encontrada se le asigna automáticamente un ID numérico secuencial (empezando desde 0). Este ID es fundamental, ya que es el valor que se guarda en la grilla (`Uint8Array`) para representar dicho terreno.
   * *Nota:* El orden en el que se procesan y se asignan los IDs depende del nombre del archivo (específicamente del número que contenga en su formato, ej: `terrain_01.webp`).
3. **Renderizado:** La capa de presentación (Sidebar) extrae dinámicamente la URL de la imagen y la muestra en la paleta de terrenos. El motor de renderizado (`Renderer.ts`) usa el ID almacenado en la grilla para localizar la imagen cargada y la dibuja de manera optimizada usando el método `drawImage` del Canvas API.

### Reglas para los assets:
- **Formato:** Deben ser imágenes en formato **WebP** (`.webp`).
- **Resolución:** El tamaño debe ser exactamente **16x16 píxeles** para mantener la estética y el funcionamiento de la grilla sin escalados extraños.
- **Nomenclatura:** Se recomienda usar un prefijo de nombre seguido de un número para mantener el control sobre los IDs asignados. Ejemplo: `grass_00.webp`, `stone_01.webp`.

No es necesario tocar el código fuente para añadir o modificar la apariencia de los terrenos base. ¡Simplemente actualiza los archivos en la carpeta de recursos!
