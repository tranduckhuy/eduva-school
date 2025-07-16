import { Injectable, inject, signal } from '@angular/core';

import * as signalR from '@microsoft/signalr';

import { environment } from '../../../../../../../environments/environment';

import { JwtService } from '../../../../../../core/auth/services/jwt.service';
import { ToastHandlingService } from '../../../../../../shared/services/core/toast/toast-handling.service';

import { type UpdateAiJobProgressResponse } from '../../models/response/command/update-ai-job-progress-response.model';

@Injectable({
  providedIn: 'root',
})
export class AiSocketService {
  private connection: signalR.HubConnection | null = null;

  private readonly jwtService = inject(JwtService);
  private readonly toastHandlingService = inject(ToastHandlingService);

  private readonly BASE_HUB_API = environment.baseHubUrl;

  private readonly jobUpdateProgressSignal =
    signal<UpdateAiJobProgressResponse | null>(null);
  jobUpdateProgress = this.jobUpdateProgressSignal.asReadonly();

  connect(jobId: string): void {
    if (this.connection) {
      this.disconnect();
    }

    const accessToken = this.jwtService.getAccessToken();
    const hubUrl = `${this.BASE_HUB_API}/job-status?access_token=${accessToken}`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .then(() => {
        this.connection?.on(
          'JobStatusUpdated',
          (payload: UpdateAiJobProgressResponse) => {
            if (payload.jobId === jobId) {
              this.jobUpdateProgressSignal.set(payload);
            }
          }
        );
      })
      .catch(() => {
        this.toastHandlingService.errorGeneral();
        this.jobUpdateProgressSignal.set({
          failureReason:
            'Đã xảy ra lỗi trong quá trình kết nối. Vui lòng thử lại sau.',
        } as UpdateAiJobProgressResponse);
      });
  }

  disconnect(): void {
    this.connection?.stop();
    this.connection = null;
  }

  resetSignal(): void {
    this.jobUpdateProgressSignal.set(null);
  }
}
