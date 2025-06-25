import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';
import { BYPASS_AUTH } from '../../../tokens/context/http-context.token';

import { type FileStorageResponse } from '../../../../shared/models/api/response/file-storage-response.model';

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private readonly supabaseClient: SupabaseClient;

  private readonly httpClient = inject(HttpClient);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly UPLOAD_FILE_TO_STORAGE_API_URL = `${this.BASE_API_URL}/file-storage/upload-tokens`;

  private readonly SUPABASE_URL = environment.supabase.url;
  private readonly SUPABASE_KEY = environment.supabase.key;

  constructor() {
    this.supabaseClient = createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
  }

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
            return of(null);
          }

          const tokens = res.data.uploadTokens;

          // ? Tokens length must equal to files length
          if (tokens.length !== files.length) {
            this.toastHandlingService.errorGeneral();
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
                catchError(() => {
                  // ? If have 1 file got error then continue with other files and notify list error file later
                  failedFiles.push(files[index].name);
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
        catchError(() => {
          this.toastHandlingService.errorGeneral();
          return of(null);
        })
      );
  }

  async uploadFile(
    file: Blob | File,
    fileName: string,
    bucket: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error || !data) {
        console.error(`Upload error in bucket ${bucket}:`, error);
        return null;
      }

      const { data: publicData } = this.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicData?.publicUrl || null;
    } catch (err) {
      console.error('Unexpected error:', err);
      return null;
    }
  }
}
