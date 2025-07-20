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
 * Converts all <figure class="image"><img /></figure> blocks in the given HTML string
 * into <p><p-image /></p> format, preserving relevant attributes like src, alt, and width.
 * This is typically used to convert image tags into a custom component format for rendering or editing.
 *
 * @param html - The raw HTML string containing <figure class="image"> elements.
 * @returns The transformed HTML string with <p-image> wrapped inside <p> tags.
 */
export function convertImgToPImage(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('figure.image').forEach(figure => {
    const img = figure.querySelector('img');
    if (!img) return;

    const figureWidth = (figure as HTMLElement).style.width ?? '';

    const pImage = document.createElement('p-image');
    pImage.setAttribute('src', img.getAttribute('src') ?? '');
    pImage.setAttribute('alt', img.getAttribute('alt') ?? '');
    pImage.setAttribute('width', figureWidth);
    pImage.setAttribute('preview', 'true');

    // ? Wrap p-image tag with p tag for DOM Sanitization
    const wrapperP = document.createElement('p');
    wrapperP.appendChild(pImage);

    figure.replaceWith(wrapperP);
  });

  return doc.body.innerHTML;
}

/**
 * Converts all <p><p-image /></p> structures back into <figure class="image"><img /></figure> format.
 * This is typically used before saving or rendering HTML in systems that do not support custom tags.
 *
 * @param html - The HTML string containing <p-image> components wrapped in <p> tags.
 * @returns The converted HTML string with standard <figure><img></figure> elements.
 */
export function convertPImageToFigureImg(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc.querySelectorAll('p > p-image').forEach(pImage => {
    const p = pImage.parentElement;
    if (!p || !(pImage instanceof HTMLElement)) return;

    const src = pImage.getAttribute('src') ?? '';
    const alt = pImage.getAttribute('alt') ?? '';
    const width = pImage.getAttribute('width') ?? '';

    const figure = document.createElement('figure');
    figure.classList.add('image');

    const img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('alt', alt);
    figure.style.width = width;

    figure.appendChild(img);
    p.replaceWith(figure);
  });

  return doc.body.innerHTML;
}
