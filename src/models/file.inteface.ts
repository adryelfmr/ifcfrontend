export interface UploadResponse {
  message: string;
  url: string;
}

export interface GetAllResponse {
  message: string;
  files: { file_url: string; original_name: string; file_name: string }[];
}
