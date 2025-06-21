import { computed, Injectable, signal } from '@angular/core';

export type SourceItem = {
  id: string;
  name: string;
  checked: boolean;
  isUploading?: boolean;
  type: 'pdf' | 'txt';
};

@Injectable({
  providedIn: 'root',
})
export class ResourcesStateService {
  private readonly _sourceList = signal<SourceItem[]>([]);
  sourceList = this._sourceList.asReadonly();

  private readonly _hasInteracted = signal(false);
  hasInteracted = this._hasInteracted.asReadonly();

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  readonly totalSources = computed(() => this._sourceList().length);
  readonly checkedSources = computed(
    () => this._sourceList().filter(i => i.checked && !i.isUploading).length
  );

  updateSourceList(updateFn: (items: SourceItem[]) => SourceItem[]) {
    this._sourceList.update(updateFn);
  }

  updateHasInteracted(value: boolean) {
    this._hasInteracted.set(value);
  }

  updateIsLoading(value: boolean) {
    this._isLoading.set(value);
  }
}
