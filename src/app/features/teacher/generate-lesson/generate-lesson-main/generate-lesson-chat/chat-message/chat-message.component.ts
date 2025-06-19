import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SafeHtmlPipe } from '../../../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'chat-message',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent {
  sender = input<'user' | 'system'>('user');
  content = input<string>('');
  isLoading = input<boolean>(false);
}
