import axios, { AxiosResponse } from 'axios';
import { UserInterface, LoginResponse, RegisterResponse } from '../models/user.interface';
import { UploadResponse, GetAllResponse } from '../models/file.inteface';

const instance = axios.create({
  baseURL: 'http://localhost:80/',
  timeout: 15000,
});

const responseBody = (response: AxiosResponse) => response.data;

const handleError = (error: any) => {
  if (error.response && error.response.data && error.response.data.message) {
    error.message = error.response.data.message;
  }
  return error;
};

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => handleError(error),
);

const requests = {
  get: (url: string) => instance.get(url).then(responseBody),
  post: (url: string, body: any) => instance.post(url, body).then(responseBody),
  put: (url: string, body: {}) => instance.put(url, body).then(responseBody),
  delete: (url: string) => instance.delete(url).then(responseBody),
};

export const User = {
  login: (user: UserInterface): Promise<LoginResponse> => requests.post('/auth/login', user),
  register: (user: UserInterface): Promise<RegisterResponse> => requests.post('/auth/register', user),
};

export const File = {
  upload: (file: FormData): Promise<UploadResponse> => requests.post('/file/upload', file),
  getall: (): Promise<GetAllResponse> => requests.get('/file/getall'),
  download: (name: string): Promise<Response> => requests.get(`/file/download:${name}`),
};
