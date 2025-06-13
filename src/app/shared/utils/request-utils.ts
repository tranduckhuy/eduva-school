import { HttpParams } from '@angular/common/http';

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
