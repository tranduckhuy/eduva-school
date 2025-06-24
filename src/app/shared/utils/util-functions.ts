import { HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

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

  const fileNameStarRegex = /filename\*\s*=\s*UTF-8''([^;]*)/i;
  const fileNameRegex = /filename\s*=\s*(?:(["'])(.*?)\1|([^;\n]*))/i;

  // ? Try filename*= (RFC 5987)
  const fileNameStarMatch = fileNameStarRegex.exec(contentDisposition);
  if (fileNameStarMatch?.[1]) return decodeURIComponent(fileNameStarMatch[1]);

  // ? Fallback: Try regular filename=
  const fileNameMatch = fileNameRegex.exec(contentDisposition);
  if (fileNameMatch?.[1]) {
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

/**
 * Checks whether the value and confirm value fields in a FormGroup do not match.
 *
 * @param form - The FormGroup containing the fields that need to check matching.
 * @param valueField - The name of the value field (default: 'newPassword').
 * @param confirmValueField - The name of the confirm value field (default: 'confirmPassword').
 * @returns `true` if the values do not match, otherwise `false`.
 */
export function isFormFieldMismatch(
  form: FormGroup,
  valueField: string = 'newPassword',
  confirmValueField: string = 'confirmPassword'
): boolean {
  const value: string | null | undefined = form.get(valueField)?.value;
  const confirmValue: string | null | undefined =
    form.get(confirmValueField)?.value;
  return value !== confirmValue;
}
