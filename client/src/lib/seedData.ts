import { db, Voluntario, Ministerio, Escala } from './db';

export const seedDadosExemplo = async () => {
  // Verificar se já existem dados
  const voluntariosExistentes = await db.voluntarios.count();
  if (voluntariosExistentes > 0) return;

  // Voluntários de exemplo
  const voluntarios: Voluntario[] = [
    { nome: 'João Silva', criadoEm: Date.now() },
    { nome: 'Maria Santos', criadoEm: Date.now() },
    { nome: 'Pedro Oliveira', criadoEm: Date.now() },
    { nome: 'Ana Costa', criadoEm: Date.now() },
    { nome: 'Carlos Mendes', criadoEm: Date.now() },
  ];

  // Ministérios de exemplo
  const ministerios: Ministerio[] = [
    { nome: 'Música', criadoEm: Date.now() },
    { nome: 'Louvor', criadoEm: Date.now() },
    { nome: 'Pregação', criadoEm: Date.now() },
    { nome: 'Recepção', criadoEm: Date.now() },
    { nome: 'Infantil', criadoEm: Date.now() },
  ];

  // Adicionar voluntários
  const voluntariosIds = await db.voluntarios.bulkAdd(voluntarios);

  // Adicionar ministérios
  const ministeriosIds = await db.ministerios.bulkAdd(ministerios);

  // Escalas de exemplo (próximos 30 dias)
  const hoje = new Date();
  const escalas: Escala[] = [];

  for (let i = 0; i < 5; i++) {
    const data = new Date(hoje);
    data.setDate(data.getDate() + (i * 7)); // Uma por semana
    const dataStr = data.toISOString().split('T')[0];

    escalas.push({
      voluntarioId: voluntariosIds[i % voluntariosIds.length],
      ministerioId: ministeriosIds[i % ministeriosIds.length],
      funcao: ['Organista', 'Pregador', 'Porteiro', 'Recepcionista', 'Animador'][i],
      evento: ['Culto Matinal', 'Culto Noturno', 'Reunião de Oração', 'Escola Dominical', 'Celebração'][i],
      data: dataStr,
      horario: ['08:00', '19:00', '19:30', '09:00', '15:00'][i],
      oQueLevar: ['Bíblia', 'Instrumento', 'Nada especial', 'Material de recepção', 'Atividades'][i],
      observacoes: i === 0 ? 'Primeira escala de exemplo' : undefined,
      concluida: false,
      pronto: false,
      checkInRealizado: false,
      criadoEm: Date.now(),
      atualizadoEm: Date.now(),
    });
  }

  // Adicionar escalas
  const escalasIds = await db.escalas.bulkAdd(escalas);

  // Adicionar notificações para cada escala
  // escalasIds pode ser um array ou um número, então garantir que seja array
  const escalasIdsArray = Array.isArray(escalasIds) ? escalasIds : [escalasIds];
  
  for (const escalaId of escalasIdsArray) {
    await db.notificacoes.bulkAdd([
      { escalaId, tipo: 'tres_dias', enviada: false },
      { escalaId, tipo: 'um_dia', enviada: false },
      { escalaId, tipo: 'manha', enviada: false },
      { escalaId, tipo: 'uma_hora', enviada: false },
    ]);
  }
};
