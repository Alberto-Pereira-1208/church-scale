import Dexie, { Table } from 'dexie';

// Tipos de dados
export interface Escala {
  id?: number;
  voluntarioId: number;
  ministerioId: number;
  funcao: string;
  evento: string;
  data: string; // ISO date string (YYYY-MM-DD)
  horario: string; // HH:mm format
  oQueLevar: string;
  observacoes?: string;
  concluida: boolean;
  pronto: boolean;
  checkInRealizado: boolean; // Novo campo para controlar Check-In obrigatório
  criadoEm: number; // timestamp
  atualizadoEm: number; // timestamp
}

export interface Voluntario {
  id?: number;
  nome: string;
  criadoEm: number;
}

export interface Ministerio {
  id?: number;
  nome: string;
  criadoEm: number;
}

export interface Notificacao {
  id?: number;
  escalaId: number;
  tipo: 'tres_dias' | 'um_dia' | 'manha' | 'uma_hora' | 'checkin_60min';
  enviada: boolean;
  dataEnvio?: number;
}

export interface CheckIn {
  id?: number;
  escalaId: number;
  latitude: number;
  longitude: number;
  distancia: number;
  dataHora: number;
  confirmado: boolean;
}

export interface RegistroPresenca {
  id?: number;
  escalaId: number;
  voluntarioId: number;
  ministerioId: number;
  funcao: string;
  evento: string;
  
  // Datas e horas
  dataEscala: string;           // ISO date (YYYY-MM-DD)
  horarioEscala: string;        // HH:mm (ex: 19:00)
  horarioIdeal: string;         // HH:mm (ex: 18:00 = 1h antes)
  
  // Check-in
  dataCheckIn?: string;         // ISO datetime (YYYY-MM-DDTHH:mm:ss)
  horaCheckIn?: string;         // HH:mm:ss
  
  // Status e classificação
  status: 'Presente' | 'Falta' | 'Justificado' | 'Trocado';
  subStatus?: 'Pontual' | 'Atrasado';
  
  // Diferença de horário
  diferencaMinutos?: number;    // Positivo = antecipado, Negativo = atrasado
  
  // Validações
  dataValida: boolean;          // Check-in no mesmo dia?
  horarioValido: boolean;       // Dentro da tolerância?
  
  // Auditoria
  criadoEm: number;             // Timestamp imutável
  motivoFalta?: string;         // Se justificado
  trocadoCom?: number;          // ID do voluntário trocado
}

export interface LogAcao {
  id?: number;
  tipo: 'CHECK_IN' | 'FALTA_AUTO' | 'JUSTIFICATIVA' | 'TROCA' | 'EXCLUSAO_ESCALA';
  voluntarioId: number;
  escalaId: number;
  descricao: string;
  dadosAntes?: Record<string, any>;
  dadosDepois?: Record<string, any>;
  criadoEm: number;
}

export interface Validacao {
  id?: number;
  escalaId: number;
  voluntarioId: number;
  dataEscala: string;
  horarioEscala: string;
  horarioIdeal: string;
  horarioTolerancia: string;    // Ideal + 25 minutos
  validacaoData: boolean;
  validacaoHorario: boolean;
  criadoEm: number;
}

// Definição do banco de dados
export class ChurchScaleDB extends Dexie {
  escalas!: Table<Escala>;
  voluntarios!: Table<Voluntario>;
  ministerios!: Table<Ministerio>;
  notificacoes!: Table<Notificacao>;
  checkIns!: Table<CheckIn>;
  historicoPresenca!: Table<RegistroPresenca>;
  logAcoes!: Table<LogAcao>;
  validacoes!: Table<Validacao>;
  registrosExclusao!: Table<RegistroExclusao>;

  constructor() {
    super('ChurchScaleDB');
    this.version(1).stores({
      escalas: '++id, data, concluida',
      voluntarios: '++id, nome',
      ministerios: '++id, nome',
      notificacoes: '++id, escalaId, tipo, enviada',
      checkIns: '++id, escalaId, dataHora',
    });
    this.version(2).stores({
      escalas: '++id, data, concluida',
      voluntarios: '++id, nome',
      ministerios: '++id, nome',
      notificacoes: '++id, escalaId, tipo, enviada',
      checkIns: '++id, escalaId, dataHora',
      historicoPresenca: '++id, escalaId, voluntarioId, dataEscala, status',
    });
    this.version(3).stores({
      escalas: '++id, data, concluida',
      voluntarios: '++id, nome',
      ministerios: '++id, nome',
      notificacoes: '++id, escalaId, tipo, enviada',
      checkIns: '++id, escalaId, dataHora',
      historicoPresenca: '++id, escalaId, voluntarioId, dataEscala, status, subStatus',
      logAcoes: '++id, tipo, voluntarioId, escalaId, criadoEm',
      validacoes: '++id, escalaId, voluntarioId, dataEscala',
    });
    this.version(4).stores({
      escalas: '++id, data, concluida',
      voluntarios: '++id, nome',
      ministerios: '++id, nome',
      notificacoes: '++id, escalaId, tipo, enviada',
      checkIns: '++id, escalaId, dataHora',
      historicoPresenca: '++id, escalaId, voluntarioId, dataEscala, status, subStatus',
      logAcoes: '++id, tipo, voluntarioId, escalaId, criadoEm',
      validacoes: '++id, escalaId, voluntarioId, dataEscala',
      registrosExclusao: '++id, escalaId, voluntarioId, ministerioId, dataEscala, deletadoEm',
    });
  }
}

// Instância global do banco de dados
export const db = new ChurchScaleDB();

// Funções auxiliares para datas
export const formatarData = (dataISO: string, horario: string): string => {
  const data = new Date(dataISO + 'T00:00:00');
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diaSemana = dias[data.getDay()];
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  
  return `${diaSemana}, ${dia}/${mes} às ${horario}`;
};

// Funções de validação de integridade
export const converterHoraParaMinutos = (hora: string): number => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export const converterMinutosParaHora = (minutos: number): string => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const calcularHorarioIdeal = (horarioEscala: string): string => {
  const minutos = converterHoraParaMinutos(horarioEscala);
  const idealMinutos = minutos - 60; // 1 hora antes
  return converterMinutosParaHora(Math.max(0, idealMinutos));
};

export const calcularHorarioTolerancia = (horarioIdeal: string): string => {
  const minutos = converterHoraParaMinutos(horarioIdeal);
  const toleranciaMinutos = minutos + 25; // Ideal + 25 minutos
  return converterMinutosParaHora(toleranciaMinutos);
};

export const validarDataCheckIn = (dataEscala: string, dataCheckIn: string): boolean => {
  // Extrair apenas a data (sem hora)
  const dataEscalaOnly = dataEscala.split('T')[0];
  const dataCheckInOnly = dataCheckIn.split('T')[0];
  
  // Check-in DEVE ser no mesmo dia da escala
  return dataEscalaOnly === dataCheckInOnly;
};

export const validarHorarioCheckIn = (
  horarioEscala: string,
  horaCheckIn: string
): { valido: boolean; status: 'Pontual' | 'Atrasado' | 'Falta'; diferenca: number } => {
  const escalaMinutos = converterHoraParaMinutos(horarioEscala);
  const checkInMinutos = converterHoraParaMinutos(horaCheckIn);
  const idealMinutos = escalaMinutos - 60; // 1 hora antes
  const toleranciaMinutos = idealMinutos + 25;
  
  const diferenca = checkInMinutos - idealMinutos;
  
  if (checkInMinutos <= idealMinutos) {
    return { valido: true, status: 'Pontual', diferenca };
  } else if (checkInMinutos <= toleranciaMinutos) {
    return { valido: true, status: 'Atrasado', diferenca };
  } else {
    return { valido: false, status: 'Falta', diferenca };
  }
};

export const classificarStatus = (
  dataValida: boolean,
  horarioValido: boolean,
  subStatus: 'Pontual' | 'Atrasado'
): 'Presente' | 'Falta' => {
  if (!dataValida) return 'Falta'; // Data inválida
  if (!horarioValido) return 'Falta'; // Horário inválido
  return 'Presente';
};

// Função para registrar log de ações
export const registrarLogAcao = async (
  tipo: 'CHECK_IN' | 'FALTA_AUTO' | 'JUSTIFICATIVA' | 'TROCA' | 'EXCLUSAO_ESCALA',
  voluntarioId: number,
  escalaId: number,
  descricao: string,
  dadosAntes?: Record<string, any>,
  dadosDepois?: Record<string, any>
): Promise<void> => {
  await db.logAcoes.add({
    tipo,
    voluntarioId,
    escalaId,
    descricao,
    dadosAntes,
    dadosDepois,
    criadoEm: Date.now(),
  });
};

// Função para registrar validação
export const registrarValidacao = async (
  escalaId: number,
  voluntarioId: number,
  dataEscala: string,
  horarioEscala: string,
  dataValida: boolean,
  horarioValido: boolean
): Promise<void> => {
  const horarioIdeal = calcularHorarioIdeal(horarioEscala);
  const horarioTolerancia = calcularHorarioTolerancia(horarioIdeal);
  
  await db.validacoes.add({
    escalaId,
    voluntarioId,
    dataEscala,
    horarioEscala,
    horarioIdeal,
    horarioTolerancia,
    validacaoData: dataValida,
    validacaoHorario: horarioValido,
    criadoEm: Date.now(),
  });
};

export const obterProximaEscala = async (): Promise<Escala | undefined> => {
  const hoje = new Date().toISOString().split('T')[0];
  const escalas = await db.escalas
    .where('data')
    .aboveOrEqual(hoje)
    .toArray();
  
  const naoConcluidasOrdanadas = escalas
    .filter((escala: Escala) => !escala.concluida)
    .sort((a: Escala, b: Escala) => a.data.localeCompare(b.data));
  
  return naoConcluidasOrdanadas.length > 0 ? naoConcluidasOrdanadas[0] : undefined;
};

export const removerEscalasAntigas = async (): Promise<void> => {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() - 1); // Remove escalas de mais de 1 dia atrás
  const dataLimite = hoje.toISOString().split('T')[0];
  
  const escalasAntigas = await db.escalas
    .where('data')
    .below(dataLimite)
    .toArray();
  
  const escalasConcluidasAntigas = escalasAntigas.filter((e: Escala) => e.concluida);
  await db.escalas.bulkDelete(escalasConcluidasAntigas.map(e => e.id!));
};

export const calcularDataNotificacao = (dataEscala: string, horarioEscala: string, tipo: string): Date => {
  const [ano, mes, dia] = dataEscala.split('-').map(Number);
  const [horas, minutos] = horarioEscala.split(':').map(Number);
  
  const dataHora = new Date(ano, mes - 1, dia, horas, minutos, 0);
  
  switch (tipo) {
    case 'tres_dias':
      dataHora.setDate(dataHora.getDate() - 3);
      break;
    case 'um_dia':
      dataHora.setDate(dataHora.getDate() - 1);
      break;
    case 'manha':
      dataHora.setHours(8, 0, 0, 0);
      break;
    case 'uma_hora':
      dataHora.setHours(dataHora.getHours() - 1);
      break;
    case 'checkin_60min':
      dataHora.setHours(dataHora.getHours() - 1);
      break;
  }
  
  return dataHora;
};

export const verificarNotificacoes = async (): Promise<(Escala & { tipoNotificacao?: string })[]> => {
  const agora = Date.now();
  const escalasParaNotificar: (Escala & { tipoNotificacao?: string })[] = [];
  
  const notificacoes = await db.notificacoes
    .filter((notif: Notificacao) => !notif.enviada)
    .toArray();
  
  for (const notif of notificacoes) {
    const escala = await db.escalas.get(notif.escalaId);
    if (!escala || escala.concluida) continue;
    
    const dataNotif = calcularDataNotificacao(escala.data, escala.horario, notif.tipo);
    
    if (agora >= dataNotif.getTime()) {
      escalasParaNotificar.push({ ...escala, tipoNotificacao: notif.tipo });
      await db.notificacoes.update(notif.id!, { enviada: true, dataEnvio: agora });
    }
  }
  
  return escalasParaNotificar;
};

// Funções auxiliares para histórico de presença
export const registrarPresenca = async (
  escalaId: number,
  voluntarioId: number,
  ministerioId: number,
  funcao: string,
  evento: string,
  dataEscala: string,
  horarioEscala: string,
  dataCheckIn: string,
  horaCheckIn: string
): Promise<void> => {
  // Validar data
  const dataValida = validarDataCheckIn(dataEscala, dataCheckIn);
  
  // Validar horário
  const validacaoHorario = validarHorarioCheckIn(horarioEscala, horaCheckIn);
  const horarioValido = validacaoHorario.valido;
  const subStatus = validacaoHorario.status;
  
  // Classificar status
  const status = classificarStatus(dataValida, horarioValido, subStatus as 'Pontual' | 'Atrasado');
  
  // Calcular horário ideal
  const horarioIdeal = calcularHorarioIdeal(horarioEscala);
  
  // Registrar presença
  await db.historicoPresenca.add({
    escalaId,
    voluntarioId,
    ministerioId,
    funcao,
    evento,
    dataEscala,
    horarioEscala,
    horarioIdeal,
    status,
    subStatus: status === 'Presente' ? (subStatus as 'Pontual' | 'Atrasado') : undefined,
    dataCheckIn,
    horaCheckIn,
    diferencaMinutos: validacaoHorario.diferenca,
    dataValida,
    horarioValido,
    criadoEm: Date.now(),
  });
  
  // Registrar log de ação
  await registrarLogAcao(
    'CHECK_IN',
    voluntarioId,
    escalaId,
    `Check-in realizado: ${status} (${subStatus})`,
    undefined,
    { status, subStatus, horaCheckIn }
  );
  
  // Registrar validação
  await registrarValidacao(
    escalaId,
    voluntarioId,
    dataEscala,
    horarioEscala,
    dataValida,
    horarioValido
  );
};

export const registrarFalta = async (
  escalaId: number,
  voluntarioId: number,
  ministerioId: number,
  funcao: string,
  evento: string,
  dataEscala: string,
  horarioEscala: string,
  automatica: boolean = false
): Promise<void> => {
  // Verificar se já existe registro de presença ou falta para esta escala
  const existente = await db.historicoPresenca
    .where('escalaId')
    .equals(escalaId)
    .filter(r => r.voluntarioId === voluntarioId)
    .toArray();

  if (existente.length > 0) {
    return; // Já existe registro, não criar duplicado
  }

  const horarioIdeal = calcularHorarioIdeal(horarioEscala);

  await db.historicoPresenca.add({
    escalaId,
    voluntarioId,
    ministerioId,
    funcao,
    evento,
    dataEscala,
    horarioEscala,
    horarioIdeal,
    status: 'Falta',
    dataValida: true,
    horarioValido: false,
    criadoEm: Date.now(),
  });
  
  // Registrar log de ação
  await registrarLogAcao(
    automatica ? 'FALTA_AUTO' : 'CHECK_IN',
    voluntarioId,
    escalaId,
    automatica ? 'Falta registrada automaticamente' : 'Falta registrada manualmente',
    undefined,
    { status: 'Falta', automatica }
  );
};

export const detectarERegistrarFaltas = async (): Promise<void> => {
  const hoje = new Date().toISOString().split('T')[0];
  
  // Buscar todas as escalas passadas que não foram concluídas
  const escalasPassadas = await db.escalas
    .where('data')
    .below(hoje)
    .toArray();

  for (const escala of escalasPassadas) {
    // Verificar se existe check-in para esta escala
    const checkInExistente = await db.checkIns
      .where('escalaId')
      .equals(escala.id!)
      .toArray();

    if (checkInExistente.length === 0) {
      // Não há check-in, registrar falta
      await registrarFalta(
        escala.id!,
        escala.voluntarioId,
        escala.ministerioId,
        escala.funcao,
        escala.evento,
        escala.data,
        escala.horario,
        true // Automática
      );
    }
  }
};

export const obterHistoricoPresenca = async (
  voluntarioId?: number,
  ministerioId?: number,
  mesAno?: string // YYYY-MM
): Promise<RegistroPresenca[]> => {
  let query = db.historicoPresenca.toCollection();

  if (voluntarioId) {
    query = query.filter(r => r.voluntarioId === voluntarioId);
  }

  if (ministerioId) {
    query = query.filter(r => r.ministerioId === ministerioId);
  }

  if (mesAno) {
    query = query.filter(r => r.dataEscala.startsWith(mesAno));
  }

  const registros = await query.toArray();
  return registros.sort((a, b) => b.dataEscala.localeCompare(a.dataEscala));
};

export const calcularMetricasPresenca = async (
  voluntarioId: number,
  mesAno?: string // YYYY-MM
): Promise<{
  total: number;
  presencas: number;
  presentesPontuais: number;
  presentesAtrasados: number;
  faltas: number;
  justificados: number;
  trocados: number;
  percentualPresenca: number;
  percentualPontualidade: number;
}> => {
  const registros = await obterHistoricoPresenca(voluntarioId, undefined, mesAno);

  const total = registros.length;
  const presencas = registros.filter(r => r.status === 'Presente').length;
  const presentesPontuais = registros.filter(r => r.status === 'Presente' && r.subStatus === 'Pontual').length;
  const presentesAtrasados = registros.filter(r => r.status === 'Presente' && r.subStatus === 'Atrasado').length;
  const faltas = registros.filter(r => r.status === 'Falta').length;
  const justificados = registros.filter(r => r.status === 'Justificado').length;
  const trocados = registros.filter(r => r.status === 'Trocado').length;
  
  const percentualPresenca = total > 0 ? (presencas / total) * 100 : 0;
  const percentualPontualidade = presencas > 0 ? (presentesPontuais / presencas) * 100 : 0;

  return {
    total,
    presencas,
    presentesPontuais,
    presentesAtrasados,
    faltas,
    justificados,
    trocados,
    percentualPresenca: Math.round(percentualPresenca * 100) / 100,
    percentualPontualidade: Math.round(percentualPontualidade * 100) / 100,
  };
};

export const calcularMetricasPorMinisterio = async (
  ministerioId: number,
  mesAno?: string
): Promise<{
  total: number;
  presencas: number;
  presentesPontuais: number;
  presentesAtrasados: number;
  faltas: number;
  justificados: number;
  trocados: number;
  percentualPresenca: number;
  percentualPontualidade: number;
}> => {
  const registros = await obterHistoricoPresenca(undefined, ministerioId, mesAno);

  const total = registros.length;
  const presencas = registros.filter(r => r.status === 'Presente').length;
  const presentesPontuais = registros.filter(r => r.status === 'Presente' && r.subStatus === 'Pontual').length;
  const presentesAtrasados = registros.filter(r => r.status === 'Presente' && r.subStatus === 'Atrasado').length;
  const faltas = registros.filter(r => r.status === 'Falta').length;
  const justificados = registros.filter(r => r.status === 'Justificado').length;
  const trocados = registros.filter(r => r.status === 'Trocado').length;
  
  const percentualPresenca = total > 0 ? (presencas / total) * 100 : 0;
  const percentualPontualidade = presencas > 0 ? (presentesPontuais / presencas) * 100 : 0;

  return {
    total,
    presencas,
    presentesPontuais,
    presentesAtrasados,
    faltas,
    justificados,
    trocados,
    percentualPresenca: Math.round(percentualPresenca * 100) / 100,
    percentualPontualidade: Math.round(percentualPontualidade * 100) / 100,
  };
};

export const obterLogAcoes = async (
  voluntarioId?: number,
  escalaId?: number,
  tipo?: string
): Promise<LogAcao[]> => {
  let query = db.logAcoes.toCollection();

  if (voluntarioId) {
    query = query.filter(l => l.voluntarioId === voluntarioId);
  }

  if (escalaId) {
    query = query.filter(l => l.escalaId === escalaId);
  }

  if (tipo) {
    query = query.filter(l => l.tipo === tipo);
  }

  const logs = await query.toArray();
  return logs.sort((a, b) => b.criadoEm - a.criadoEm);
};


/**
 * Interface para registro de exclusão de escala
 */
export interface RegistroExclusao {
  id?: number;
  escalaId: number;
  voluntarioId: number;
  ministerioId: number;
  funcao: string;
  evento: string;
  dataEscala: string;
  horarioEscala: string;
  motivo: 'cancelamento' | 'troca' | 'erro' | 'pessoal' | 'outro';
  descricao?: string;
  nomeServoTroca?: string;      // Nome do servo para "Troca de Escala"
  justificativa?: string;        // Justificativa pós-exclusão
  deletadoEm: number;            // Timestamp imutável
}

/**
 * Registra exclusão de escala no histórico
 */
export const registrarExclusao = async (
  escalaId: number,
  voluntarioId: number,
  ministerioId: number,
  funcao: string,
  evento: string,
  dataEscala: string,
  horarioEscala: string,
  motivo: 'cancelamento' | 'troca' | 'erro' | 'pessoal' | 'outro',
  descricao?: string,
  nomeServoTroca?: string
): Promise<number> => {
  const registroExclusao: RegistroExclusao = {
    escalaId,
    voluntarioId,
    ministerioId,
    funcao,
    evento,
    dataEscala,
    horarioEscala,
    motivo,
    descricao,
    nomeServoTroca,
    deletadoEm: Date.now(),
  };

  const id = await db.registrosExclusao.add(registroExclusao);
  
  // Registrar log de ação
  let logDescricao = `Escala excluída: ${funcao} em ${dataEscala} às ${horarioEscala}. Motivo: ${motivo}`;
  if (descricao) logDescricao += ` - ${descricao}`;
  if (nomeServoTroca) logDescricao += ` (Trocado com: ${nomeServoTroca})`;
  
  await registrarLogAcao(
    'EXCLUSAO_ESCALA',
    voluntarioId,
    escalaId,
    logDescricao
  );

  return id;
};

/**
 * Obtém histórico de exclusões
 */
export const obterHistoricoExclusoes = async (
  voluntarioId?: number,
  ministerioId?: number,
  mes?: string
): Promise<RegistroExclusao[]> => {
  let query = db.registrosExclusao.toCollection();

  if (voluntarioId) {
    query = query.filter(r => r.voluntarioId === voluntarioId);
  }

  if (ministerioId) {
    query = query.filter(r => r.ministerioId === ministerioId);
  }

  if (mes) {
    query = query.filter(r => r.dataEscala.startsWith(mes));
  }

  const registros = await query.toArray();
  return registros.sort((a, b) => b.deletadoEm - a.deletadoEm);
};

/**
 * Obtém exclusões por motivo
 */
export const obterExclusoesPorMotivo = async (): Promise<Record<string, number>> => {
  const exclusoes = await db.registrosExclusao.toArray();
  const contagem: Record<string, number> = {
    cancelamento: 0,
    troca: 0,
    erro: 0,
    pessoal: 0,
    outro: 0,
  };

  exclusoes.forEach(e => {
    contagem[e.motivo]++;
  });

  return contagem;
};

/**
 * Valida motivo de exclusão
 */
export const validarMotivoExclusao = (
  motivo: string,
  descricao?: string
): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];
  const motivosValidos = ['cancelamento', 'troca', 'erro', 'pessoal', 'outro'];

  if (!motivo || !motivosValidos.includes(motivo)) {
    erros.push('Motivo inválido');
  }

  if (motivo === 'outro' && (!descricao || descricao.trim() === '')) {
    erros.push('Descrição é obrigatória quando motivo é "Outro"');
  }

  if (descricao && descricao.length > 500) {
    erros.push('Descrição não pode exceder 500 caracteres');
  }

  return {
    valido: erros.length === 0,
    erros,
  };
};
