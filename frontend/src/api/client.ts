import axios from 'axios';
import type { PaginatedResponse, CaptchaResponse, SortBy, SortOrder } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api';

const api = axios.create({ baseURL: API_URL });

export async function fetchComments(
  page = 1,
  sortBy: SortBy = 'createdAt',
  order: SortOrder = 'DESC',
): Promise<PaginatedResponse> {
  const { data } = await api.get<PaginatedResponse>('/comments', {
    params: { page, sortBy, order, limit: 25 },
  });
  return data;
}

export async function createComment(formData: FormData): Promise<void> {
  await api.post('/comments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function fetchCaptcha(): Promise<CaptchaResponse> {
  const { data } = await api.get<CaptchaResponse>('/captcha');
  return data;
}

export function getFileUrl(filePath: string): string {
  const base = API_URL.replace('/api', '');
  return `${base}${filePath}`;
}
