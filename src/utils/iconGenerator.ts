export function generateIcons() {
  const icon192 = localStorage.getItem('icon-192-generated');
  const icon512 = localStorage.getItem('icon-512-generated');
  
  if (icon192 && icon512) {
    console.log('[Icon Generator] Iconos ya generados');
    return;
  }
  
  console.log('[Icon Generator] Generando iconos...');
  generateIcon(192, 'icon-192.png');
  generateIcon(512, 'icon-512.png');
  
  localStorage.setItem('icon-192-generated', 'true');
  localStorage.setItem('icon-512-generated', 'true');
}

function generateIcon(size: number, filename: string) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('[Icon Generator] No se pudo obtener el contexto del canvas');
    return;
  }
  
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = gradient;
  
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.03;
  ctx.lineCap = 'round';
  
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.3;
  
  for (let i = 1; i <= 5; i++) {
    const radius = (maxRadius / 5) * i;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
  }
  
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.15}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CB', centerX, centerY + size * 0.25);
  
  canvas.toBlob((blob) => {
    if (blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          localStorage.setItem(filename, reader.result);
          console.log('[Icon Generator] Icono guardado:', filename);
        }
      };
      reader.readAsDataURL(blob);
    }
  }, 'image/png');
}

export function getIconUrl(size: number): string {
  const filename = `icon-${size}.png`;
  const iconData = localStorage.getItem(filename);
  
  if (iconData) {
    return iconData;
  }
  
  return '/icon.svg';
}
