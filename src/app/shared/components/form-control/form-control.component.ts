import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  signal,
  computed,
  forwardRef,
} from '@angular/core';
import {
  FormControl,
  AbstractControl,
  ReactiveFormsModule,
  ControlValueAccessor,
  Validators,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';

import {
  strongPasswordValidator,
  matchPasswordValidator,
  minWordCountValidator,
} from '../../utils/form-validators';
import { RouterLink } from '@angular/router';
import { NgForOf, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-control',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgForOf, NgIf],
  templateUrl: './form-control.component.html',
  styleUrl: './form-control.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlComponent),
      multi: true,
    },
  ],
})
export class FormControlComponent implements OnInit, ControlValueAccessor {
  // ? Form Control
  control = new FormControl('');

  // ? Input Tag Properties
  name = input<string>('');
  type = input<string>('text');
  label = input<string>('');
  value = input<string>('');
  readOnly = input<boolean>(false);
  isTextarea = input<boolean>(false);
  rows = input<number>(3); // Thêm số dòng mặc định cho textarea
  redirectLink = input<{ value: string; href: string }>({
    value: '',
    href: '#!',
  });
  placeholder = input<string>('');
  options = input<Array<{ label: string; value: string }>>([]); // Thêm input options

  // Custom select search state
  searchTerm = signal<string>('');
  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.options().filter(opt => opt.label.toLowerCase().includes(term));
  });

  // Optional: only show search box if options.length > 7
  get showSearchBox() {
    return this.options().length > 7;
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.searchTerm.set(value);
  }

  // ? Validators
  maxLength = input<number>(50);
  minLength = input<number>(0);
  max = input<number>(0);
  min = input<number>(0);
  minWords = input<number>(0);
  email = input<boolean>(false);
  phone = input<boolean>(false);
  required = input<boolean>(false);
  pattern = input<string | RegExp | null>(null);
  errorMessages = input<{ [key: string]: string }>({});
  validatePassword = input<boolean>(false);
  confirmPassword = input<string | null>(null);

  // ? State Management
  isShowPassword = signal<boolean>(false);
  readonly inputType = computed(() =>
    this.type() === 'password'
      ? this.isShowPassword()
        ? 'text'
        : 'password'
      : this.type()
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ? Submitted state from parent component
  submitted = input<boolean>(false);

  ngOnInit(): void {
    const validators = this.buildValidators();
    this.control.setValidators(validators);

    this.control.valueChanges.subscribe(value => {
      this.onChange(value ?? '');
      this.onTouched();
    });
  }

  get errorMessage(): string | null {
    const errors = this.control.errors;
    if (
      errors &&
      (this.control.dirty || this.control.touched || this.submitted())
    ) {
      const firstErrorKey = Object.keys(errors)[0];
      return (
        this.errorMessages()[firstErrorKey] ||
        this.getDefaultErrorMessage(firstErrorKey)
      );
    }
    return null;
  }

  toggleShowPassword(): void {
    this.isShowPassword.set(!this.isShowPassword());
  }

  writeValue(value: string): void {
    this.control.setValue(value ?? '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  handleTouched(): void {
    this.control.markAsTouched();
    this.onTouched();
  }
  private buildValidators() {
    const validators: Array<
      (control: AbstractControl) => ValidationErrors | null
    > = [];

    // Skip validation for textarea
    if (this.isTextarea()) {
      return validators;
    }

    // ? Required
    if (this.required()) validators.push(Validators.required);
    // ? Match Phone Number (Vietnam)
    if (this.phone()) {
      // Vietnamese phone: starts with 0, 10 or 11 digits total
      validators.push(Validators.pattern(/^0\d{9,10}$/));
    } else if (this.pattern()) {
      // ? Match Pattern
      validators.push(Validators.pattern(this.pattern()!));
    }
    // ? Match Email Format
    if (this.email()) validators.push(Validators.email);
    // ? Match Min Word Count
    if (this.minWords() > 0)
      validators.push((ctrl: AbstractControl) =>
        minWordCountValidator(ctrl, this.minWords())
      );
    // ? Match Min Value
    if (this.min() !== 0) validators.push(Validators.min(this.min()));
    // ? Match Max Value
    if (this.max() !== 0) validators.push(Validators.max(this.max()));
    // ? Match Max Length
    if (this.maxLength())
      validators.push(Validators.maxLength(this.maxLength()));
    // ? Match Min Length
    if (this.minLength())
      validators.push(Validators.minLength(this.minLength()));
    // ? Match Password Standard
    if (this.validatePassword()) validators.push(strongPasswordValidator);
    // ? Confirm Password Value Match Password Value
    if (this.confirmPassword() !== null)
      validators.push((ctrl: AbstractControl) =>
        matchPasswordValidator(ctrl, this.confirmPassword()!)
      );

    return validators;
  }

  private getDefaultErrorMessage(error: string): string {
    const defaultMessages: { [key: string]: string } = {
      required: 'Trường này không được để trống',
      pattern: 'Định dạng không hợp lệ',
      maxlength: `Tối đa chỉ được phép nhập ${this.maxLength()} ký tự`,
      minlength: `Cần có ít nhất ${this.minLength()} ký tự`,
      email: 'Email không hợp lệ',
      minWords: `Cần có ít nhất ${this.minWords()} từ`,
      min: `Giá trị không được nhỏ hơn ${this.min()}`,
      max: `Giá trị không được lớn hơn ${this.max()}`,
      passTooShort: 'Mật khẩu phải có ít nhất 8 ký tự',
      passTooLong: 'Mật khẩu không được vượt quá 18 ký tự',
      missingLowercase: 'Mật khẩu cần ít nhất một chữ cái thường (a-z)',
      missingUppercase: 'Mật khẩu cần ít nhất một chữ cái in hoa (A-Z)',
      missingNumber: 'Mật khẩu cần ít nhất một chữ số (0-9)',
      missingSpecialChar:
        'Mật khẩu cần ít nhất một ký tự đặc biệt (ví dụ: !@#$%)',

      passMismatch: 'Mật khẩu xác nhận không khớp',
    };

    return defaultMessages[error] ?? 'Giá trị không hợp lệ';
  }
}
