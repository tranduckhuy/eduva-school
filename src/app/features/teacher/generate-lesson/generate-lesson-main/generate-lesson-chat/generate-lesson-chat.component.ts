import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ElementRef,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  viewChild,
  DestroyRef,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

import { ResourcesStateService } from '../services/utils/resources-state.service';
import { AiJobsService } from '../services/api/ai-jobs.service';
import { AiSocketService } from '../services/api/ai-socket.service';

import { JobStatus } from '../../../../../shared/models/enum/job-status.enum';
import { StatusCode } from '../../../../../shared/constants/status-code.constant';

import { ChatMessageComponent } from './chat-message/chat-message.component';
import { type CreateAiJobRequest } from '../models/request/command/create-ai-job-request.model';
import {
  renderFailureMessage,
  renderSuccessMessage,
  renderReadOnlySuccessMessage,
  renderProvidedInformationError,
} from './chat-message.helper';

interface ChatMessage {
  sender: 'user' | 'system';
  content: string;
  isLoading?: boolean;
}

interface AiResponseMessage {
  previewContent?: string;
  language?: string;
  audioCost?: number;
  videoCost?: number;
  estimatedDurationMinutes?: number;
  failureReason?: string | null;
}

@Component({
  selector: 'generate-lesson-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextareaModule,
    ButtonModule,
    CarouselModule,
    ChatMessageComponent,
  ],
  templateUrl: './generate-lesson-chat.component.html',
  styleUrl: './generate-lesson-chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLessonChatComponent implements OnInit, AfterViewInit {
  private readonly scrollContainer = viewChild<ElementRef>('scrollContainer');
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resourcesStateService = inject(ResourcesStateService);
  private readonly aiJobService = inject(AiJobsService);
  private readonly aiSocketService = inject(AiSocketService);

  readonly job = this.aiJobService.job;
  readonly jobUpdateProgress = this.aiSocketService.jobUpdateProgress;
  readonly checkedFiles = this.resourcesStateService.checkedFiles;
  readonly totalUploaded = this.resourcesStateService.totalSources;
  readonly totalChecked = this.resourcesStateService.totalCheckedSources;
  readonly isLoading = this.resourcesStateService.isLoading;
  readonly isFirstJob = this.resourcesStateService.isFirstJob;
  readonly hasPreviewContentSuccessfully =
    this.resourcesStateService.hasPreviewContentSuccessfully;
  readonly hasGeneratedSuccessfully =
    this.resourcesStateService.hasGeneratedSuccessfully;
  readonly hasProcessedResponse =
    this.resourcesStateService.hasProcessedResponse;
  readonly hasProvidedInformationError =
    this.resourcesStateService.hasProvidedInformationError;
  messages = this.resourcesStateService.messages;
  showScrollButton = this.resourcesStateService.showScrollButton;

  form: FormGroup = this.fb.group({
    topic: ['', Validators.required],
  });

  readonly buttons = [
    { title: 'Bài học tế bào sinh vật' },
    { title: 'Người lính trong Tây Tiến' },
    { title: 'Phương trình hai ẩn' },
  ];

  readonly responsiveOptions = [
    { breakpoint: '1400px', numVisible: 2, numScroll: 1 },
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '767px', numVisible: 2, numScroll: 1 },
    { breakpoint: '575px', numVisible: 1, numScroll: 1 },
  ];

  readonly disabledSendButton = computed(
    () =>
      this.isLoading() ||
      this.totalChecked() === 0 ||
      this.hasPreviewContentSuccessfully() ||
      this.hasGeneratedSuccessfully()
  );

  constructor() {
    effect(this.handleJobUpdateEffect.bind(this), { allowSignalWrites: true });

    this.destroyRef.onDestroy(() => this.resetAll());
  }

  ngOnInit(): void {
    const job = this.job();
    if (!job) return;
    this.scrollToBottom();
    this.restoreMessagesFromJob(job);
    if (!job.failureReason) {
      this.resourcesStateService.markGeneratedSuccess();
    }
    this.resourcesStateService.updateHasInteracted(true);
  }

  ngAfterViewInit(): void {
    this.scrollContainer()?.nativeElement.addEventListener('scroll', () => {
      const container = this.scrollContainer()?.nativeElement;
      if (!container) return;
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        200;
      this.resourcesStateService.setShowScrollButton(!nearBottom);
    });
  }

  get topic() {
    return this.form.get('topic');
  }

  submitMessage(): void {
    if (this.shouldBlockSend()) return;

    const content = this.topic?.value.trim();
    if (!content) return;

    this.addUserMessage(content);
    this.handleJobSend();
    this.form.reset();
  }

  handleChipClick(title: string): void {
    const content = `Tạo bài giảng về ${title}`;
    this.form.patchValue({ topic: content });

    if (this.shouldBlockSend()) return;

    this.addUserMessage(content);
    this.handleJobSend();
    this.form.reset();
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey || this.shouldBlockSend()) return;

    this.submitMessage();
  }

  scrollToBottom(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = this.scrollContainer()?.nativeElement;
        container?.scrollTo({ top: container.scrollHeight });
      });
    });
  }

  private handleJobUpdateEffect() {
    const payload = this.jobUpdateProgress();
    const jobStatus = payload?.status;
    const previewContent = payload?.previewContent;
    const failureReason = payload?.failureReason;

    if (
      payload &&
      jobStatus === JobStatus.ContentGenerated &&
      (previewContent || failureReason) &&
      !this.hasProcessedResponse()
    ) {
      this.scrollToBottom();
      this.displaySystemAiMessage(payload);
      this.resourcesStateService.updateIsLoading(false);
    }
  }

  private shouldBlockSend(): boolean {
    return (
      this.form.invalid ||
      this.isLoading() ||
      this.totalChecked() === 0 ||
      this.hasPreviewContentSuccessfully() ||
      this.hasGeneratedSuccessfully()
    );
  }

  private addUserMessage(content: string) {
    this.resourcesStateService.updateHasInteracted(true);
    this.resourcesStateService.updateMessages(prev => [
      ...prev,
      { sender: 'user', content },
    ]);
  }

  private handleJobSend() {
    const isFirstJob = this.isFirstJob();
    if (isFirstJob) {
      this.createAiJob();
    } else {
      this.updateAiJob();
    }
  }

  private createAiJob(): void {
    this.prepareForJobSend();

    const topic = this.topic?.value.trim();
    if (!topic) {
      this.resourcesStateService.updateIsLoading(false);
      return;
    }

    const request: CreateAiJobRequest = {
      file: this.checkedFiles(),
      topic,
    };
    this.aiJobService.createAiJob(request).subscribe({
      next: res => {
        if (!res?.jobId) {
          this.resourcesStateService.updateIsLoading(false);
          return;
        }

        this.resourcesStateService.setIsFirstJob(false);
        this.aiSocketService.resetSignal();
        this.aiSocketService.connect(res.jobId);
      },
      error: (err: any) => {
        this.scrollToBottom();
        this.resourcesStateService.updateIsLoading(false);

        if (
          err?.error?.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID
        ) {
          this.handleProvidedInformationError();
        }
      },
    });
  }

  private updateAiJob(): void {
    this.prepareForJobSend();

    const jobId = this.aiJobService.jobId();
    const topic = this.topic?.value.trim();
    if (!jobId || !topic) {
      this.resourcesStateService.updateIsLoading(false);
      return;
    }

    const request: CreateAiJobRequest = {
      file: this.checkedFiles(),
      topic,
    };
    this.aiJobService.updateAiJob(jobId, request).subscribe({
      error: (err: any) => {
        this.scrollToBottom();
        this.resourcesStateService.updateIsLoading(false);

        if (
          err?.error?.statusCode === StatusCode.PROVIDED_INFORMATION_IS_INVALID
        ) {
          this.handleProvidedInformationError();
        }
      },
    });
  }

  private handleProvidedInformationError(): void {
    this.resourcesStateService.setProvidedInformationError(true);

    const errorMessage: ChatMessage = {
      sender: 'system',
      content: renderProvidedInformationError(),
      isLoading: false,
    };

    this.resourcesStateService.updateMessages(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(m => m.sender === 'system' && m.isLoading);

      if (idx !== -1) {
        updated[idx] = errorMessage;
      } else {
        updated.push(errorMessage);
      }

      return updated;
    });

    this.resourcesStateService.markProcessedResponse();
  }

  private displaySystemAiMessage({
    previewContent,
    language,
    audioCost,
    videoCost,
    estimatedDurationMinutes,
    failureReason,
  }: AiResponseMessage): void {
    this.resourcesStateService.updateIsLoading(false);

    if (failureReason) {
      this.resourcesStateService.resetGeneratedPreviewContentStatus();
    }

    const content = failureReason
      ? renderFailureMessage(failureReason)
      : renderSuccessMessage(
          previewContent,
          language,
          audioCost,
          videoCost,
          estimatedDurationMinutes,
          this.formatEstimatedDuration.bind(this)
        );

    this.resourcesStateService.updateMessages(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(m => m.sender === 'system' && m.isLoading);
      const newMessage: ChatMessage = {
        sender: 'system',
        content,
        isLoading: false,
      };

      if (idx !== -1) {
        updated[idx] = newMessage;
      } else {
        updated.push(newMessage);
      }

      return updated;
    });

    this.resourcesStateService.markProcessedResponse();
    if (!failureReason && previewContent) {
      this.resourcesStateService.markGeneratedPreviewContentSuccess();
    }
  }

  private restoreMessagesFromJob(job: {
    topic: string;
    previewContent?: string;
    audioCost?: number;
    videoCost?: number;
    failureReason?: string | null;
  }): void {
    const userMessage: ChatMessage = {
      sender: 'user',
      content: job.topic,
    };
    const systemMessage: ChatMessage = {
      sender: 'system',
      content: job.failureReason
        ? renderFailureMessage(job.failureReason)
        : renderReadOnlySuccessMessage(),
      isLoading: false,
    };

    this.resourcesStateService.setMessages([userMessage, systemMessage]);
    // ? State that prevent double response message of job even when generate failed
    this.resourcesStateService.markProcessedResponse();

    if (!job.failureReason) {
      this.resourcesStateService.markGeneratedPreviewContentSuccess();
    }
  }

  private prepareForJobSend() {
    this.scrollToBottom();

    this.resourcesStateService.updateIsLoading(true);
    this.resourcesStateService.resetGeneratedStatus();
    this.resourcesStateService.resetGeneratedPreviewContentStatus();
    this.resourcesStateService.resetProcessedResponse();
    this.resourcesStateService.resetProvidedInformationError();
    this.resourcesStateService.updateMessages(prev => [
      ...prev,
      { sender: 'system', content: '', isLoading: true },
    ]);
  }

  private formatEstimatedDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '';
    const totalMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - totalMinutes) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    let result = '';

    if (hours > 0) result += `${hours} tiếng `;
    if (remainingMinutes > 0) result += `${remainingMinutes} phút `;
    if (seconds > 0) result += `${seconds} giây`;

    return result.trim();
  }

  private resetAll() {
    this.resourcesStateService.setIsFirstJob(true);
    this.resourcesStateService.setMessages([]);
    this.resourcesStateService.resetProcessedResponse();
    this.resourcesStateService.resetProvidedInformationError();
  }
}
