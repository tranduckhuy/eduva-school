import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, map, catchError, throwError } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { RequestService } from '../../../../shared/services/core/request/request.service';

import { StatusCode } from '../../../../shared/constants/status-code.constant';

import { type FileStorageQuotaResponse } from '../../models/file-storage-quota-response.model';

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  private readonly requestService = inject(RequestService);

  private readonly BASE_API_URL = environment.baseApiUrl;
  private readonly GET_FILE_STORAGE_QUOTA = `${this.BASE_API_URL}/file-storage/storage-quota`;

  getFileStorageQuota(): Observable<FileStorageQuotaResponse | null> {
    return this.requestService
      .get<FileStorageQuotaResponse>(this.GET_FILE_STORAGE_QUOTA)
      .pipe(
        map(res => {
          if (res.statusCode === StatusCode.SUCCESS && res.data) {
            return res.data;
          }
          return null;
        }),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }
}
