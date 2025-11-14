-- Criar tabela de melhorias
CREATE TABLE melhorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idservico INT NOT NULL,
  status VARCHAR(50) DEFAULT 'em_andamento',
  criadoem DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizadoem DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idservico) REFERENCES servicospropostas_aceitas(id) ON DELETE CASCADE,
  INDEX idx_idservico (idservico)
);

-- Criar tabela de etapas de melhorias
CREATE TABLE melhorias_etapas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idmelhoria INT NOT NULL,
  nometapa VARCHAR(100) NOT NULL,
  finalizada BOOLEAN DEFAULT FALSE,
  dataenvio DATE,
  dataretorno DATE,
  cobrarem DATE,
  criadoem DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizadoem DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (idmelhoria) REFERENCES melhorias(id) ON DELETE CASCADE,
  INDEX idx_idmelhoria (idmelhoria)
);

-- Criar tabela de cobranças de melhorias
CREATE TABLE melhorias_cobrancas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idetapa INT NOT NULL,
  datacobranca DATE NOT NULL,
  quandofcobrado TEXT,
  proximacobranca DATE,
  observacao TEXT,
  criadopor VARCHAR(255),
  criadoem DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idetapa) REFERENCES melhorias_etapas(id) ON DELETE CASCADE,
  INDEX idx_idetapa (idetapa)
);

-- Criar tabela de observações de melhorias
CREATE TABLE melhorias_observacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idmelhoria INT NOT NULL,
  nometapa VARCHAR(100) NOT NULL,
  observacao TEXT NOT NULL,
  criadopor VARCHAR(255),
  criadoem DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idmelhoria) REFERENCES melhorias(id) ON DELETE CASCADE,
  INDEX idx_idmelhoria (idmelhoria)
);

-- Criar tabela de pendências de melhorias
CREATE TABLE melhorias_pendencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idmelhoria INT NOT NULL,
  descricao TEXT NOT NULL,
  impeditiva BOOLEAN DEFAULT FALSE,
  finalizada BOOLEAN DEFAULT FALSE,
  criadopor VARCHAR(255),
  finalizadopor VARCHAR(255),
  criadoem DATETIME DEFAULT CURRENT_TIMESTAMP,
  finalizadaem DATETIME,
  FOREIGN KEY (idmelhoria) REFERENCES melhorias(id) ON DELETE CASCADE,
  INDEX idx_idmelhoria (idmelhoria)
);
