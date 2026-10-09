import html2canvas from 'html2canvas';

/**
 * Captura un elemento HTML como imagen y lo comparte por WhatsApp
 * @param receiptData - Datos del comprobante
 * @param filename - Nombre del archivo
 */
export async function shareAsImageWhatsApp(receiptData: any, filename: string): Promise<void> {
  try {
    // Crear un elemento temporal para renderizar el comprobante
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '400px';
    tempDiv.style.backgroundColor = '#1e293b';
    tempDiv.style.padding = '24px';
    tempDiv.style.borderRadius = '12px';
    tempDiv.style.color = '#ffffff';
    tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    
    // Construir el contenido del comprobante
    let htmlContent = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #3b82f6; font-size: 24px; margin: 0 0 8px 0;">${receiptData.title}</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">${receiptData.subtitle}</p>
      </div>
      <div style="border-top: 2px solid #334155; padding-top: 16px; margin-bottom: 16px;">
    `;
    
    // Agregar campos
    receiptData.fields.forEach((field: any) => {
      const isHighlight = field.highlight ? 'color: #10b981; font-weight: bold;' : 'color: #ffffff;';
      htmlContent += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
          <span style="color: #94a3b8;">${field.label}</span>
          <span style="${isHighlight}">${field.value}</span>
        </div>
      `;
    });
    
    htmlContent += `</div>`;
    
    // Agregar foto si existe
    if (receiptData.photo) {
      htmlContent += `
        <div style="margin-top: 16px; border-top: 2px solid #334155; padding-top: 16px;">
          <img src="${receiptData.photo}" style="width: 100%; border-radius: 8px; max-height: 300px; object-fit: cover;" />
        </div>
      `;
    }
    
    // Agregar footer
    htmlContent += `
      <div style="border-top: 2px solid #334155; padding-top: 16px; margin-top: 16px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">${receiptData.footer}</p>
      </div>
    `;
    
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    
    // Esperar a que las imágenes se carguen
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capturar como imagen
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#1e293b',
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    // Remover elemento temporal
    document.body.removeChild(tempDiv);
    
    // Convertir a blob
    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) {
        console.error('Error al convertir canvas a blob');
        alert('Error al generar la imagen');
        return;
      }
      
      // Crear archivo
      const file = new File([blob], `${filename}.png`, { type: 'image/png' });
      
      // Verificar si Web Share API está disponible
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: receiptData.title,
            text: receiptData.subtitle,
          });
        } catch (error) {
          console.error('Error al compartir:', error);
          // Fallback: descargar la imagen
          downloadImage(canvas, filename);
        }
      } else {
        // Fallback: descargar la imagen
        downloadImage(canvas, filename);
        alert('La imagen se ha descargado. Por favor, compártela manualmente por WhatsApp.');
      }
    }, 'image/png');
    
  } catch (error) {
    console.error('Error al compartir imagen:', error);
    alert('Error al generar la imagen para compartir');
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
