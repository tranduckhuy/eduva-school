import { Signal, EffectRef, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { ContentType } from '../models/enum/lesson-material.enum';

import { type NotificationModel } from '../models/entities/notification.model';
import { type NotificationPayloadMap } from '../../core/layout/header/user-actions/notifications/models/notification-payload-mapping.model';

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

/*
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

/**
 * Casts the raw payload of a notification to its specific typed payload
 * based on the notification type, enabling type-safe access to payload properties.
 *
 * @template T - The specific key of the NotificationPayloadMap indicating the notification type.
 * @param raw - The original notification object with an untyped payload.
 * @returns A new notification object with the payload cast to its corresponding typed structure.
 */
export function mapNotificationPayload<T extends keyof NotificationPayloadMap>(
  raw: NotificationModel<any>
): NotificationModel<NotificationPayloadMap[T]> {
  const typedPayload = raw.payload as NotificationPayloadMap[T];

  return {
    ...raw,
    payload: typedPayload,
  };
}

/**
 * Removes specific query parameters from the current route URL without reloading the page.
 *
 * @param router - The Angular Router instance used to navigate.
 * @param activatedRoute - The current ActivatedRoute instance for relative navigation.
 * @param keys - An array of query parameter keys to be removed.
 */
export function clearQueryParams(
  router: Router,
  activatedRoute: ActivatedRoute,
  keys: string[]
): void {
  const queryParams: Record<string, null> = {};
  keys.forEach(key => (queryParams[key] = null));

  router.navigate([], {
    relativeTo: activatedRoute,
    queryParams,
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}

/**
 * Format a date string to a human-readable relative time in Vietnamese.
 *
 * @param dateString - The ISO date string to format.
 * @returns {string} A string representing the relative time, e.g.:
 *   - "Vừa xong" (just now)
 *   - "5 phút trước" (5 minutes ago)
 *   - "2 giờ trước" (2 hours ago)
 *   - "3 ngày trước" (3 days ago)
 *   - "1 tháng trước" (1 month ago)
 *   - "2 năm trước" (2 years ago)
 *   - Returns an empty string if input is falsy.
 */
export function formatRelativeDate(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = now.getTime() - target.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  if (months < 12) return `${months} tháng trước`;
  return `${years} năm trước`;
}
