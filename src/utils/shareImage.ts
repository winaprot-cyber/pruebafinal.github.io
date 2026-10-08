import html2canvas from 'html2canvas';

/**
 * Convierte colores oklch a rgb para compatibilidad con html2canvas
 */
function fixOklchColors(element: HTMLElement) {
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const style = window.getComputedStyle(htmlEl);
    
    // Convertir colores problemáticos
    const properties = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
    
    properties.forEach(prop => {
      const value = style.getPropertyValue(prop === 'backgroundColor' ? 'background-color' : prop === 'borderColor' ? 'border-color' : prop);
      if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('color('))) {
        // Crear un canvas temporal para convertir el color
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = value;
            const computed = ctx.fillStyle; // El navegador convierte a rgb/hex
            htmlEl.style.setProperty(prop === 'backgroundColor' ? 'background-color' : prop, computed, 'important');
          }
        } catch (e) {
          // Fallback a colores seguros
          if (prop === 'backgroundColor' || prop === 'color') {
            htmlEl.style.setProperty(prop === 'backgroundColor' ? 'background-color' : prop, '#1e293b', 'important');
          }
        }
      }
    });

    // También procesar gradientes
    const bg = style.background;
    if (bg && (bg.includes('oklch') || bg.includes('oklab'))) {
      htmlEl.style.setProperty('background', '#1e293b', 'important');
    }
  });
}

/**
 * Captura un elemento HTML como imagen y lo comparte por WhatsApp
 */
export async function shareAsImageWhatsApp(elementId: string, filename: string = 'comprobante'): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Elemento no encontrado:', elementId);
      alert('No se encontró el elemento para compartir.');
      return;
    }

    // Crear un contenedor temporal
    const tempContainer = document.createElement('div');
    tempContainer.id = 'temp-share-container';
    tempContainer.style.cssText = `
      position: fixed !important;
      left: -9999px !important;
      top: 0 !important;
      z-index: 99999 !important;
      pointer-events: none !important;
      background: #1e293b;
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
      
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          makeVisible(child);
        }
      });
    };
    
    makeVisible(clonedElement);
    
    // Estilos para el contenedor principal
    clonedElement.style.setProperty('position', 'relative', 'important');
    clonedElement.style.setProperty('width', '400px', 'important');
    clonedElement.style.setProperty('left', '0', 'important');
    
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Mover el contenedor a una posición visible brevemente para renderizado
    await new Promise(resolve => setTimeout(resolve, 50));
    tempContainer.style.setProperty('left', '0', 'important');
    
    // Esperar a que se renderice
    await new Promise(resolve => setTimeout(resolve, 300));

    // Convertir colores oklch a rgb antes de capturar
    fixOklchColors(clonedElement);

    try {
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 400,
        windowWidth: 400,
        foreignObjectRendering: false,
        ignoreElements: (el) => {
          // Ignorar elementos con colores problemáticos
          const style = window.getComputedStyle(el);
          const bg = style.background || '';
          if (bg.includes('oklch') || bg.includes('oklab')) {
            return false; // No ignorar, ya los convertimos
          }
          return false;
        },
      });

      // Limpiar
      document.body.removeChild(tempContainer);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Error al generar la imagen.');
          return;
        }

        const file = new File([blob], `${filename}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Control Biométrico',
              text: 'Comprobante',
            });
          } catch (error) {
            downloadImage(canvas, filename);
          }
        } else {
          downloadImage(canvas, filename);
          alert('✅ La imagen se ha descargado. Compártela por WhatsApp.');
        }
      }, 'image/png', 1.0);
    } catch (canvasError) {
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      console.error('Error en html2canvas:', canvasError);
      
      // Fallback: intentar con foreignObjectRendering desactivado
      try {
        const fallbackCanvas = await html2canvas(clonedElement, {
          backgroundColor: '#1e293b',
          scale: 1,
          logging: false,
          useCORS: false,
          allowTaint: true,
          foreignObjectRendering: false,
        });
        
        document.body.removeChild(tempContainer);
        downloadImage(fallbackCanvas, filename);
        alert('✅ La imagen se ha descargado (modo alternativo). Compártela por WhatsApp.');
      } catch (fallbackError) {
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
        console.error('Error en fallback:', fallbackError);
        alert('Error al capturar la imagen. Intenta de nuevo.');
      }
    }
  } catch (error) {
    console.error('Error general:', error);
    alert('Error al generar la imagen. Intenta de nuevo.');
  }
}

function downloadImage(canvas: HTMLCanvasElement, filename: string): void {
  try {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al descargar:', error);
  }
}
