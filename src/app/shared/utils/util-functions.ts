/**
 * Triggers the download of a file from a base64-encoded string.
 *
 * @param fileName - The desired name of the downloaded file, including extension (e.g., "report.xlsx").
 * @param base64Content - The base64-encoded content of the file to be downloaded.
 *
 * This function:
 * 1. Decodes the base64 content into binary data.
 * 2. Converts the binary data into a Blob object.
 * 3. Creates a temporary download link and triggers a click to start the download.
 * 4. Cleans up the created object URL.
 */
export const triggerDownload = (fileName: string, base64Content: string) => {
  const byteCharacters = atob(base64Content);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray]);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Triggers the download of a file from a Blob object.
 *
 * @param fileName - The desired name of the downloaded file, including extension (e.g., "export.xlsx").
 * @param blob - The Blob object containing the file data to download.
 *
 * This function:
 * 1. Creates a temporary object URL from the Blob.
 * 2. Creates and triggers a temporary anchor element to download the file.
 * 3. Cleans up the object URL after the download is triggered.
 */
export const triggerBlobDownload = (fileName: string, blob: Blob): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
