import { type QuestionNotification } from './question-notification.model';
import { type QuestionDeleteNotification } from './question-delete-notification.model';
import { type QuestionCommentNotification } from './question-comment-notification.model';
import { type QuestionCommentDeleteNotification } from './question-comment-delete-notification.model';

export interface NotificationPayloadMap {
  QuestionCreated: QuestionNotification;
  QuestionUpdated: QuestionNotification;
  QuestionDeleted: QuestionDeleteNotification;
  QuestionCommented: QuestionCommentNotification;
  QuestionCommentUpdated: QuestionCommentNotification;
  QuestionCommentDeleted: QuestionCommentDeleteNotification;
}
