/**
 * Genera una imagen de comprobante usando Canvas nativo (sin html2canvas)
 * Esto evita problemas con colores oklch y otros formatos modernos
 */

interface ReceiptData {
  title: string;
  subtitle: string;
  color: string; // Color principal en hex
  fields: { label: string; value: string; highlight?: boolean }[];
  photo?: string; // Data URL de imagen
  footer?: string;
}

function drawReceipt(canvas: HTMLCanvasElement, data: ReceiptData) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 800;
  const padding = 40;
  let y = padding;

  // Calcular altura total
  const lineHeight = 48;
  const titleHeight = 80;
  const photoHeight = data.photo ? 320 : 0;
  const footerHeight = 60;
  const totalHeight = titleHeight + (data.fields.length * lineHeight) + photoHeight + footerHeight + padding * 2;

  canvas.width = width;
  canvas.height = totalHeight;

  // Fondo
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, totalHeight);

  // Borde decorativo superior
  ctx.fillStyle = data.color;
  ctx.fillRect(0, 0, width, 6);

  // Título
  y += 40;
  ctx.fillStyle = data.color;
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Control Biométrico', width / 2, y);

  y += 35;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px Arial, sans-serif';
  ctx.fillText(data.subtitle, width / 2, y);

  // Línea separadora
  y += 25;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(width - padding, y);
  ctx.stroke();

  // Campos
  y += 30;
  data.fields.forEach(field => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(field.label, padding, y);

    ctx.textAlign = 'right';
    if (field.highlight) {
      ctx.fillStyle = data.color;
      ctx.font = 'bold 22px Arial, sans-serif';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial, sans-serif';
    }
    ctx.fillText(field.value, width - padding, y);

    y += lineHeight;
  });

  // Foto si existe
  if (data.photo) {
    y += 10;
    const img = new Image();
    img.src = data.photo;
    // Dibujar imagen de forma síncrona si ya está cargada
    if (img.complete) {
      const imgWidth = width - padding * 2;
      const imgHeight = 280;
      ctx.drawImage(img, padding, y, imgWidth, imgHeight);
    }
  }

  // Footer
  const footerY = totalHeight - 30;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(padding, footerY - 20);
  ctx.lineTo(width - padding, footerY - 20);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText(data.footer || 'by Hugo León', width / 2, footerY);
}

/**
 * Comparte un comprobante como imagen por WhatsApp
 */
export async function shareAsImageWhatsApp(
  receiptData: ReceiptData,
  filename: string = 'comprobante'
): Promise<void> {
  try {
    const canvas = document.createElement('canvas');
    drawReceipt(canvas, receiptData);

    // Si hay foto, esperar a que cargue y redraw
    if (receiptData.photo) {
      const photoUrl = receiptData.photo;
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          drawReceipt(canvas, receiptData);
          resolve();
        };
        img.onerror = () => {
          // Continuar sin foto
          const dataWithoutPhoto = { ...receiptData, photo: undefined };
          drawReceipt(canvas, dataWithoutPhoto);
          resolve();
        };
        img.src = photoUrl;
      });
    }

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
            text: receiptData.subtitle,
          });
        } catch (error) {
          downloadCanvas(canvas, filename);
        }
      } else {
        downloadCanvas(canvas, filename);
        alert('✅ Imagen descargada. Compártela por WhatsApp.');
      }
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar la imagen.');
  }
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
