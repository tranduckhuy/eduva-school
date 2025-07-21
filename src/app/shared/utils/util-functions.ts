import { effect, EffectRef, Signal } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { ContentType } from '../models/enum/lesson-material.enum';

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

/**
 * Subscribes to a signal and invokes a callback after a debounce delay when the signal's value changes.
 * Useful for search input, filtering, or any scenario where you want to reduce frequent signal emissions.
 *
 * @template T - The type of the signal's value.
 * @param signal - The signal to observe.
 * @param callback - The function to invoke after the debounce period with the latest value.
 * @param delay - The debounce delay in milliseconds (default is 300ms).
 * @returns A cleanup function that stops the effect and cancels the timer.
 */
export function debounceSignal<T>(
  signal: Signal<T>,
  callback: (value: T) => void,
  delay: number = 300
): () => void {
  let timer: any = null;
  let previousValue: T;

  const ref: EffectRef = effect(() => {
    const currentValue = signal();

    // ? Skip initial run
    if (currentValue === previousValue) return;
    previousValue = currentValue;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => callback(currentValue), delay);
  });

  return () => {
    clearTimeout(timer);
    ref.destroy();
  };
}

/**
 * Gets the ISO week number for a given date.
 *
 * @param date - The date to get the ISO week number for.
 * @returns The ISO week number (1-53).
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7; // ISO: Monday = 1, Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

/**
 * Gets the last N week numbers with their corresponding years.
 *
 * @param n - The number of weeks to get (default: 7).
 * @returns An array of objects containing year and week number.
 */
export function getLastNWeekNumbers(
  n: number = 7
): Array<{ year: number; week: number }> {
  const result: Array<{ year: number; week: number }> = [];
  const today = new Date();

  // Tìm thứ Hai của tuần hiện tại
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - diffToMonday);

  for (let i = 0; i < n; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() - i * 7);

    const weekNumber = getISOWeekNumber(monday);
    result.push({
      year: monday.getFullYear(),
      week: weekNumber,
    });
  }

  return result;
}
