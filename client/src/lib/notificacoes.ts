import { toast } from 'sonner';

/**
 * Interface para notificação de falta
 */
export interface NotificacaoFalta {
  id?: number;
  voluntarioId: number;
  voluntarioNome: string;
  escalaId: number;
  dataEscala: string;
  horarioEscala: string;
  ministerio: string;
  funcao: string;
  evento: string;
  tipo: 'falta_automatica' | 'falta_manual' | 'justificada' | 'trocada';
  mensagem: string;
  lida: boolean;
  criadoEm: number;
}

/**
 * Gera notificação de falta automática
 */
export const gerarNotificacaoFalta = (
  voluntarioId: number,
  voluntarioNome: string,
  escalaId: number,
  dataEscala: string,
  horarioEscala: string,
  ministerio: string,
  funcao: string,
  evento: string,
  tipo: 'falta_automatica' | 'falta_manual' | 'justificada' | 'trocada' = 'falta_automatica'
): NotificacaoFalta => {
  const dataFormatada = new Date(dataEscala + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

  let mensagem = '';
  switch (tipo) {
    case 'falta_automatica':
      mensagem = `Falta registrada automaticamente para ${voluntarioNome} em ${dataFormatada} às ${horarioEscala} (${funcao})`;
      break;
    case 'falta_manual':
      mensagem = `Falta registrada manualmente para ${voluntarioNome} em ${dataFormatada} às ${horarioEscala} (${funcao})`;
      break;
    case 'justificada':
      mensagem = `Falta justificada para ${voluntarioNome} em ${dataFormatada} às ${horarioEscala} (${funcao})`;
      break;
    case 'trocada':
      mensagem = `Escala trocada para ${voluntarioNome} em ${dataFormatada} às ${horarioEscala} (${funcao})`;
      break;
  }

  return {
    voluntarioId,
    voluntarioNome,
    escalaId,
    dataEscala,
    horarioEscala,
    ministerio,
    funcao,
    evento,
    tipo,
    mensagem,
    lida: false,
    criadoEm: Date.now(),
  };
};

/**
 * Exibe notificação de falta no toast
 */
export const exibirNotificacaoFalta = (notificacao: NotificacaoFalta): void => {
  const emojiMap = {
    falta_automatica: '⚠️',
    falta_manual: '❌',
    justificada: '✅',
    trocada: '🔄',
  };

  const emoji = emojiMap[notificacao.tipo];
  toast.error(`${emoji} ${notificacao.mensagem}`);
};

/**
 * Exibe notificação de sucesso de check-in
 */
export const exibirNotificacaoCheckIn = (
  voluntarioNome: string,
  status: 'Pontual' | 'Atrasado',
  diferenca: number
): void => {
  const mensagem = status === 'Pontual'
    ? `✅ ${voluntarioNome} fez check-in com sucesso! Chegou ${Math.abs(diferenca)} minutos antecipado.`
    : `✅ ${voluntarioNome} fez check-in! Chegou ${diferenca} minutos atrasado.`;

  toast.success(mensagem);
};

/**
 * Exibe notificação de erro de validação
 */
export const exibirNotificacaoErroValidacao = (tipo: 'data' | 'horario' | 'localizacao'): void => {
  const mensagens = {
    data: '❌ O Check-In só pode ser realizado no dia da escala',
    horario: '⏰ Desculpe, o prazo de tolerância expirou. Registrado como falta.',
    localizacao: '📍 Você não está no raio permitido para check-in',
  };

  toast.error(mensagens[tipo]);
};

/**
 * Exibe notificação de justificativa aceita
 */
export const exibirNotificacaoJustificativaAceita = (voluntarioNome: string): void => {
  toast.success(`✅ Justificativa de ${voluntarioNome} aceita com sucesso!`);
};

/**
 * Exibe notificação de troca de escala
 */
export const exibirNotificacaoTrocaEscala = (
  voluntario1: string,
  voluntario2: string,
  data: string
): void => {
  toast.success(`🔄 Escala trocada entre ${voluntario1} e ${voluntario2} em ${data}`);
};

/**
 * Exibe notificação de aviso
 */
export const exibirNotificacaoAviso = (mensagem: string): void => {
  toast.warning(`⚠️ ${mensagem}`);
};

/**
 * Exibe notificação de informação
 */
export const exibirNotificacaoInfo = (mensagem: string): void => {
  toast.info(`ℹ️ ${mensagem}`);
};
