import { HttpContext, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import {
  BYPASS_AUTH,
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
 * Converts a FormGroup's value into a FormData object.
 * Useful for submitting multipart/form-data payloads (e.g., for file uploads).
 * File inputs (as FileList) will have the first file appended.
 *
 * @param form The FormGroup containing fields and optional file inputs.
 * @returns A FormData object representing the form's values.
 */
export function buildFormDataFromFormGroup(form: FormGroup): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(form.value)) {
    if (value instanceof FileList) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value.item(i)!);
      }
    } else if (value !== null && value !== undefined) {
      formData.append(key, JSON.stringify(value));
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
 *  - `showLoading` (default: true): Whether to enable the global loading indicator.
 *  - `loadingKey` (default: 'default'): Whether to check specific global loading indicator.
 *
 * @returns An `HttpContext` instance with the configured flags.
 */
export function buildHttpContext(options?: RequestOptions): HttpContext {
  return new HttpContext()
    .set(BYPASS_AUTH, options?.bypassAuth === true)
    .set(SHOW_LOADING, options?.showLoading !== false)
    .set(LOADING_KEY, options?.loadingKey ?? 'default');
}
