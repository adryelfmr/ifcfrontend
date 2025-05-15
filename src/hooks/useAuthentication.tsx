import axios from 'axios';
import { LoginResponse, UserInterface } from '../models/user.interface';
import { useAuthContext } from '../context/authContext';

const instance = axios.create({
  baseURL: 'http://localhost:80/auth',
  timeout: 15000,
});

const handleError = (error: any) => {
  if (error.response && error.response.data && error.response.data.message) {
    return Promise.reject(new Error(error.response.data.message));
  }
  return Promise.reject(error);
};

instance.interceptors.response.use(
  (response) => response,
  (error) => handleError(error),
);

export const loginAuth = async (user: UserInterface): Promise<LoginResponse | undefined> => {
  try {
    const response = await instance.post('/login', user);
    return response.data;
  } catch (error) {
    console.log(error);
    handleError(error);
  }
};
