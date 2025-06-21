import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { createRequestParams } from '../../utils/request-utils';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly http = inject(HttpClient);

  /**
   * Sends a GET request to the specified URL with optional query parameters.
   *
   * @param url The API endpoint URL.
   * @param params Optional query parameters as a key-value object.
   * @returns An Observable of the response body.
   */
  get<T>(url: string, params?: Record<string, any>): Observable<T> {
    const options = {
      params: createRequestParams(params),
    };
    return this.http.get<T>(url, options);
  }

  /**
   * Sends a POST request with JSON data to the specified URL.
   *
   * @param url The API endpoint URL.
   * @param body Optional body payload (will be JSON.stringified).
   * @returns An Observable of the response body.
   */
  post<T>(url: string, body?: any): Observable<T> {
    return this.http.post<T>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Sends a PUT request with JSON data to the specified URL.
   *
   * @param url The API endpoint URL.
   * @param body Optional body payload (will be JSON.stringified).
   * @returns An Observable of the response body.
   */
  put<T>(url: string, body?: any): Observable<T> {
    return this.http.put<T>(url, JSON.stringify(body ?? {}), {
      headers: this.getJsonHeaders(),
    });
  }

  /**
   * Sends a DELETE request to the specified URL.
   *
   * @param url The API endpoint URL.
   * @returns An Observable of the response body.
   */
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }

  /**
   * Returns HttpHeaders configured for JSON content.
   *
   * @returns A HttpHeaders object with 'Content-Type: application/json'
   */
  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }
}
