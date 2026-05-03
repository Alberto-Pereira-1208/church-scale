/**
 * Interface para justificativa de falta
 */
export interface Justificativa {
  id?: number;
  registroPresencaId: number;
  escalaId: number;
  voluntarioId: number;
  motivo: string;
  descricao: string;
  status: 'pendente' | 'aceita' | 'rejeitada';
  evidencia?: string; // URL ou caminho do arquivo
  criadoEm: number;
  analisadoEm?: number;
  analisadoPor?: string; // Nome do responsável
  observacoes?: string;
}

/**
 * Motivos pré-definidos para falta
 */
export const MOTIVOS_FALTA = [
  { id: 'doenca', label: 'Doença', descricao: 'Estava doente no dia da escala' },
  { id: 'emergencia', label: 'Emergência Familiar', descricao: 'Situação emergencial na família' },
  { id: 'trabalho', label: 'Compromisso de Trabalho', descricao: 'Compromisso profissional imprevisto' },
  { id: 'viagem', label: 'Viagem', descricao: 'Viagem não planejada' },
  { id: 'transporte', label: 'Problema de Transporte', descricao: 'Dificuldade para chegar ao local' },
  { id: 'outro', label: 'Outro', descricao: 'Outro motivo' },
];

/**
 * Cria uma justificativa de falta
 */
export const criarJustificativa = (
  registroPresencaId: number,
  escalaId: number,
  voluntarioId: number,
  motivo: string,
  descricao: string,
  evidencia?: string
): Justificativa => {
  return {
    registroPresencaId,
    escalaId,
    voluntarioId,
    motivo,
    descricao,
    status: 'pendente',
    evidencia,
    criadoEm: Date.now(),
  };
};

/**
 * Valida justificativa antes de salvar
 */
export const validarJustificativa = (justificativa: Justificativa): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];

  if (!justificativa.motivo || justificativa.motivo.trim() === '') {
    erros.push('Motivo é obrigatório');
  }

  if (!justificativa.descricao || justificativa.descricao.trim() === '') {
    erros.push('Descrição é obrigatória');
  }

  if (justificativa.descricao && justificativa.descricao.length < 10) {
    erros.push('Descrição deve ter no mínimo 10 caracteres');
  }

  if (justificativa.descricao && justificativa.descricao.length > 500) {
    erros.push('Descrição não pode exceder 500 caracteres');
  }

  return {
    valido: erros.length === 0,
    erros,
  };
};

/**
 * Formata justificativa para exibição
 */
export const formatarJustificativa = (justificativa: Justificativa): string => {
  const motivo = MOTIVOS_FALTA.find(m => m.id === justificativa.motivo);
  const statusEmoji = {
    pendente: '⏳',
    aceita: '✅',
    rejeitada: '❌',
  };

  const linhas = [
    `${statusEmoji[justificativa.status]} Status: ${justificativa.status.toUpperCase()}`,
    `📋 Motivo: ${motivo?.label || justificativa.motivo}`,
    `📝 Descrição: ${justificativa.descricao}`,
  ];

  if (justificativa.analisadoEm && justificativa.analisadoPor) {
    const dataAnalise = new Date(justificativa.analisadoEm).toLocaleDateString('pt-BR');
    linhas.push(`✍️ Analisado por: ${justificativa.analisadoPor} em ${dataAnalise}`);
  }

  if (justificativa.observacoes) {
    linhas.push(`📌 Observações: ${justificativa.observacoes}`);
  }

  return linhas.join('\n');
};

/**
 * Gera texto para relatório de justificativas
 */
export const gerarTextoRelatorioJustificativas = (
  justificativas: Justificativa[],
  voluntarioNome: string
): string => {
  const pendentes = justificativas.filter(j => j.status === 'pendente').length;
  const aceitas = justificativas.filter(j => j.status === 'aceita').length;
  const rejeitadas = justificativas.filter(j => j.status === 'rejeitada').length;

  const linhas = [
    '⛪ RELATÓRIO DE JUSTIFICATIVAS',
    '═══════════════════════════════════════════════════════',
    '',
    `👤 Voluntário: ${voluntarioNome}`,
    `📅 Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
    '',
    '📊 RESUMO',
    '───────────────────────────────────────────────────────',
    `Total de Justificativas: ${justificativas.length}`,
    `⏳ Pendentes: ${pendentes}`,
    `✅ Aceitas: ${aceitas}`,
    `❌ Rejeitadas: ${rejeitadas}`,
    '',
    '📋 DETALHES',
    '───────────────────────────────────────────────────────',
  ];

  justificativas.forEach((just, index) => {
    const motivo = MOTIVOS_FALTA.find(m => m.id === just.motivo);
    const statusEmoji = {
      pendente: '⏳',
      aceita: '✅',
      rejeitada: '❌',
    };

    linhas.push(`${index + 1}. ${statusEmoji[just.status]} ${motivo?.label || just.motivo}`);
    linhas.push(`   📝 ${just.descricao}`);

    if (just.analisadoEm && just.analisadoPor) {
      const dataAnalise = new Date(just.analisadoEm).toLocaleDateString('pt-BR');
      linhas.push(`   ✍️ Analisado por ${just.analisadoPor} em ${dataAnalise}`);
    }

    if (just.observacoes) {
      linhas.push(`   📌 ${just.observacoes}`);
    }

    linhas.push('');
  });

  linhas.push('═══════════════════════════════════════════════════════');
  linhas.push('Compartilhado via Church Scale');

  return linhas.join('\n');
};

/**
 * Calcula estatísticas de justificativas
 */
export const calcularEstatisticasJustificativas = (justificativas: Justificativa[]): {
  total: number;
  pendentes: number;
  aceitas: number;
  rejeitadas: number;
  percentualAceitas: number;
} => {
  const total = justificativas.length;
  const pendentes = justificativas.filter(j => j.status === 'pendente').length;
  const aceitas = justificativas.filter(j => j.status === 'aceita').length;
  const rejeitadas = justificativas.filter(j => j.status === 'rejeitada').length;
  const percentualAceitas = total > 0 ? Math.round((aceitas / total) * 100) : 0;

  return {
    total,
    pendentes,
    aceitas,
    rejeitadas,
    percentualAceitas,
  };
};
