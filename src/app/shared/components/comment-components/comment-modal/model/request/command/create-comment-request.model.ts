export interface CreateCommentRequest {
  questionId: string;
  content: string;
  parentCommentId?: string;
}
