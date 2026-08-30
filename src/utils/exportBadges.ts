import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AnyLicence } from '../types';

export async function exportBadgeAsImage(
  elementId: string,
  filename: string,
  scale: number = 3
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    link.click();
  } catch (error) {
    console.error('Error exporting badge image:', error);
  }
}

export async function exportBadgeAsPDF(
  frontElementId: string,
  backElementId: string,
  cadre: AnyLicence
): Promise<void> {
  const frontEl = document.getElementById(frontElementId);
  const backEl = document.getElementById(backElementId);

  if (!frontEl || !backEl) {
    console.error('Elements not found for PDF export.');
    return;
  }

  try {
    const [canvasFront, canvasBack] = await Promise.all([
      html2canvas(frontEl, { scale: 3, useCORS: true, allowTaint: true, logging: false }),
      html2canvas(backEl, { scale: 3, useCORS: true, allowTaint: true, logging: false }),
    ]);

    const imgFront = canvasFront.toDataURL('image/png');
    const imgBack = canvasBack.toDataURL('image/png');

    // Format Standard Carte CR80 (85.6mm x 53.98mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    });

    // Page 1: Recto
    pdf.addImage(imgFront, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');

    // Page 2: Verso
    pdf.addPage([85.6, 53.98], 'landscape');
    pdf.addImage(imgBack, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');

    const cleanName = `${cadre.prenom}_${cadre.nom}`.toLowerCase().replace(/\s+/g, '_');
    pdf.save(`badge_${cadre.category.toLowerCase()}_${cleanName}_${cadre.numeroLicence}.pdf`);
  } catch (error) {
    console.error('Error exporting badge PDF:', error);
  }
}
