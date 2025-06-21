import { HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

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
      const isPlainObject = typeof value === 'object';
      formData.append(
        key,
        isPlainObject ? JSON.stringify(value) : value.toString()
      );
    }
  }

  return formData;
}
