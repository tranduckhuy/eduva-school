import { Injectable, Injector, Type, inject, signal } from '@angular/core';

import { MODAL_DATA } from './modal-data.token';

@Injectable({ providedIn: 'root' })
export class GlobalModalService {
  private readonly rootInjector = inject(Injector);

  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  private readonly _component = signal<Type<unknown> | null>(null);
  readonly component = this._component.asReadonly();

  private readonly _data = signal<unknown>(null);
  readonly data = this._data.asReadonly();

  private readonly _injector = signal<Injector | undefined>(undefined);
  readonly injector = this._injector.asReadonly();

  private readonly _modalClass = signal<string>('');
  readonly modalClass = this._modalClass.asReadonly();

  private lastComponent: Type<unknown> | null = null;
  private lastData: unknown = null;

  open<T, D = unknown>(component: Type<T>, data?: D, modalClass?: string) {
    this._component.set(component);
    this._data.set(data ?? null);
    this._modalClass.set(modalClass ?? '');
    this._isOpen.set(true);

    if (this.lastComponent !== component || this.lastData !== data) {
      this._injector.set(
        Injector.create({
          providers: [{ provide: MODAL_DATA, useValue: data }],
          parent: this.rootInjector,
        })
      );
      this.lastComponent = component;
      this.lastData = data;
    }
  }

  close() {
    this._isOpen.set(false);
    this._component.set(null);
    this._data.set(null);
    this._injector.set(undefined);
  }
}
