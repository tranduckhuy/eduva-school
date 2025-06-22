import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpHeaders,
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { createRequestParams } from '../../../utils/request-utils';

import { BaseResponse } from '../../../models/api/base-response.model';

export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);

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
    params?: Record<string, any>
  ): Observable<BaseResponse<T>> {
    const options = {
      params: createRequestParams(params),
    };
    return this.http.get<BaseResponse<T>>(url, options);
  }

  /**
   * Sends a GET request to download a file (Blob) from the server.
   *
   * @param url The API endpoint to call.
   * @param params Optional query parameters to be appended to the request.
   * @returns An Observable emitting the binary Blob received from the server.
   */
  getFile(url: string, params?: Record<string, any>): Observable<Blob> {
    return this.http.get(url, {
      params: createRequestParams(params),
      responseType: 'blob',
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
  post<T>(url: string, body?: any): Observable<BaseResponse<T>> {
    return this.http.post<BaseResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Sends a POST request with FormData.
   * Commonly used for file upload scenarios.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target API endpoint.
   * @param formData A FormData object with fields and optional files.
   * @returns An Observable of BaseResponse<T>.
   */
  postFormData<T>(
    url: string,
    formData: FormData
  ): Observable<BaseResponse<T>> {
    return this.http.post<BaseResponse<T>>(url, formData);
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
  postFile(url: string, formData: FormData): Observable<Blob> {
    return this.http.post(url, formData, {
      responseType: 'blob',
    });
  }

  /**
   * Sends a POST request **without triggering auth interceptors**.
   * Use this method only for **public endpoints**, such as login or registration,
   * where attaching an access token or refreshing it is not applicable or necessary.
   *
   * Internally, this sets a special `HttpContextToken` (`BYPASS_AUTH`)
   * to instruct the `authInterceptor` to bypass token attachment and refresh logic.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target public API endpoint (e.g. /auth/login).
   * @param body (Optional) The request payload (will be JSON stringified).
   * @returns An Observable of BaseResponse<T>.
   *
   * @example
   * this.requestService
   *   .postWithoutAuth<LoginResponse>('/auth/login', { email, password })
   *   .subscribe(...);
   */
  postWithoutAuth<T>(url: string, body?: any): Observable<BaseResponse<T>> {
    return this.http.post<BaseResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
      context: new HttpContext().set(BYPASS_AUTH, true),
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
  put<T>(url: string, body?: any): Observable<BaseResponse<T>> {
    return this.http.put<BaseResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Sends a DELETE request to the specified URL.
   *
   * @template T The expected data type within the BaseResponse.
   * @param url The target API endpoint.
   * @returns An Observable of BaseResponse<T>.
   */
  delete<T>(url: string): Observable<BaseResponse<T>> {
    return this.http.delete<BaseResponse<T>>(url);
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
