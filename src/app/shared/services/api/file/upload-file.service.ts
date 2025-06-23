import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';

import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import {
  BYPASS_AUTH,
  RequestService,
} from '../../core/request/request.service';
import { ToastHandlingService } from '../../core/toast/toast-handling.service';

import { StatusCode } from '../../../constants/status-code.constant';

import { type FileStorageResponse } from '../../../models/api/response/file-storage-response.model';

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private readonly httpClient = inject(HttpClient);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly UPLOAD_FILE_TO_STORAGE_API_URL = `${this.BASE_API_URL}/file-storage/upload-tokens`;

  uploadBlobs(
    request: string[],
    files: File[]
  ): Observable<FileStorageResponse | null> {
    return this.requestService
      .post<FileStorageResponse>(this.UPLOAD_FILE_TO_STORAGE_API_URL, request)
      .pipe(
        switchMap(res => {
          if (res.statusCode !== StatusCode.SUCCESS || !res.data) {
            this.toastHandlingService.errorGeneral();
            if (!environment.production) {
              console.error('Can not get upload tokens from API:', res);
            }
            return of(null);
          }

          const tokens = res.data.uploadTokens;

          // ? Tokens length must equal to files length
          if (tokens.length !== files.length) {
            this.toastHandlingService.errorGeneral();
            if (!environment.production) {
              console.error(
                `Mismatch files (${files.length}) vs tokens (${tokens.length})`,
                {
                  files,
                  tokens,
                }
              );
            }
            return of(null);
          }

          const failedFiles: string[] = [];

          // ? Call API by method 'PUT' for upload each file by each BlobUrl to Azure Storage
          const uploadRequests = tokens.map((token, index) =>
            this.httpClient
              .put(token, files[index], {
                headers: { 'x-ms-blob-type': 'BlockBlob' },
                context: new HttpContext().set(BYPASS_AUTH, true),
              })
              .pipe(
                catchError(err => {
                  // ? If have 1 file got error then continue with other files and notify list error file later
                  failedFiles.push(files[index].name);
                  if (!environment.production) {
                    console.error(`Failed for file: ${files[index].name}`, err);
                  }
                  return of(null); // Continue with other files
                })
              )
          );

          return forkJoin(uploadRequests).pipe(
            map(() => {
              const sourceUrls = tokens.map(token => token.split('?')[0]);

              if (failedFiles.length > 0) {
                this.toastHandlingService.error(
                  'Lỗi',
                  `Không thể upload các file sau: ${failedFiles.join(', ')}`
                );
              }

              return {
                ...res.data!,
                uploadTokens: sourceUrls,
              };
            })
          );
        }),
        catchError(err => {
          this.toastHandlingService.errorGeneral();
          if (!environment.production) {
            console.error('Error:', err);
          }
          return of(null);
        })
      );
  }
}
