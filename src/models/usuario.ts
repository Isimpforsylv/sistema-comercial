export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  admin: boolean;
  criadoem: Date;
  atualizadoem: Date;
}

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    admin: boolean;
  };
}
