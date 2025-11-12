-- Add ativo column to usuarios table
ALTER TABLE `usuarios` ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true;
