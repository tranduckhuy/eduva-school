import { CanDeactivateFn } from '@angular/router';

export interface CanDeactivateComponent {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanDeactivateComponent> = (
  component: CanDeactivateComponent
) => {
  // ✅ Usage:
  // - Apply [canDeactivate: [unsavedChangesGuard]] to the route that contains a form component.
  // - The component must implement the "CanDeactivateComponent" interface.
  //
  // ✅ Requirements:
  // - Implement the method "hasUnsavedChanges(): boolean" in the component.
  // - Return true if the form has unsaved changes (e.g., is dirty or invalid).
  //
  // ✅ Behavior:
  // - If there are unsaved changes, a confirmation dialog will appear before leaving the page.
  // - If there are no changes, navigation proceeds normally.

  if (component.hasUnsavedChanges()) {
    return confirm(
      'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này?'
    );
  }

  return true;
};
