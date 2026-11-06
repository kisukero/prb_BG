export interface LoginFormData {
  usuario: string;
  clave: string;
}

export interface LoginResponse {
  token: string;
  user: { id: number; userName: string; fullName: string };
}
