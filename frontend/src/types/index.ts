export interface User {
  id: number;
  username: string;
  email: string;
  homePage?: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  type: 'image' | 'text';
}

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: User;
  userId: number;
  parentId: number | null;
  children: Comment[];
  attachment?: Attachment;
}

export interface PaginatedResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CaptchaResponse {
  id: string;
  svg: string;
}

export type SortBy = 'username' | 'email' | 'createdAt';
export type SortOrder = 'ASC' | 'DESC';
