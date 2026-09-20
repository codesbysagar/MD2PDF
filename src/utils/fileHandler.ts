/**
 * Handles reading text files securely and downloading generated PDF blobs
 */

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Sanity check file size (e.g. 10MB limit for browser memory safety)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File is too large (> 10MB). Please select a smaller document.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string || '');
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };
    reader.readAsText(file);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup after slight delay
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}
