export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  canUpdate: boolean;
  canDelete: boolean;
  parentCommentId: string;
}

export interface CommentEntity {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
  lastModifiedAt: string;
  createdByUserId: string;
  createdByName: string;
  createdByAvatar: string;
  createdByRole: string;
  canUpdate: boolean;
  canDelete: boolean;
  parentCommentId: string;
  replies: Reply[];
  replyCount: number;
}
