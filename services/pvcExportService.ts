import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

export interface PvcExportOptions {
  includeBleed?: boolean; // 2mm bleed on each side (89.6 x 58 mm vs 85.6 x 54 mm)
  dpi?: number;           // Standard is 300
  includeVerso?: boolean; // For cards that have a back side
  onProgress?: (current: number, total: number, label: string) => void;
}

export class PvcExportService {
  /**
   * CR80 ISO Dimensions in millimeters
   */
  static readonly CR80_WIDTH_MM = 85.6;
  static readonly CR80_HEIGHT_MM = 54.0;
  static readonly BLEED_MM = 2.0;

  /**
   * Convert an HTML element into a high-DPI canvas
   */
  static async captureElementToCanvas(element: HTMLElement, options?: { scale?: number }): Promise<HTMLCanvasElement> {
    const scale = options?.scale || 3.125; // 300 DPI / 96 DPI ≈ 3.125

    // Ensure all web fonts are fully loaded before rendering canvas
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading wait warning:', e);
      }
    }

    return await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        // Prevent vertical clipping on all cloned text elements
        const textElements = clonedDoc.querySelectorAll<HTMLElement>('p, h1, h2, h3, span, strong');
        textElements.forEach((el) => {
          el.style.overflowY = 'visible';
          el.style.overflow = 'visible';
          // Ensure line-height provides sufficient vertical room for glyphs
          const currentLineHeight = window.getComputedStyle(el).lineHeight;
          if (currentLineHeight === 'normal' || parseFloat(currentLineHeight) <= parseFloat(window.getComputedStyle(el).fontSize) * 1.1) {
            el.style.lineHeight = '1.35';
          }
        });
      },
    });
  }

  /**
   * Generate a multi-page CR80 PDF for commercial PVC card printing
   */
  static async generatePvcPdf(
    cardElements: Array<{ id: string; name: string; element: HTMLElement; side: 'recto' | 'verso' }>,
    options: PvcExportOptions = {}
  ): Promise<Blob> {
    const { includeBleed = false, onProgress } = options;
    const widthMm = includeBleed ? PvcExportService.CR80_WIDTH_MM + PvcExportService.BLEED_MM * 2 : PvcExportService.CR80_WIDTH_MM;
    const heightMm = includeBleed ? PvcExportService.CR80_HEIGHT_MM + PvcExportService.BLEED_MM * 2 : PvcExportService.CR80_HEIGHT_MM;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [widthMm, heightMm],
      compress: true,
    });

    const total = cardElements.length;

    for (let i = 0; i < total; i++) {
      const item = cardElements[i];
      if (onProgress) {
        onProgress(i + 1, total, `Rendu ${item.side === 'recto' ? 'Recto' : 'Verso'} : ${item.name} (${i + 1}/${total})`);
      }

      const canvas = await PvcExportService.captureElementToCanvas(item.element);
      const imgData = canvas.toDataURL('image/png', 1.0);

      if (i > 0) {
        pdf.addPage([widthMm, heightMm], 'landscape');
      }

      pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    }

    return pdf.output('blob');
  }

  /**
   * Generate a ZIP package with 300 DPI PNG images + CSV manifest for badge printers
   */
  static async generatePvcZip(
    cardElements: Array<{ id: string; name: string; element: HTMLElement; side: 'recto' | 'verso' }>,
    manifestData: Array<Record<string, any>>,
    options: PvcExportOptions = {}
  ): Promise<Blob> {
    const { onProgress } = options;
    const zip = new JSZip();
    const rectoFolder = zip.folder('01_RECTO');
    const versoFolder = zip.folder('02_VERSO');

    const total = cardElements.length;

    for (let i = 0; i < total; i++) {
      const item = cardElements[i];
      if (onProgress) {
        onProgress(i + 1, total, `Export image ${item.side === 'recto' ? 'Recto' : 'Verso'} : ${item.name} (${i + 1}/${total})`);
      }

      const canvas = await PvcExportService.captureElementToCanvas(item.element);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      const fileName = `${String(i + 1).padStart(3, '0')}_${item.id}_${item.side}.png`;

      if (item.side === 'recto') {
        rectoFolder?.file(fileName, base64Data, { base64: true });
      } else {
        versoFolder?.file(fileName, base64Data, { base64: true });
      }
    }

    // Add technical instructions for the printer
    const readmeContent = `SPÉCIFICATIONS TECHNIQUES D'IMPRESSION - CARTES PVC CR80
======================================================
Format standard : ISO/IEC 7810 ID-1 (CR80)
Dimensions finies : 85.60 mm x 53.98 mm (coins arrondis r=3.18mm)
Résolution des fichiers fournis : 300 DPI (Haute Définition)
Nombre total de faces exportées : ${total}

Contenu de l'archive :
- /01_RECTO : Visuels Recto des cartes à imprimer
- /02_VERSO : Visuels Verso des cartes
- manifest_imprimeur.csv : Liste nominative complète et correspondance des identifiants
`;
    zip.file('LISEZMOI_IMPRIMEUR.txt', readmeContent);

    // Add CSV manifest
    if (manifestData && manifestData.length > 0) {
      const headers = Object.keys(manifestData[0]);
      const csvRows = [
        headers.join(';'),
        ...manifestData.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(';'))
      ];
      zip.file('manifest_imprimeur.csv', '\uFEFF' + csvRows.join('\r\n')); // UTF-8 BOM for Excel compatibility
    }

    return await zip.generateAsync({ type: 'blob' }, (metadata) => {
      if (onProgress) {
        onProgress(total, total, `Compression de l'archive ZIP (${Math.round(metadata.percent)}%)...`);
      }
    });
  }

  /**
   * Helper to trigger browser download of a blob
   */
  static downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
