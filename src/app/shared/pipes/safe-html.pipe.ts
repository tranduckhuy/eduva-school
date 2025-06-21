import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import DOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    const purified = DOMPurify.sanitize(value, {
      USE_PROFILES: { html: true },
    });
    return this.sanitizer.bypassSecurityTrustHtml(purified);
  }
}
