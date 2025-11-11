/**
 * Handler para fechar modais com botões (Cancelar/X) ou ESC
 * Bloqueia APENAS fechar ao clicar fora (backdrop)
 * @param onClose Função de callback para fechar o modal
 * @returns Handler configurado
 * 
 * @example
 * <Dialog onClose={createModalCloseHandler(onClose)} open={open}>
 */
export const createModalCloseHandler = (onClose: () => void) => {
  return (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    // Bloqueia APENAS clicar fora (backdrop)
    if (reason === 'backdropClick') {
      return;
    }
    onClose();
  };
};
