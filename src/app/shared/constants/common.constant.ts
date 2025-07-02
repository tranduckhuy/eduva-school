// File Constants
export const MAX_IMPORT_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_UPLOAD_FILE_SIZE = 200 * 1024 * 1024; // 200MB
export const MAX_TOTAL_UPLOAD_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_IMPORT_EXTENSIONS = ['xlsx', 'xls', 'csv'];
export const ALLOWED_UPLOAD_MIME_TYPES = [
  'video/',
  'audio/',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const BASE_BG_CLASS_IMAGE_URL =
  'https://egverimjijiaqduqcfur.supabase.co/storage/v1/object/public/classroom-images//back_to_school.jpg';

// Table Constants
export const PAGE_SIZE = 12;
