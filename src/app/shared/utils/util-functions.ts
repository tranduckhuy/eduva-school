import { HttpResponse } from '@angular/common/http';
import { ContentType } from '../models/enum/content-type.enum';

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

/**
 * Extracts the file name from the 'Content-Disposition' header of a blob HTTP response.
 * If the file name cannot be determined, returns a fallback default name with a timestamp.
 *
 * @param response - The full HTTP response object with Blob as body.
 * @returns The decoded file name if present, otherwise a default name like 'downloaded_file_17297423623'.
 */
export function getFileName(response: HttpResponse<Blob>): string {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0]; // 'yyyy-MM-dd'
  const defaultFileName = `downloaded_file_${dateString}`;
  const contentDisposition = response.headers.get('Content-Disposition');

  if (!contentDisposition) return defaultFileName;

  // Try filename*= (RFC 5987)
  const fileNameStarMatch = contentDisposition.match(
    /filename\*\=UTF-8''(.+?)(;|$)/i
  );
  if (fileNameStarMatch && fileNameStarMatch[1]) {
    return decodeURIComponent(fileNameStarMatch[1]);
  }

  // Fallback: Try regular filename=
  const fileNameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
  );
  if (fileNameMatch && fileNameMatch[1]) {
    let fileName = fileNameMatch[1].trim();
    if (fileName.startsWith('"') || fileName.startsWith("'")) {
      fileName = fileName.slice(1, -1);
    }
    return decodeURIComponent(fileName);
  }

  return defaultFileName;
}

/**
 * Maps a MIME type string to its corresponding `ContentType` enum value.
 *
 * Supported mappings:
 * - video/* → ContentType.Video
 * - audio/* → ContentType.Audio
 * - application/pdf → ContentType.PDF
 * - application/vnd.openxmlformats-officedocument.wordprocessingml.document → ContentType.DOCX
 *
 * @param mime - The MIME type string (e.g. "video/mp4", "application/pdf").
 * @returns The corresponding `ContentType` enum value.
 *
 * @throws Error if the MIME type is not supported.
 */
export const getContentTypeFromMime = (mime: string): ContentType => {
  if (mime.startsWith('video/')) return ContentType.Video;
  if (mime.startsWith('audio/')) return ContentType.Audio;
  if (mime === 'application/pdf') return ContentType.PDF;

  return ContentType.DOCX;
};
