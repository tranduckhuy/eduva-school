import { Injectable, signal, computed } from '@angular/core';

import { type ContentType } from '../../../../../../shared/models/enum/lesson-material.enum';

import { type LessonGenerationType } from '../../../../../../shared/models/enum/lesson-generation-type.enum';
import {
  MAX_GENERATE_LESSON_FILE_SIZE,
  MAX_GENERATE_LESSON_FILE_COUNT,
} from '../../../../../../shared/constants/common.constant';

export interface ChatMessage {
  sender: 'user' | 'system';
  content: string;
  isLoading?: boolean;
}

export interface AiGeneratedMetadata {
  title: string;
  contentType: ContentType;
  duration: number;
  fileSize: number;
  blobName: string;
}

export type SourceItem = {
  id: string;
  name: string;
  checked: boolean;
  isUploading?: boolean;
  type: 'pdf' | 'docx';
  file?: File;
};

export type ContentState = 'empty' | 'loading' | 'generated';

@Injectable({
  providedIn: 'root',
})
export class ResourcesStateService {
  // ? Signal State Management
  private readonly sourceListSignal = signal<SourceItem[]>([]);
  sourceList = this.sourceListSignal.asReadonly();

  private readonly isLoadingSignal = signal(false);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  private readonly hasInteractedSignal = signal(false);
  hasInteracted = this.hasInteractedSignal.asReadonly();

  private readonly hasPreviewContentSignal = signal(false);
  readonly hasPreviewContentSuccessfully =
    this.hasPreviewContentSignal.asReadonly();

  private readonly hasGeneratedSuccessfullySignal = signal(false);
  readonly hasGeneratedSuccessfully =
    this.hasGeneratedSuccessfullySignal.asReadonly();

  private readonly generatedTypeSignal = signal<LessonGenerationType | null>(
    null
  );
  readonly generatedType = this.generatedTypeSignal.asReadonly();

  private readonly aiGeneratedMetadataMapSignal = signal<Record<
    LessonGenerationType,
    AiGeneratedMetadata
  > | null>(null);
  readonly aiGeneratedMetadataMap =
    this.aiGeneratedMetadataMapSignal.asReadonly();

  // ? Preview State Management (shared between desktop and mobile)
  private readonly videoStateSignal = signal<ContentState>('empty');
  readonly videoState = this.videoStateSignal.asReadonly();

  private readonly audioStateSignal = signal<ContentState>('empty');
  readonly audioState = this.audioStateSignal.asReadonly();

  private readonly videoUrlSignal = signal<string>('');
  readonly videoUrl = this.videoUrlSignal.asReadonly();

  private readonly audioUrlSignal = signal<string>('');
  readonly audioUrl = this.audioUrlSignal.asReadonly();

  private readonly currentGeneratedTypeSignal =
    signal<LessonGenerationType | null>(null);
  readonly currentGeneratedType = this.currentGeneratedTypeSignal.asReadonly();

  // ? Video Player State
  private readonly videoCurrentTimeSignal = signal<number>(0);
  readonly videoCurrentTime = this.videoCurrentTimeSignal.asReadonly();

  private readonly videoDurationSignal = signal<number>(0);
  readonly videoDuration = this.videoDurationSignal.asReadonly();

  private readonly videoIsPausedSignal = signal<boolean>(true);
  readonly videoIsPaused = this.videoIsPausedSignal.asReadonly();

  private readonly videoIsLoadingSignal = signal<boolean>(false);
  readonly videoIsLoading = this.videoIsLoadingSignal.asReadonly();

  // ? Audio Player State
  private readonly audioCurrentTimeSignal = signal<number>(0);
  readonly audioCurrentTime = this.audioCurrentTimeSignal.asReadonly();

  private readonly audioDurationSignal = signal<number>(0);
  readonly audioDuration = this.audioDurationSignal.asReadonly();

  private readonly audioVolumeSignal = signal<number>(100);
  readonly audioVolume = this.audioVolumeSignal.asReadonly();

  private readonly audioPlaybackRateSignal = signal<number>(1.0);
  readonly audioPlaybackRate = this.audioPlaybackRateSignal.asReadonly();

  private readonly audioIsPlayingSignal = signal<boolean>(false);
  readonly audioIsPlaying = this.audioIsPlayingSignal.asReadonly();

  // ? Upload State Management (shared between desktop and mobile)
  private readonly selectAllSignal = signal<boolean>(false);
  readonly selectAll = this.selectAllSignal.asReadonly();

  private readonly openedMenuIdSignal = signal<string | null>(null);
  readonly openedMenuId = this.openedMenuIdSignal.asReadonly();

  // ? Chat State Management (shared between desktop and mobile)
  private readonly messagesSignal = signal<ChatMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  private readonly showScrollButtonSignal = signal<boolean>(false);
  readonly showScrollButton = this.showScrollButtonSignal.asReadonly();

  private readonly isFirstJobSignal = signal<boolean>(true);
  readonly isFirstJob = this.isFirstJobSignal.asReadonly();

  // ? Computed
  readonly checkedFiles = computed(() =>
    this.sourceListSignal()
      .filter(i => i.checked && !i.isUploading && i.file)
      .map(i => i.file as File)
  );

  readonly totalSources = computed(() => this.sourceListSignal().length);

  readonly totalCheckedSources = computed(
    () =>
      this.sourceListSignal().filter(i => i.checked && !i.isUploading).length
  );

  readonly totalFileSize = computed(() => {
    return this.sourceListSignal()
      .filter(item => item.file)
      .reduce((total, item) => total + (item.file?.size || 0), 0);
  });

  readonly maxFileCount = MAX_GENERATE_LESSON_FILE_COUNT;
  readonly maxFileSize = MAX_GENERATE_LESSON_FILE_SIZE;

  updateSourceList(updateFn: (items: SourceItem[]) => SourceItem[]) {
    this.sourceListSignal.update(updateFn);
  }

  updateHasInteracted(value: boolean) {
    this.hasInteractedSignal.set(value);
  }

  updateIsLoading(value: boolean) {
    this.isLoadingSignal.set(value);
  }

  markGeneratedPreviewContentSuccess() {
    this.hasPreviewContentSignal.set(true);
  }

  resetGeneratedPreviewContentStatus() {
    this.hasPreviewContentSignal.set(false);
  }

  markGeneratedSuccess() {
    this.hasGeneratedSuccessfullySignal.set(true);
  }

  resetGeneratedStatus() {
    this.hasGeneratedSuccessfullySignal.set(false);
  }

  setGeneratedType(type: LessonGenerationType) {
    this.generatedTypeSignal.set(type);
  }

  setAiGeneratedMetadata(
    type: LessonGenerationType,
    metadata: AiGeneratedMetadata
  ) {
    const current = this.aiGeneratedMetadataMapSignal() ?? {};
    this.aiGeneratedMetadataMapSignal.set({
      ...current,
      [type]: metadata,
    } as Record<LessonGenerationType, AiGeneratedMetadata>);
  }

  clearAiGeneratedMetadata() {
    this.aiGeneratedMetadataMapSignal.set(null);
  }

  // ? Preview State Methods
  setVideoState(state: ContentState) {
    this.videoStateSignal.set(state);
  }

  setAudioState(state: ContentState) {
    this.audioStateSignal.set(state);
  }

  setVideoUrl(url: string) {
    this.videoUrlSignal.set(url);
  }

  setAudioUrl(url: string) {
    this.audioUrlSignal.set(url);
  }

  setCurrentGeneratedType(type: LessonGenerationType | null) {
    this.currentGeneratedTypeSignal.set(type);
  }

  // ? Video Player State Methods
  setVideoCurrentTime(time: number) {
    this.videoCurrentTimeSignal.set(time);
  }

  setVideoDuration(duration: number) {
    this.videoDurationSignal.set(duration);
  }

  setVideoIsPaused(isPaused: boolean) {
    this.videoIsPausedSignal.set(isPaused);
  }

  setVideoIsLoading(isLoading: boolean) {
    this.videoIsLoadingSignal.set(isLoading);
  }

  // ? Audio Player State Methods
  setAudioCurrentTime(time: number) {
    this.audioCurrentTimeSignal.set(time);
  }

  setAudioDuration(duration: number) {
    this.audioDurationSignal.set(duration);
  }

  setAudioVolume(volume: number) {
    this.audioVolumeSignal.set(volume);
  }

  setAudioPlaybackRate(rate: number) {
    this.audioPlaybackRateSignal.set(rate);
  }

  setAudioIsPlaying(isPlaying: boolean) {
    this.audioIsPlayingSignal.set(isPlaying);
  }

  // ? Upload State Methods
  setSelectAll(checked: boolean) {
    this.selectAllSignal.set(checked);
  }

  setOpenedMenuId(id: string | null) {
    this.openedMenuIdSignal.set(id);
  }

  // ? Chat State Methods
  setMessages(messages: ChatMessage[]) {
    this.messagesSignal.set(messages);
  }

  updateMessages(updateFn: (messages: ChatMessage[]) => ChatMessage[]) {
    this.messagesSignal.update(updateFn);
  }

  setShowScrollButton(show: boolean) {
    this.showScrollButtonSignal.set(show);
  }

  setIsFirstJob(isFirst: boolean) {
    this.isFirstJobSignal.set(isFirst);
  }

  resetAll(): void {
    this.sourceListSignal.set([]);
    this.isLoadingSignal.set(false);
    this.hasInteractedSignal.set(false);
    this.hasPreviewContentSignal.set(false);
    this.hasGeneratedSuccessfullySignal.set(false);
    this.generatedTypeSignal.set(null);
    this.aiGeneratedMetadataMapSignal.set(null);

    // ? Reset preview states
    this.videoStateSignal.set('empty');
    this.audioStateSignal.set('empty');
    this.videoUrlSignal.set('');
    this.audioUrlSignal.set('');
    this.currentGeneratedTypeSignal.set(null);

    // ? Reset video player states
    this.videoCurrentTimeSignal.set(0);
    this.videoDurationSignal.set(0);
    this.videoIsPausedSignal.set(true);
    this.videoIsLoadingSignal.set(false);

    // ? Reset audio player states
    this.audioCurrentTimeSignal.set(0);
    this.audioDurationSignal.set(0);
    this.audioVolumeSignal.set(100);
    this.audioPlaybackRateSignal.set(1.0);
    this.audioIsPlayingSignal.set(false);

    // ? Reset upload states
    this.selectAllSignal.set(false);
    this.openedMenuIdSignal.set(null);

    // ? Reset chat states
    this.messagesSignal.set([]);
    this.showScrollButtonSignal.set(false);
    this.isFirstJobSignal.set(true);
  }
}
