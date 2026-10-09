export async function shareAsImageWhatsApp(receiptData: any, filename: string): Promise<void> {
  const text = `${receiptData.title}\n${receiptData.subtitle}\n\n${receiptData.fields.map((f: any) => `${f.label} ${f.value}`).join('\n')}\n\n${receiptData.footer}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
}
