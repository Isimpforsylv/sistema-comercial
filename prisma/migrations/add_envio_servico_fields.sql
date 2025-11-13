-- Add envio fields to propostas_aceitas table
ALTER TABLE `propostas_aceitas` 
  ADD COLUMN `dataenvioproj` DATETIME NULL,
  ADD COLUMN `dataenviofinanceiro` DATETIME NULL,
  ADD COLUMN `finalizado` BOOLEAN NOT NULL DEFAULT FALSE;

-- Add final values fields to valorespropostas_aceitas table
ALTER TABLE `valorespropostas_aceitas`
  ADD COLUMN `valorfinal` VARCHAR(100) NULL,
  ADD COLUMN `prazofinal` VARCHAR(255) NULL,
  ADD COLUMN `formafinal` VARCHAR(255) NULL;
