-- Criar tabela checklist_pendencias
CREATE TABLE checklist_pendencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idchecklist INT NOT NULL,
    descricao TEXT NOT NULL,
    impeditiva BOOLEAN DEFAULT FALSE,
    finalizada BOOLEAN DEFAULT FALSE,
    criadopor VARCHAR(255) DEFAULT 'Sistema',
    finalizadopor VARCHAR(255) NULL,
    criadoem DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizadoem DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idchecklist) REFERENCES checklist(id) ON DELETE CASCADE,
    INDEX(idchecklist)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
