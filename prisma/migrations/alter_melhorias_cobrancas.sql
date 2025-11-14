-- Atualizar estrutura da tabela melhorias_cobrancas para ficar igual a checklist_cobrancas
ALTER TABLE melhorias_cobrancas
MODIFY COLUMN datacobranca DATETIME NOT NULL,
MODIFY COLUMN quandofcobrado DATETIME NOT NULL,
MODIFY COLUMN proximacobranca DATETIME NOT NULL,
MODIFY COLUMN criadopor VARCHAR(255) DEFAULT 'Sistema',
ADD COLUMN atualizadopor VARCHAR(255) DEFAULT 'Sistema' AFTER criadopor,
ADD COLUMN atualizadoem DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER criadoem;
