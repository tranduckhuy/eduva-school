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
} from '@angular/forms';

import {
  strongPasswordValidator,
  matchPasswordValidator,
  minWordCountValidator,
} from '../../utils/form-validators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-control',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
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
  redirectLink = input<{ value: string; href: string }>({
    value: '',
    href: '#!',
  });
  placeholder = input<string>('');

  // ? Validators
  maxLength = input<number>(50);
  minLength = input<number>(0);
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
    this.type() === 'password' && !this.isShowPassword() ? 'password' : 'text'
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

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
    if (errors && (this.control.dirty || this.control.touched)) {
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
    const validators = [];

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
