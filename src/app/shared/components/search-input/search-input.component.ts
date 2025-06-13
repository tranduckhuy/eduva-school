import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit {
  placeholder = input<string>('Tìm kiếm...');
  initialSearchTerm = input<string>('');
  customClasses = input<string>('');
  search = output<string>();

  searchTerm = signal<string>('');

  ngOnInit() {
    this.searchTerm.set(this.initialSearchTerm());
  }

  onSearch(): void {
    this.search.emit(this.searchTerm());
  }
}
