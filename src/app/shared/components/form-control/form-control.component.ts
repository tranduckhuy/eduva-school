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
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  strongPasswordValidator,
  matchPasswordValidator,
  minWordCountValidator,
} from '../../utils/form-validators';
import { VIETNAM_PHONE_REGEX } from '../../constants/common.constant';

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

  resetControl(value = '') {
    this.control.reset(value, {
      emitEvent: false,
    });
    this.control.markAsPristine();
    this.control.markAsUntouched();
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  private buildValidators() {
    const validators: ValidatorFn[] = [];

    const {
      required,
      phone,
      pattern,
      email,
      min,
      max,
      maxLength,
      minLength,
      minWords,
      validatePassword,
      confirmPassword,
    } = {
      required: this.required(),
      phone: this.phone(),
      pattern: this.pattern(),
      email: this.email(),
      min: this.min(),
      max: this.max(),
      maxLength: this.maxLength(),
      minLength: this.minLength(),
      minWords: this.minWords(),
      validatePassword: this.validatePassword(),
      confirmPassword: this.confirmPassword(),
    };

    const pushIf = (condition: boolean, validator: ValidatorFn) => {
      if (condition) validators.push(validator);
    };

    pushIf(required, Validators.required);
    pushIf(phone, Validators.pattern(VIETNAM_PHONE_REGEX));
    pushIf(!phone && !!pattern, Validators.pattern(pattern!));
    pushIf(email, Validators.email);
    pushIf(minWords > 0, (c: AbstractControl) =>
      minWordCountValidator(c, minWords)
    );
    pushIf(min !== 0, Validators.min(min));
    pushIf(max !== 0, Validators.max(max));
    pushIf(!!maxLength, Validators.maxLength(maxLength));
    pushIf(!!minLength, Validators.minLength(minLength));
    pushIf(validatePassword, strongPasswordValidator);
    pushIf(confirmPassword !== null, (c: AbstractControl) =>
      matchPasswordValidator(c, confirmPassword!)
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
