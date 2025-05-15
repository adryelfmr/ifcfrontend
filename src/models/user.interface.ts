export interface UserInterface {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  token?: string;
}

export interface LoginResponse {
  message: string;
  user: UserInterface;
}

export interface RegisterResponse {
  message: string;
  user: UserInterface;
}
