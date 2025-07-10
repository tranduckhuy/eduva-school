interface FileStorageMetadata {
  blobName: string;
  fileSize: number;
}

export interface FileStorageRequest {
  files: FileStorageMetadata[];
}
