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
      return;
    }

    // Guardar estilos originales
    const originalStyle = element.style.cssText;
    const originalClass = element.className;
    
    // Hacer el elemento visible temporalmente para html2canvas
    element.style.cssText = `
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      z-index: 9999 !important;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
      pointer-events: none !important;
    `;
    element.className = '';

    // Esperar un momento para que los estilos se apliquen
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capturar el elemento como canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#1e293b',
      scale: 2, // Mejor calidad
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Restaurar estilos originales
    element.style.cssText = originalStyle;
    element.className = originalClass;

    // Convertir a blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Error al convertir canvas a blob');
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
            text: 'Comprobante de pago',
          });
        } catch (error) {
          console.error('Error al compartir:', error);
          // Fallback: descargar la imagen
          downloadImage(canvas, filename);
        }
      } else {
        // Fallback: descargar la imagen para que el usuario la comparta manualmente
        downloadImage(canvas, filename);
        alert('La imagen se ha descargado. Por favor compártela manualmente por WhatsApp.');
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error al capturar imagen:', error);
    alert('Error al generar la imagen. Por favor intenta de nuevo.');
  }
}

/**
 * Descarga una imagen desde un canvas
 */
function downloadImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Captura un elemento y lo muestra en un modal para compartir
 */
export async function captureAndShowModal(
  elementId: string,
  onShare: (imageDataUrl: string) => void
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Elemento no encontrado:', elementId);
      return;
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#1e293b',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imageDataUrl = canvas.toDataURL('image/png');
    onShare(imageDataUrl);
  } catch (error) {
    console.error('Error al capturar imagen:', error);
    alert('Error al generar la imagen.');
  }
}
