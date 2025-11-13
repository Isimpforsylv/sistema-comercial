-- Add final values fields to recursosvalorespropostas_aceitas table
ALTER TABLE `recursosvalorespropostas_aceitas`
  ADD COLUMN `valorfinal` VARCHAR(100) NULL,
  ADD COLUMN `prazofinal` VARCHAR(255) NULL,
  ADD COLUMN `formafinal` VARCHAR(255) NULL;
