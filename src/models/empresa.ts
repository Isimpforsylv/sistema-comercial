export interface GrupoEmpresa {
  id: number;
  nomegrupo: string;
}

export interface Empresa {
  id: number;
  idgrupo: number | null;
  nomeempresa: string;
  codigoempresa: string;
  cliente: boolean;
  tipo?: string | null;
  criadopor: string;
  criadoem: Date;
  atualizadoem: Date;
  grupo?: GrupoEmpresa | null;
}

export interface CreateEmpresaInput {
  idgrupo?: number | null;
  nomeempresa: string;
  codigoempresa: string;
  cliente: boolean;
  tipo?: string[];
  criadopor: string;
}
