import html2canvas from 'html2canvas';

/**
 * Captura un elemento HTML como imagen y lo comparte por WhatsApp
 * @param elementId - ID del elemento HTML a capturar
 * @param filename - Nombre del archivo (opcional)
 */
export async function shareAsImageWhatsApp(elementId: string, filename: string = 'comprobante'): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Elemento no encontrado:', elementId);
      alert('No se encontró el elemento para compartir.');
      return;
    }

    // Crear un contenedor temporal visible
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      z-index: 99999 !important;
      pointer-events: none !important;
      background: #1e293b;
      padding: 0;
      margin: 0;
    `;
    
    // Clonar el elemento
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Función para hacer visible un elemento y todos sus hijos
    const makeVisible = (el: HTMLElement) => {
      el.classList.remove('hidden');
      el.removeAttribute('hidden');
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      
      // Procesar hijos recursivamente
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          makeVisible(child);
        }
      });
    };
    
    // Hacer visible el clon y todos sus hijos
    makeVisible(clonedElement);
    
    // Estilos adicionales para el contenedor principal
    clonedElement.style.setProperty('position', 'relative', 'important');
    clonedElement.style.setProperty('width', '400px', 'important');
    clonedElement.style.setProperty('z-index', '99999', 'important');
    clonedElement.style.setProperty('pointer-events', 'none', 'important');
    
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Esperar un momento para que se renderice
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Capturar el elemento como canvas
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: true, // Habilitar logging para debug
        useCORS: true,
        allowTaint: true,
        width: 400,
        windowWidth: 400,
        onclone: (clonedDoc) => {
          // Asegurar que todos los elementos estén visibles en el documento clonado
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.classList.remove('hidden');
            htmlEl.style.setProperty('display', 'block', 'important');
            htmlEl.style.setProperty('visibility', 'visible', 'important');
          });
        },
      });

      // Limpiar el contenedor temporal
      document.body.removeChild(tempContainer);

      // Convertir a blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Error al convertir canvas a blob');
          alert('Error al generar la imagen.');
          return;
        }

        // Crear archivo
        const file = new File([blob], `${filename}.png`, { type: 'image/png' });

        // Verificar si Web Share API está disponible y soporta archivos
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Control Biométrico',
              text: 'Comprobante',
            });
          } catch (error) {
            console.error('Error al compartir:', error);
            // Fallback: descargar la imagen
            downloadImage(canvas, filename);
          }
        } else {
          // Fallback: descargar la imagen para que el usuario la comparta manualmente
          downloadImage(canvas, filename);
          alert('✅ La imagen se ha descargado. Por favor compártela manualmente por WhatsApp.');
        }
      }, 'image/png', 1.0);
    } catch (canvasError) {
      // Limpiar el contenedor temporal en caso de error
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      console.error('Error en html2canvas:', canvasError);
      const errorMessage = canvasError instanceof Error ? canvasError.message : 'Error desconocido';
      alert(`Error al capturar la imagen: ${errorMessage}\n\nPor favor intenta de nuevo.`);
    }
  } catch (error) {
    console.error('Error general al compartir:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    alert(`Error al generar la imagen: ${errorMessage}\n\nPor favor intenta de nuevo.`);
  }
}

/**
 * Descarga una imagen desde un canvas
 */
function downloadImage(canvas: HTMLCanvasElement, filename: string): void {
  try {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al descargar imagen:', error);
    alert('Error al descargar la imagen.');
  }
}
