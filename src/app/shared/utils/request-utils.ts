import { HttpContext, HttpParams } from '@angular/common/http';

import {
  BYPASS_AUTH,
  BYPASS_AUTH_ERROR,
  BYPASS_PAYMENT_ERROR,
  LOADING_KEY,
  SHOW_LOADING,
} from '../tokens/context/http-context.token';

import { type RequestOptions } from '../models/api/request-options.model';

/**
 * Utility function to convert an object into HttpParams
 * for use in GET requests.
 *
 * @param params An object of key-value pairs to be converted.
 *               Values of `null` or `undefined` will be ignored.
 * @returns HttpParams instance for use in HTTP GET options.
 */
export function createRequestParams(
  paramsObj: Record<string, any> = {}
): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(paramsObj)) {
    if (value !== null && value !== undefined) {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/**
 * Converts a plain object into FormData.
 * Useful when you have mixed data (e.g., form fields + files).
 *
 * @param data An object with primitive values or arrays/files.
 * @returns A FormData object representing the data.
 */
export function buildFormDataFromObject(data: Record<string, any>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof FileList) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value.item(i)!);
      }
    } else if (Array.isArray(value) && value[0] instanceof File) {
      for (const file of value) {
        formData.append(key, file);
      }
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  }

  return formData;
}

/**
 * Builds a configured `HttpContext` for an HTTP request based on the provided options.
 *
 * This is commonly used to control interceptor behavior such as:
 * - Whether to show a global loading spinner.
 * - Whether to bypass authentication token attachment (e.g., for public endpoints).
 *
 * @param options Optional `RequestOptions` object containing:
 *  - `bypassAuth` (default: false): Whether to bypass auth-related interceptors.
 *  - `bypassAuthError` (default: false): Whether to bypass 401 error related interceptors.
 *  - `bypassPaymentError` (default: false): Whether to bypass 402 error related interceptors.
 *  - `showLoading` (default: true): Whether to enable the global loading indicator.
 *  - `loadingKey` (default: 'default'): Whether to check specific global loading indicator.
 *
 * @returns An `HttpContext` instance with the configured flags.
 */
export function buildHttpContext(options?: RequestOptions): HttpContext {
  return new HttpContext()
    .set(BYPASS_AUTH, options?.bypassAuth === true)
    .set(BYPASS_AUTH_ERROR, options?.bypassAuthError === true)
    .set(BYPASS_PAYMENT_ERROR, options?.bypassPaymentError === true)
    .set(SHOW_LOADING, options?.showLoading !== false)
    .set(LOADING_KEY, options?.loadingKey ?? 'default');
}
