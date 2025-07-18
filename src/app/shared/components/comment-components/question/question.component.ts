import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { ImageModule } from 'primeng/image';

import { SubmenuDirective } from '../../../directives/submenu/submenu.directive';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';

import { UserService } from '../../../services/api/user/user.service';
import { QuestionService } from '../comment-modal/services/question.service';
import {
  type RenderBlock,
  ContentParserService,
} from '../../../services/layout/content-parse/content-parse.service';

import { type Question } from '../../../models/entities/question.model';

@Component({
  selector: 'comment-question',
  standalone: true,
  imports: [DatePipe, SubmenuDirective, SafeHtmlPipe, ImageModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly questionService = inject(QuestionService);
  private readonly contentParseService = inject(ContentParserService);

  question = input.required<Question | null>();

  editQuestion = output<Question | null>();
  deleteQuestion = output<void>();

  user = this.userService.currentUser;

  isOptionsOpen = signal<boolean>(false);
  contentBlocks = signal<RenderBlock[]>([]);

  ngOnInit() {
    const rawContent = this.question()?.content ?? '';
    this.contentParse(rawContent);
  }

  toggleFooterOptions() {
    this.isOptionsOpen.set(!this.isOptionsOpen());
  }

  closeFooterOptions() {
    this.isOptionsOpen.set(false);
  }

  onDeleteQuestion(questionId: string) {
    this.questionService.deleteQuestion(questionId).subscribe({
      next: () => this.deleteQuestion.emit(),
    });
  }

  private contentParse(content: string) {
    this.contentBlocks.set(
      this.contentParseService.convertHtmlToBlocks(content)
    );
  }
}
