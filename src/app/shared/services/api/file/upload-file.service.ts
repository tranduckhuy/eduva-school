import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../shared/services/core/toast/toast-handling.service';

import {
  StatusCode,
  type StatusCodeType,
} from '../../../../shared/constants/status-code.constant';
import { BYPASS_AUTH } from '../../../tokens/context/http-context.token';

import { type FileStorageRequest } from '../../../models/api/request/command/file-storage-request.model';
import { type FileStorageResponse } from '../../../models/api/response/command/file-storage-response.model';

type UploadError = {
  isBusinessError: true;
  statusCode: StatusCodeType;
};
@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private readonly supabaseClient: SupabaseClient;

  private readonly httpClient = inject(HttpClient);
  private readonly requestService = inject(RequestService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly UPLOAD_FILE_TO_STORAGE_API_URL = `${this.BASE_API_URL}/file-storage/upload-tokens-with-quota`;

  private readonly SUPABASE_URL = environment.supabase.url;
  private readonly SUPABASE_KEY = environment.supabase.key;

  constructor() {
    this.supabaseClient = createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
  }

  uploadBlobs(
    request: FileStorageRequest,
    files: File[]
  ): Observable<FileStorageResponse | null> {
    return this.requestService
      .post<FileStorageResponse>(this.UPLOAD_FILE_TO_STORAGE_API_URL, request)
      .pipe(
        switchMap(res => {
          if (
            !res.data ||
            res.statusCode !== StatusCode.SUCCESS ||
            res.data.uploadTokens.length !== files.length
          ) {
            const error: UploadError = {
              isBusinessError: true,
              statusCode: res.statusCode,
            };
            return throwError(() => error);
          }

          const tokens = res.data.uploadTokens;
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
                  return of(null); // ? Continue with other files
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
        catchError((err: UploadError) => {
          if (err?.isBusinessError) {
            if (err.statusCode === StatusCode.STORAGE_QUOTA_EXCEEDED) {
              this.toastHandlingService.warn(
                'Đã đạt giới hạn lưu trữ',
                'Vui lòng liên hệ quản trị viên để nâng cấp gói và tiếp tục sử dụng.'
              );
            } else {
              this.toastHandlingService.errorGeneral();
            }
          } else {
            this.toastHandlingService.errorGeneral();
          }
          return throwError(() => err);
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

  async getBackgroundImageUrls(): Promise<string[]> {
    const { data, error } = await this.supabaseClient.storage
      .from('classroom-images')
      .list();

    if (error || !data) return [];

    return data.map(
      file =>
        this.supabaseClient.storage
          .from('classroom-images')
          .getPublicUrl(file.name).data.publicUrl
    );
  }
}
