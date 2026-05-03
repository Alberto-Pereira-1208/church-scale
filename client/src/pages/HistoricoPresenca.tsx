import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { db, RegistroPresenca, RegistroExclusao, obterHistoricoPresenca, obterHistoricoExclusoes, calcularMetricasPresenca } from '@/lib/db';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Download, Filter, Search, Share2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { CompartilharRelatorioPresencaModal } from '@/components/CompartilharRelatorioPresencaModal';
import { SecaoExclusoes } from '@/components/SecaoExclusoes';

export default function HistoricoPresenca() {
  const [, navigate] = useLocation() as [string, (path: string) => void];
  const { voluntarios, ministerios } = useApp();
  
  const [registros, setRegistros] = useState<RegistroPresenca[]>([]);
  const [exclusoes, setExclusoes] = useState<RegistroExclusao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroVoluntario, setFiltroVoluntario] = useState<string>('');
  const [filtroMinisterio, setFiltroMinisterio] = useState<string>('');
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [busca, setBusca] = useState<string>('');
  const [metricas, setMetricas] = useState({
    total: 0,
    presencas: 0,
    presentesPontuais: 0,
    presentesAtrasados: 0,
    faltas: 0,
    justificados: 0,
    trocados: 0,
    percentualPresenca: 0,
    percentualPontualidade: 0,
  });
  const [modalCompartilhaAberto, setModalCompartilhaAberto] = useState(false);

  // Carregar histórico
  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        setCarregando(true);
        const voluntarioId = filtroVoluntario && filtroVoluntario !== 'todos' ? parseInt(filtroVoluntario) : undefined;
        const ministerioId = filtroMinisterio && filtroMinisterio !== 'todos' ? parseInt(filtroMinisterio) : undefined;
        
        const dados = await obterHistoricoPresenca(voluntarioId, ministerioId, filtroMes);
        const exclusoesData = await obterHistoricoExclusoes(voluntarioId, ministerioId, filtroMes);
        
        // Filtrar por busca
        let filtrados = dados;
        if (busca) {
          const buscaLower = busca.toLowerCase();
          filtrados = dados.filter(r =>
            r.evento.toLowerCase().includes(buscaLower) ||
            r.funcao.toLowerCase().includes(buscaLower)
          );
        }
        
        setRegistros(filtrados);
        setExclusoes(exclusoesData);

        // Calcular métricas se houver filtro de voluntário
        if (voluntarioId && filtroVoluntario !== 'todos') {
          const met = await calcularMetricasPresenca(voluntarioId, filtroMes);
          setMetricas(met);
        } else {
          // Calcular métricas gerais
          const total = filtrados.length;
          const presencas = filtrados.filter(r => r.status === 'Presente').length;
          const presentesPontuais = filtrados.filter(r => r.status === 'Presente' && r.subStatus === 'Pontual').length;
          const presentesAtrasados = filtrados.filter(r => r.status === 'Presente' && r.subStatus === 'Atrasado').length;
          const faltas = filtrados.filter(r => r.status === 'Falta').length;
          const justificados = filtrados.filter(r => r.status === 'Justificado').length;
          const trocados = filtrados.filter(r => r.status === 'Trocado').length;
          
          const percentualPresenca = total > 0 ? (presencas / total) * 100 : 0;
          const percentualPontualidade = presencas > 0 ? (presentesPontuais / presencas) * 100 : 0;
          
          setMetricas({
            total,
            presencas,
            presentesPontuais,
            presentesAtrasados,
            faltas,
            justificados,
            trocados,
            percentualPresenca: Math.round(percentualPresenca * 100) / 100,
            percentualPontualidade: Math.round(percentualPontualidade * 100) / 100,
          });
        }
      } catch (erro) {
        console.error('Erro ao carregar histórico:', erro);
        toast.error('Erro ao carregar histórico');
      } finally {
        setCarregando(false);
      }
    };

    carregarHistorico();
  }, [filtroVoluntario, filtroMinisterio, filtroMes, busca]);

  // Gerar meses disponíveis
  const gerarMeses = () => {
    const meses = new Set<string>();
    registros.forEach(r => {
      const mes = r.dataEscala.substring(0, 7); // YYYY-MM
      meses.add(mes);
    });
    return Array.from(meses).sort().reverse();
  };

  const formatarData = (dataISO: string, horario: string): string => {
    const data = new Date(dataISO + 'T00:00:00');
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = dias[data.getDay()];
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    
    return `${diaSemana}, ${dia}/${mes} às ${horario}`;
  };

  const formatarDataBR = (dataISO: string): string => {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleAbrirModalCompartilha = () => {
    setModalCompartilhaAberto(true);
  };

  const exportarCSV = () => {
    try {
      let csv = 'Data,Hora Escala,Voluntário,Ministério,Função,Evento,Status,Hora Check-In,Hora Ideal,Diferença (min)\n';
      
      registros.forEach(r => {
        const voluntario = voluntarios.find(v => v.id === r.voluntarioId)?.nome || 'N/A';
        const ministerio = ministerios.find(m => m.id === r.ministerioId)?.nome || 'N/A';
        const horaCheckIn = r.horaCheckIn || 'N/A';
        const horarioIdeal = r.horarioIdeal || 'N/A';
        const diferenca = r.diferencaMinutos !== undefined ? r.diferencaMinutos : 'N/A';
        const statusCompleto = r.subStatus ? `${r.status} (${r.subStatus})` : r.status;
        
        csv += `"${formatarDataBR(r.dataEscala)}","${r.horarioEscala}","${voluntario}","${ministerio}","${r.funcao}","${r.evento}","${statusCompleto}","${horaCheckIn}","${horarioIdeal}","${diferenca}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `historico-presenca-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('✅ CSV exportado com sucesso!');
    } catch (erro) {
      console.error('Erro ao exportar CSV:', erro);
      toast.error('Erro ao exportar CSV');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-foreground hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Histórico de Presença</h1>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Select value={filtroVoluntario} onValueChange={setFiltroVoluntario}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Voluntário" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="todos">Todos os voluntários</SelectItem>
                  {voluntarios.map(v => (
                    <SelectItem key={v.id} value={v.id?.toString() || ''}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filtroMinisterio} onValueChange={setFiltroMinisterio}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Ministério" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="todos">Todos os ministérios</SelectItem>
                  {ministerios.map(m => (
                    <SelectItem key={m.id} value={m.id?.toString() || ''}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {gerarMeses().map(mes => (
                    <SelectItem key={mes} value={mes}>
                      {new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar evento ou função..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <Button
                onClick={handleAbrirModalCompartilha}
                variant="outline"
                size="icon"
                className="border-border"
                title="Compartilhar relatório"
              >
                <Share2 size={18} />
              </Button>
              <Button
                onClick={exportarCSV}
                variant="outline"
                size="icon"
                className="border-border"
                title="Exportar como CSV"
              >
                <Download size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Métricas Expandidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="bg-secondary/30 border-border p-3">
            <p className="text-xs text-foreground/60 mb-1">Total</p>
            <p className="text-2xl font-bold text-accent">{metricas.total}</p>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30 p-3">
            <p className="text-xs text-foreground/60 mb-1">Pontual</p>
            <p className="text-2xl font-bold text-green-400">{metricas.presentesPontuais}</p>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/30 p-3">
            <p className="text-xs text-foreground/60 mb-1">Atrasado</p>
            <p className="text-2xl font-bold text-yellow-400">{metricas.presentesAtrasados}</p>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30 p-3">
            <p className="text-xs text-foreground/60 mb-1">Faltas</p>
            <p className="text-2xl font-bold text-red-400">{metricas.faltas}</p>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/30 p-3">
            <p className="text-xs text-foreground/60 mb-1">Presença</p>
            <p className="text-2xl font-bold text-blue-400">{metricas.percentualPresenca}%</p>
          </Card>
        </div>

        {/* Taxa de Pontualidade */}
        {metricas.presencas > 0 && (
          <Card className="bg-purple-500/10 border-purple-500/30 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60">Taxa de Pontualidade</p>
                <p className="text-2xl font-bold text-purple-400">{metricas.percentualPontualidade}%</p>
              </div>
              <div className="text-right text-sm text-foreground/60">
                <p>{metricas.presentesPontuais} pontuais de {metricas.presencas} presenças</p>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de Registros */}
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-foreground/60">Carregando histórico...</p>
          </div>
        ) : registros.length === 0 && exclusoes.length === 0 ? (
          <Card className="bg-secondary/20 border-border p-8 text-center">
            <Filter size={32} className="mx-auto mb-2 text-foreground/40" />
            <p className="text-foreground/60">Nenhum registro encontrado</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {registros.map((registro) => {
              const voluntario = voluntarios.find(v => v.id === registro.voluntarioId);
              const ministerio = ministerios.find(m => m.id === registro.ministerioId);
              const isPresente = registro.status === 'Presente';
              const isPontual = registro.subStatus === 'Pontual';
              
              return (
                <Card
                  key={registro.id}
                  className={`border p-4 transition-all ${
                    isPresente
                      ? isPontual
                        ? 'bg-green-500/5 border-green-500/30 hover:bg-green-500/10'
                        : 'bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10'
                      : 'bg-red-500/5 border-red-500/30 hover:bg-red-500/10'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-foreground/60">Data e Hora</p>
                      <p className="font-semibold text-foreground">
                        {formatarData(registro.dataEscala, registro.horarioEscala)}
                      </p>
                      <p className="text-xs text-foreground/40 mt-1">
                        {voluntario?.nome} • {ministerio?.nome}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-foreground/60">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {isPresente ? (
                          <>
                            <CheckCircle2 size={16} className={isPontual ? 'text-green-400' : 'text-yellow-400'} />
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                isPontual
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {isPontual ? '✓ Pontual' : '⚠ Atrasado'}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} className="text-red-400" />
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-400">
                              ✗ Falta
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-foreground/60">Horários</p>
                      <div className="space-y-1 text-sm">
                        {registro.horarioIdeal && (
                          <p className="text-foreground/80">
                            Ideal: <span className="font-mono text-accent">{registro.horarioIdeal}</span>
                          </p>
                        )}
                        {isPresente && registro.horaCheckIn && (
                          <p className="text-foreground/80">
                            Check-in: <span className="font-mono text-foreground">{registro.horaCheckIn}</span>
                            {registro.diferencaMinutos !== undefined && (
                              <span className={registro.diferencaMinutos <= 0 ? 'text-green-400' : 'text-yellow-400'}>
                                {' '}({registro.diferencaMinutos > 0 ? '+' : ''}{registro.diferencaMinutos}min)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <p className="text-sm text-foreground/60">Função</p>
                      <p className="text-foreground text-sm">{registro.funcao}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-foreground/60">Evento</p>
                      <p className="text-foreground text-sm">{registro.evento || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Seção de Exclusões */}
        {exclusoes.length > 0 && <SecaoExclusoes exclusoes={exclusoes} />}
      </div>

      {/* Modal de Compartilhamento */}
      {filtroVoluntario && (
        <CompartilharRelatorioPresencaModal
          aberto={modalCompartilhaAberto}
          onClose={() => setModalCompartilhaAberto(false)}
          dados={{
            voluntarioNome: voluntarios.find(v => v.id === parseInt(filtroVoluntario))?.nome || 'Desconhecido',
            ministerioNome: filtroMinisterio
              ? ministerios.find(m => m.id === parseInt(filtroMinisterio))?.nome || 'Todos'
              : 'Todos',
            mesAno: filtroMes || new Date().toISOString().substring(0, 7),
            total: metricas.total,
            presencas: metricas.presencas,
            presentesPontuais: metricas.presentesPontuais,
            presentesAtrasados: metricas.presentesAtrasados,
            faltas: metricas.faltas,
            percentualPresenca: metricas.percentualPresenca,
            percentualPontualidade: metricas.percentualPontualidade,
            registros: registros.map(r => ({
              dataEscala: r.dataEscala,
              horarioEscala: r.horarioEscala,
              horarioIdeal: r.horarioIdeal,
              status: r.status,
              subStatus: r.subStatus,
              horaCheckIn: r.horaCheckIn,
              diferencaMinutos: r.diferencaMinutos,
              evento: r.evento,
            })),
            exclusoes: exclusoes.map(e => ({
              dataEscala: e.dataEscala,
              horarioEscala: e.horarioEscala,
              evento: e.evento,
              motivo: e.motivo,
              descricao: e.descricao,
              nomeServoTroca: e.nomeServoTroca,
              deletadoEm: new Date(e.deletadoEm).toLocaleDateString('pt-BR'),
            })),
          }}
        />
      )}
    </div>
  );
}
