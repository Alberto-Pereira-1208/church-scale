import { Escala, Voluntario, Ministerio, RegistroPresenca, RegistroExclusao } from './db';

export interface DadosCompartilhamento {
  escala: Escala;
  voluntario?: Voluntario;
  ministerio?: Ministerio;
}

/**
 * Gera um texto formatado com as informações da escala
 */
export const gerarTextoEscala = (dados: DadosCompartilhamento): string => {
  const { escala, voluntario, ministerio } = dados;
  
  const linhas: string[] = [
    '⛪ ESCALA DE SERVIÇO',
    '═══════════════════════════════════',
    '',
    `📅 ${formatarData(escala.data, escala.horario)}`,
    `👤 Voluntário: ${voluntario?.nome || 'N/A'}`,
    `🏛️ Ministério: ${ministerio?.nome || 'N/A'}`,
    `🎯 Função: ${escala.funcao}`,
    `🎪 Evento: ${escala.evento}`,
  ];

  if (escala.oQueLevar) {
    linhas.push(`📦 O que levar: ${escala.oQueLevar}`);
  }

  if (escala.observacoes) {
    linhas.push(`📝 Observações: ${escala.observacoes}`);
  }

  linhas.push('');
  linhas.push('═══════════════════════════════════');
  linhas.push('Compartilhado via Church Scale');

  return linhas.join('\n');
};

/**
 * Copia o texto da escala para o clipboard
 */
export const copiarParaClipboard = async (texto: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (erro) {
    console.error('Erro ao copiar para clipboard:', erro);
    return false;
  }
};

/**
 * Gera URL para compartilhar via WhatsApp
 */
export const gerarURLWhatsApp = (texto: string): string => {
  const textoEncodado = encodeURIComponent(texto);
  return `https://wa.me/?text=${textoEncodado}`;
};

/**
 * Gera URL para compartilhar via Email
 */
export const gerarURLEmail = (texto: string, assunto: string = 'Escala de Serviço'): string => {
  const assuntoEncodado = encodeURIComponent(assunto);
  const textoEncodado = encodeURIComponent(texto);
  return `mailto:?subject=${assuntoEncodado}&body=${textoEncodado}`;
};

/**
 * Gera URL para compartilhar via SMS
 */
export const gerarURLSMS = (texto: string): string => {
  const textoEncodado = encodeURIComponent(texto);
  return `sms:?body=${textoEncodado}`;
};

/**
 * Verifica se a API de compartilhamento nativa está disponível
 */
export const temCompartilhamentoNativo = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};

/**
 * Compartilha usando a API nativa do navegador (se disponível)
 */
export const compartilharNativo = async (
  texto: string,
  titulo: string = 'Escala de Serviço'
): Promise<boolean> => {
  if (!temCompartilhamentoNativo()) {
    return false;
  }

  try {
    await navigator.share({
      title: titulo,
      text: texto,
    });
    return true;
  } catch (erro) {
    console.error('Erro ao compartilhar:', erro);
    return false;
  }
};

/**
 * Função auxiliar para formatar data
 */
const formatarData = (dataISO: string, horario: string): string => {
  const data = new Date(dataISO + 'T00:00:00');
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diaSemana = dias[data.getDay()];
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  
  return `${diaSemana}, ${dia}/${mes} às ${horario}`;
};

export interface DadosRelatorioPresenca {
  voluntarioNome: string;
  ministerioNome: string;
  mesAno: string; // YYYY-MM
  total: number;
  presencas: number;
  presentesPontuais?: number;
  presentesAtrasados?: number;
  faltas: number;
  justificados?: number;
  trocados?: number;
  percentualPresenca: number;
  percentualPontualidade?: number;
  registros: Array<{
    dataEscala: string;
    horarioEscala: string;
    horarioIdeal?: string;
    status: 'Presente' | 'Falta' | 'Justificado' | 'Trocado';
    subStatus?: 'Pontual' | 'Atrasado';
    horaCheckIn?: string;
    diferencaMinutos?: number;
    evento: string;
  }>;
  exclusoes?: Array<{
    dataEscala: string;
    horarioEscala: string;
    evento: string;
    motivo: string;
    descricao?: string;
    nomeServoTroca?: string;
    deletadoEm: string;
  }>;
}

/**
 * Gera um texto formatado com o relatório de presença
 */
export const gerarTextoRelatorioPresenca = (dados: DadosRelatorioPresenca): string => {
  const mesAnoFormatado = new Date(dados.mesAno + '-01').toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const linhas: string[] = [
    '⛪ RELATÓRIO DE PRESENÇA',
    '═══════════════════════════════════════════════════════',
    '',
    `👤 Voluntário: ${dados.voluntarioNome}`,
    `🏛️ Ministério: ${dados.ministerioNome}`,
    `📅 Período: ${mesAnoFormatado}`,
    '',
    '📊 RESUMO MENSAL',
    '───────────────────────────────────────────────────────',
    `Total de Escalas: ${dados.total}`,
    `✅ Presenças: ${dados.presencas}`,
    `❌ Faltas: ${dados.faltas}`,
    `📈 Taxa de Presença: ${dados.percentualPresenca}%`,
    '',
    '📋 DETALHES POR ESCALA',
    '───────────────────────────────────────────────────────',
  ];

  dados.registros.forEach((registro, index) => {
    const dataFormatada = new Date(registro.dataEscala + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });

    const statusEmoji = registro.status === 'Presente' ? '✅' : '❌';
    const statusTexto = registro.status === 'Presente' ? 'Presente' : 'Falta';

    linhas.push(`${index + 1}. ${dataFormatada} ${registro.horarioEscala} - ${statusEmoji} ${statusTexto}`);
    linhas.push(`   🎪 ${registro.evento}`);

    if (registro.status === 'Presente' && registro.horaCheckIn) {
      linhas.push(`   🕐 Check-in: ${registro.horaCheckIn}`);
    }

    linhas.push('');
  });

  // Seção de exclusões
  if (dados.exclusoes && dados.exclusoes.length > 0) {
    linhas.push('🗑️ ESCALAS EXCLUÍDAS');
    linhas.push('───────────────────────────────────────────────────────');
    
    const MOTIVOS_LABELS: Record<string, string> = {
      cancelamento: '🚫 Cancelamento do Evento',
      troca: '🔄 Troca de Escala',
      erro: '⚠️ Erro no Cadastro',
      pessoal: '👤 Motivo Pessoal',
      outro: '❓ Outro',
    };

    dados.exclusoes.forEach((exclusao, index) => {
      const dataFormatada = new Date(exclusao.dataEscala + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      linhas.push(`${index + 1}. ${dataFormatada} ${exclusao.horarioEscala} - ${MOTIVOS_LABELS[exclusao.motivo] || exclusao.motivo}`);
      linhas.push(`   🎪 ${exclusao.evento}`);
      
      if (exclusao.nomeServoTroca) {
        linhas.push(`   👤 Trocou com: ${exclusao.nomeServoTroca}`);
      }
      
      if (exclusao.descricao) {
        linhas.push(`   📝 ${exclusao.descricao}`);
      }
      
      linhas.push('');
    });
  }

  linhas.push('═══════════════════════════════════════════════════════');
  linhas.push('Compartilhado via Church Scale');

  return linhas.join('\n');
};

/**
 * Gera um texto formatado com relatório geral de presença
 */
export const gerarTextoRelatorioGeralPresenca = (
  registros: Array<{
    dataEscala: string;
    horarioEscala: string;
    voluntarioNome: string;
    ministerioNome: string;
    status: 'Presente' | 'Falta';
    horaCheckIn?: string;
    evento: string;
  }>,
  mesAno?: string
): string => {
  const mesAnoFormatado = mesAno
    ? new Date(mesAno + '-01').toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });

  const total = registros.length;
  const presencas = registros.filter(r => r.status === 'Presente').length;
  const faltas = registros.filter(r => r.status === 'Falta').length;
  const percentualPresenca = total > 0 ? Math.round((presencas / total) * 100) : 0;

  const linhas: string[] = [
    '⛪ RELATÓRIO GERAL DE PRESENÇA',
    '═══════════════════════════════════════════════════════',
    '',
    `📅 Período: ${mesAnoFormatado}`,
    '',
    '📊 RESUMO GERAL',
    '───────────────────────────────────────────────────────',
    `Total de Escalas: ${total}`,
    `✅ Presenças: ${presencas}`,
    `❌ Faltas: ${faltas}`,
    `📈 Taxa de Presença: ${percentualPresenca}%`,
    '',
    '📋 DETALHES POR ESCALA',
    '───────────────────────────────────────────────────────',
  ];

  registros.forEach((registro, index) => {
    const dataFormatada = new Date(registro.dataEscala + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });

    const statusEmoji = registro.status === 'Presente' ? '✅' : '❌';
    const statusTexto = registro.status === 'Presente' ? 'Presente' : 'Falta';

    linhas.push(
      `${index + 1}. ${dataFormatada} ${registro.horarioEscala} - ${statusEmoji} ${statusTexto}`
    );
    linhas.push(`   👤 ${registro.voluntarioNome}`);
    linhas.push(`   🏛️ ${registro.ministerioNome}`);
    linhas.push(`   🎪 ${registro.evento}`);

    if (registro.status === 'Presente' && registro.horaCheckIn) {
      linhas.push(`   🕐 Check-in: ${registro.horaCheckIn}`);
    }

    linhas.push('');
  });

  linhas.push('═══════════════════════════════════════════════════════');
  linhas.push('Compartilhado via Church Scale');

  return linhas.join('\n');
};

/**
 * Gera um texto formatado com todas as escalas agrupadas por data
 */
export const gerarTextoTodasEscalas = (
  escalas: Escala[],
  voluntarios: Voluntario[],
  ministerios: Ministerio[]
): string => {
  const linhas: string[] = [
    '⛪ TODAS AS ESCALAS DE SERVIÇO',
    '═══════════════════════════════════════════════════════',
    '',
  ];

  // Agrupar escalas por data
  const escalasAgrupadas: Record<string, typeof escalas> = {};
  escalas.forEach(escala => {
    if (!escalasAgrupadas[escala.data]) {
      escalasAgrupadas[escala.data] = [];
    }
    escalasAgrupadas[escala.data].push(escala);
  });

  // Ordenar datas
  const datasOrdenadas = Object.keys(escalasAgrupadas).sort();

  datasOrdenadas.forEach(data => {
    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    linhas.push(`📅 ${dataFormatada.toUpperCase()}`);
    linhas.push('───────────────────────────────────────────────────────');

    escalasAgrupadas[data].forEach((escala, index) => {
      const voluntario = voluntarios.find(v => v.id === escala.voluntarioId);
      const ministerio = ministerios.find(m => m.id === escala.ministerioId);

      linhas.push(`${index + 1}. ${escala.horario} - ${escala.funcao}`);
      linhas.push(`   👤 ${voluntario?.nome || 'N/A'}`);
      linhas.push(`   🏛️ ${ministerio?.nome || 'N/A'}`);
      linhas.push(`   🎪 ${escala.evento}`);

      if (escala.oQueLevar) {
        linhas.push(`   📦 ${escala.oQueLevar}`);
      }

      if (escala.observacoes) {
        linhas.push(`   📝 ${escala.observacoes}`);
      }

      linhas.push('');
    });
  });

  linhas.push('═══════════════════════════════════════════════════════');
  linhas.push('Compartilhado via Church Scale');

  return linhas.join('\n');
};
