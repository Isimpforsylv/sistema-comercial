-- Adicionar colunas faltantes na tabela melhorias_etapas
ALTER TABLE melhorias_etapas 
ADD COLUMN historicodataenvio TEXT,
ADD COLUMN historicodataretorno TEXT,
ADD COLUMN datafim DATE,
ADD COLUMN criadopor VARCHAR(255) DEFAULT 'Sistema',
ADD COLUMN atualizadopor VARCHAR(255) DEFAULT 'Sistema';
