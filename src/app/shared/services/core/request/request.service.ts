import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  createRequestParams,
  buildHttpContext,
  buildFormDataFromObject,
} from '../../../utils/request-utils';

import { type BaseResponse } from '../../../models/api/base-response.model';
import { type RequestOptions } from '../../../models/api/request-options.model';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly http = inject(HttpClient);

  /**
   * Sends a GET request with optional query parameters.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target API endpoint.
   * @param params (Optional) Query parameters as key-value pairs.
   * @returns An Observable of BaseResponse<T>.
   */
  get<T>(
    url: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Observable<BaseResponse<T>> {
    const reqOptions = {
      params: createRequestParams(params),
      context: buildHttpContext(options),
    };
    return this.http.get<BaseResponse<T>>(url, reqOptions);
  }

  /**
   * Sends a GET request to download a file (Blob) from the server.
   *
   * @param url The API endpoint to call.
   * @param params Optional query parameters to be appended to the request.
   * @returns An Observable emitting the binary Blob received from the server.
   */
  getFile(
    url: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(url, {
      params: createRequestParams(params),
      context: buildHttpContext(options),
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * Sends a POST request with JSON payload.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target API endpoint.
   * @param body (Optional) The request payload (will be JSON stringified).
   * @returns An Observable of BaseResponse<T>.
   */
  post<T>(
    url: string,
    body?: any,
    options?: RequestOptions
  ): Observable<BaseResponse<T>> {
    return this.http.post<BaseResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
      context: buildHttpContext(options),
    });
  }

  /**
   * Convenience method to send POST requests with form data.
   * Automatically converts input `data` to `FormData`.
   *
   * @template T The expected response type.
   * @param url API endpoint.
   * @param data Object containing primitive values, File, FileList, or File[].
   * @param options Optional request options.
   */
  postWithFormData<T>(
    url: string,
    data: Record<string, any>,
    options?: RequestOptions
  ): Observable<BaseResponse<T>> {
    const formData = buildFormDataFromObject(data);
    return this.http.post<BaseResponse<T>>(url, formData, {
      context: buildHttpContext(options),
    });
  }

  /**
   * Sends a POST request with FormData and expects a **binary file (Blob)** as the response.
   *
   * Use this method specifically when:
   * - You are uploading a file using `FormData`, **and**
   * - The server may respond with a file (e.g., Excel error file) instead of JSON.
   *
   * Common use cases include:
   * - Import operations where the uploaded data may contain validation errors,
   *   and the server returns an annotated error file for download.
   *
   * Use `postFormData<T>()` instead if the API returns a structured JSON response (`BaseResponse<T>`).
   *
   * @param url The target API endpoint.
   * @param formData The FormData object containing the upload payload (e.g., a file).
   * @returns An Observable emitting the file response as a Blob.
   */
  postFile(
    url: string,
    formData: FormData,
    options?: RequestOptions
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(url, formData, {
      context: buildHttpContext(options),
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * Sends a PUT request with JSON payload.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target API endpoint.
   * @param body (Optional) The request payload (will be JSON stringified).
   * @returns An Observable of BaseResponse<T>.
   */
  put<T>(
    url: string,
    body?: any,
    options?: RequestOptions
  ): Observable<BaseResponse<T>> {
    return this.http.put<BaseResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
      context: buildHttpContext(options),
    });
  }

  /**
   * Sends a DELETE request to the specified URL.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target API endpoint.
   * @returns An Observable of BaseResponse<T>.
   */
  delete<T>(
    url: string,
    options?: RequestOptions
  ): Observable<BaseResponse<T>> {
    return this.http.delete<BaseResponse<T>>(url, {
      context: buildHttpContext(options),
    });
  }

  /**
   * Sends an HTTP DELETE request with an optional JSON body and custom request options.
   *
   * This method is useful for DELETE operations that require additional data in the request body,
   * such as batch deletions or conditional deletions based on filters or flags.
   *
   * ⚠️ Note: Not all servers or proxies support bodies in DELETE requests.
   *
   * @template T - The expected type of the response payload inside `BaseResponse<T>`.
   * @param url - The target URL to send the DELETE request to.
   * @param body - Optional body payload to send with the DELETE request (e.g., filter conditions, list of IDs).
   * @param options - Optional request options (e.g., loading indicator key, toast messages, custom context).
   * @returns An `Observable` of type `BaseResponse<T>`, representing the HTTP response.
   */
  deleteWithBody<T>(
    url: string,
    body?: any,
    options?: RequestOptions
  ): Observable<BaseResponse<T>> {
    return this.http.delete<BaseResponse<T>>(url, {
      headers: this.getJsonHeaders(),
      body: JSON.stringify(body ?? {}),
      context: buildHttpContext(options),
    });
  }

  /**
   * Constructs and returns JSON-specific HttpHeaders.
   *
   * @returns HttpHeaders with 'Content-Type: application/json'.
   */
  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }
}
