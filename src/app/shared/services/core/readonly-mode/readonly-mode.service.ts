import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReadonlyModeService {
  // todo Readonly mode for user have extended 14 days can just "read (GET)" data from
  // todo server and can not "create (POST)" or "update (PUT & DELETE)" data
  // todo Can check "boolean" from UserProfile for this logic if Backend have that field in UserProfile

  private readonly _isReadonly = signal<boolean>(false);

  readonly isReadonly = computed(() => this._isReadonly());

  setReadonlyMode(value: boolean) {
    this._isReadonly.set(value);
  }
}
