import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { debounceSignal } from '../../utils/util-functions';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  private readonly destroyRef = inject(DestroyRef);

  private readonly destroyDebounce: () => void;

  placeholder = input<string>('Tìm kiếm...');
  customClasses = input<string>('');

  search = output<string>();

  searchTerm = signal<string>('');

  constructor() {
    this.destroyDebounce = debounceSignal(
      this.searchTerm,
      value => {
        this.search.emit(value);
      },
      300
    );

    this.destroyRef.onDestroy(() => this.destroyDebounce());
  }
}
