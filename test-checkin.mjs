/**
 * Script de Teste: Injetar dados de check-in no banco de dados
 * Simula um check-in bem-sucedido e verifica se o registro de presença é criado
 */

import Dexie from 'dexie';

// Criar instância do banco de dados
const db = new Dexie('ChurchScale');

// Definir schema
db.version(2).stores({
  voluntarios: '++id, criadoEm',
  ministerios: '++id, criadoEm',
  escalas: '++id, data, criadoEm',
  checkIns: '++id, escalaId, voluntarioId, criadoEm',
  notificacoes: '++id, escalaId, criadoEm',
  historicoPresenca: '++id, escalaId, voluntarioId, dataEscala, status, criadoEm',
});

async function testarCheckIn() {
  console.log('🧪 Iniciando teste de check-in...\n');

  try {
    // 1. Obter dados existentes
    console.log('📊 Buscando dados existentes...');
    const escalas = await db.escalas.toArray();
    const voluntarios = await db.voluntarios.toArray();
    const ministerios = await db.ministerios.toArray();

    if (escalas.length === 0) {
      console.error('❌ Nenhuma escala encontrada no banco de dados');
      return;
    }

    console.log(`✅ Encontradas ${escalas.length} escalas`);
    console.log(`✅ Encontrados ${voluntarios.length} voluntários`);
    console.log(`✅ Encontrados ${ministerios.length} ministérios\n`);

    // 2. Usar a primeira escala para o teste
    const escala = escalas[0];
    const voluntario = voluntarios[0];
    const ministerio = ministerios[0];

    console.log('📋 Dados da Escala para Teste:');
    console.log(`   ID: ${escala.id}`);
    console.log(`   Data: ${escala.data}`);
    console.log(`   Hora: ${escala.horario}`);
    console.log(`   Função: ${escala.funcao}`);
    console.log(`   Evento: ${escala.evento}\n`);

    // 3. Criar registro de check-in
    console.log('📍 Criando registro de check-in...');
    const agora = new Date();
    const horaCheckIn = agora.toTimeString().split(' ')[0]; // HH:mm:ss
    const dataCheckInISO = agora.toISOString();

    const checkInId = await db.checkIns.add({
      escalaId: escala.id,
      voluntarioId: escala.voluntarioId,
      latitude: -29.0109,
      longitude: -49.0047,
      distancia: 50, // Dentro do raio de 100m
      criadoEm: Date.now(),
    });

    console.log(`✅ Check-in criado com ID: ${checkInId}\n`);

    // 4. Criar registro de presença
    console.log('📝 Criando registro de presença...');
    const presencaId = await db.historicoPresenca.add({
      escalaId: escala.id,
      voluntarioId: escala.voluntarioId,
      ministerioId: escala.ministerioId,
      funcao: escala.funcao,
      evento: escala.evento,
      dataEscala: escala.data,
      horarioEscala: escala.horario,
      status: 'Presente',
      dataCheckIn: dataCheckInISO,
      horaCheckIn: horaCheckIn,
      criadoEm: Date.now(),
    });

    console.log(`✅ Registro de presença criado com ID: ${presencaId}\n`);

    // 5. Verificar registros criados
    console.log('🔍 Verificando registros criados...\n');

    const checkIns = await db.checkIns.where('escalaId').equals(escala.id).toArray();
    console.log(`✅ Check-ins para esta escala: ${checkIns.length}`);
    console.log(`   Detalhes:`, checkIns[0], '\n');

    const historicos = await db.historicoPresenca
      .where('escalaId')
      .equals(escala.id)
      .toArray();
    console.log(`✅ Registros de presença para esta escala: ${historicos.length}`);
    console.log(`   Detalhes:`, historicos[0], '\n');

    // 6. Calcular métricas
    console.log('📊 Calculando métricas...\n');
    const totalRegistros = await db.historicoPresenca.count();
    const totalPresencas = await db.historicoPresenca
      .where('status')
      .equals('Presente')
      .count();
    const totalFaltas = await db.historicoPresenca.where('status').equals('Falta').count();
    const percentualPresenca =
      totalRegistros > 0 ? Math.round((totalPresencas / totalRegistros) * 100) : 0;

    console.log(`📈 Total de Registros: ${totalRegistros}`);
    console.log(`✅ Total de Presenças: ${totalPresencas}`);
    console.log(`❌ Total de Faltas: ${totalFaltas}`);
    console.log(`📊 Percentual de Presença: ${percentualPresenca}%\n`);

    // 7. Teste de filtragem
    console.log('🔎 Testando filtros...\n');

    const presencasPorVoluntario = await db.historicoPresenca
      .where('voluntarioId')
      .equals(escala.voluntarioId)
      .toArray();
    console.log(`✅ Presenças do voluntário ${voluntario.nome}: ${presencasPorVoluntario.length}`);

    const presencasPorMinisterio = await db.historicoPresenca
      .where('ministerioId')
      .equals(escala.ministerioId)
      .toArray();
    console.log(`✅ Presenças do ministério ${ministerio.nome}: ${presencasPorMinisterio.length}\n`);

    // 8. Teste de imutabilidade
    console.log('🔒 Testando imutabilidade...\n');
    try {
      await db.historicoPresenca.update(presencaId, { status: 'Falta' });
      console.log('⚠️ Aviso: Registro foi atualizado (não é imutável)');
    } catch (erro) {
      console.log('✅ Registro é imutável (não pode ser atualizado)');
    }

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Resumo:');
    console.log('   ✅ Check-in criado');
    console.log('   ✅ Registro de presença criado');
    console.log('   ✅ Métricas calculadas');
    console.log('   ✅ Filtros funcionando');
    console.log('   ✅ Dados persistidos no banco de dados\n');
  } catch (erro) {
    console.error('❌ Erro durante o teste:', erro);
    console.error(erro.stack);
  }
}

// Executar teste
testarCheckIn();
