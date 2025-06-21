// Updated FormControlComponent using @signal input() and output() APIs
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  signal,
  input,
  output,
  computed,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  strongPasswordValidator,
  matchPasswordValidator,
  minWordCountValidator,
} from '../../utils/form-validators';

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
export class FormControlComponent
  implements OnInit, OnChanges, ControlValueAccessor
{
  control = new FormControl('');

  name = input<string>('');
  type = input<string>('text');
  label = input<string>('');
  readOnly = input<boolean>(false);
  isTextarea = input<boolean>(false);
  rows = input<number>(3);
  redirectLink = input<{ value: string; href: string }>({
    value: '',
    href: '#!',
  });
  placeholder = input<string>('');
  options = input<Array<{ label: string; value: string }>>([]);
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
  submitted = input<boolean>(false);
  value = input<string>('');

  valueChange = output<string>();
  blur = output<void>();

  isShowPassword = signal(false);
  searchTerm = signal('');

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.options().filter(opt => opt.label.toLowerCase().includes(term));
  });

  get showSearchBox() {
    return this.options().length > 7;
  }

  get inputType(): string {
    const type = this.type();

    if (type === 'password') {
      return this.isShowPassword() ? 'text' : 'password';
    }

    return type;
  }

  get errorMessage(): string | null {
    const errors = this.control?.errors;
    if (errors && (this.control.touched || this.submitted())) {
      const firstKey = Object.keys(errors)[0];
      return (
        this.errorMessages()[firstKey] || this.getDefaultErrorMessage(firstKey)
      );
    }
    return null;
  }

  ngOnInit(): void {
    const validators = this.buildValidators();
    this.control.setValidators(validators);
    this.control.setValue(this.value(), { emitEvent: false });
    this.control.valueChanges.subscribe(val => {
      this.valueChange.emit(val!);
      this.onChange(val);
      this.onTouched();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !this.control.dirty) {
      this.control.setValue(this.value(), { emitEvent: false });
    }
  }

  writeValue(value: any): void {
    this.control.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  handleTouched(): void {
    this.control.markAsTouched();
    this.onTouched();
    this.blur.emit();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.searchTerm.set(value);
  }

  toggleShowPassword(): void {
    this.isShowPassword.set(!this.isShowPassword());
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  private buildValidators() {
    const validators = [];
    if (this.required()) validators.push(Validators.required);
    if (this.phone()) validators.push(Validators.pattern(/^0\d{9,10}$/));
    else if (this.pattern())
      validators.push(Validators.pattern(this.pattern()!));
    if (this.email()) validators.push(Validators.email);
    if (this.minWords() > 0)
      validators.push((c: AbstractControl) =>
        minWordCountValidator(c, this.minWords())
      );
    if (this.min() !== 0) validators.push(Validators.min(this.min()));
    if (this.max() !== 0) validators.push(Validators.max(this.max()));
    if (this.maxLength())
      validators.push(Validators.maxLength(this.maxLength()));
    if (this.minLength())
      validators.push(Validators.minLength(this.minLength()));
    if (this.validatePassword()) validators.push(strongPasswordValidator);
    if (this.confirmPassword() !== null)
      validators.push((c: AbstractControl) =>
        matchPasswordValidator(c, this.confirmPassword()!)
      );
    return validators;
  }

  private getDefaultErrorMessage(key: string): string {
    const defaults: { [key: string]: string } = {
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
    return defaults[key] || 'Giá trị không hợp lệ';
  }
}
