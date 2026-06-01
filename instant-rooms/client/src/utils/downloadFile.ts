/**
 * Cross-origin safe file download.
 * Fetches the resource as a Blob and triggers browser download via a temporary URL.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke after a short delay to let the browser initiate the download
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
}
