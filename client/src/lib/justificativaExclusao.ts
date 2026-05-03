import { db } from './db';
import { registrarLogAcao } from './db';

/**
 * Registra justificativa para uma exclusão de escala
 */
export const registrarJustificativaExclusao = async (
  registroExclusaoId: number,
  justificativa: string
): Promise<void> => {
  try {
    // Atualizar registro de exclusão com justificativa
    await db.registrosExclusao.update(registroExclusaoId, {
      justificativa,
    });

    // Registrar log de ação
    await registrarLogAcao(
      'EXCLUSAO_ESCALA',
      0, // voluntarioId genérico
      0, // escalaId genérico
      `Justificativa registrada para exclusão: ${justificativa.substring(0, 100)}...`
    );
  } catch (erro) {
    console.error('Erro ao registrar justificativa:', erro);
    throw erro;
  }
};

/**
 * Obtém justificativa de uma exclusão
 */
export const obterJustificativaExclusao = async (
  registroExclusaoId: number
): Promise<string | undefined> => {
  try {
    const registro = await db.registrosExclusao.get(registroExclusaoId);
    return registro?.justificativa;
  } catch (erro) {
    console.error('Erro ao obter justificativa:', erro);
    return undefined;
  }
};
