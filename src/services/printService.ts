/**
 * Print service that prints either the generated PDF blob or the paged web preview
 */

let activePrintIframe: HTMLIFrameElement | null = null;

export function printPdfBlob(blobUrl: string): Promise<void> {
  return new Promise((resolve) => {
    // Clean up previous iframe if exists
    if (activePrintIframe) {
      document.body.removeChild(activePrintIframe);
      activePrintIframe = null;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.src = blobUrl;

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Direct iframe print failed, opening in new tab for print', e);
          window.open(blobUrl, '_blank')?.print();
        }
        resolve();
      }, 300);
    };

    document.body.appendChild(iframe);
    activePrintIframe = iframe;
  });
}

export function printHtmlDirect(): void {
  window.print();
}
