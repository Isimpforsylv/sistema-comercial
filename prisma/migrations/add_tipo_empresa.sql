-- Adicionar coluna tipo na tabela empresas
ALTER TABLE empresas ADD COLUMN tipo TEXT;

-- Atualizar empresas existentes com array vazio
UPDATE empresas SET tipo = '[]' WHERE tipo IS NULL;
