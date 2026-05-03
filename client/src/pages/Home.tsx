import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { formatarData, obterProximaEscala } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, Share2, MapPin, Users, CheckCheck, Clock4 } from 'lucide-react';
import { toast } from 'sonner';
import { CompartilharModal } from '@/components/CompartilharModal';
import { CheckInModal } from '@/components/CheckInModal';

export default function Home() {
  const [, navigate] = useLocation();
  const { escalas, voluntarios, ministerios, atualizarEscala, carregando } = useApp();
  const [proximaEscala, setProximaEscala] = useState<any>(null);
  const [tempoRestante, setTempoRestante] = useState<string>('');
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);
  const [mostrarCheckIn, setMostrarCheckIn] = useState(false);

  const proximaEscalaComNomes = useMemo(() => {
    if (!proximaEscala) return null;
    return {
      ...proximaEscala,
      voluntarioNome: voluntarios.find(v => v.id === proximaEscala.voluntarioId)?.nome || 'N/A',
      ministerioNome: ministerios.find(m => m.id === proximaEscala.ministerioId)?.nome || 'N/A',
    };
  }, [proximaEscala, voluntarios, ministerios]);

  useEffect(() => {
    const carregarProximaEscala = async () => {
      const escala = await obterProximaEscala();
      setProximaEscala(escala);
    };
    carregarProximaEscala();
  }, [escalas]);

  // Atualizar contagem regressiva
  useEffect(() => {
    const atualizarTempo = () => {
      if (!proximaEscalaComNomes) return;

      const [ano, mes, dia] = proximaEscalaComNomes.data.split('-').map(Number);
      const [horas, minutos] = proximaEscalaComNomes.horario.split(':').map(Number);
      const dataEscala = new Date(ano, mes - 1, dia, horas, minutos, 0);
      const agora = new Date();
      const diferenca = dataEscala.getTime() - agora.getTime();

      if (diferenca <= 0) {
        setTempoRestante('Escala em andamento');
        return;
      }

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas_restantes = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos_restantes = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));

      if (dias > 0) {
        setTempoRestante(`${dias}d ${horas_restantes}h ${minutos_restantes}m`);
      } else if (horas_restantes > 0) {
        setTempoRestante(`${horas_restantes}h ${minutos_restantes}m`);
      } else {
        setTempoRestante(`${minutos_restantes}m`);
      }
    };

    atualizarTempo();
    const intervalo = setInterval(atualizarTempo, 60000); // Atualizar a cada minuto

    return () => clearInterval(intervalo);
  }, [proximaEscalaComNomes]);

  const handleMarcarPronto = async () => {
    if (!proximaEscalaComNomes) return;
    
    // Verificar se Check-In foi realizado
    if (!proximaEscalaComNomes.checkInRealizado) {
      toast.error('É necessário realizar o Check-In antes de iniciar a escala');
      setMostrarCheckIn(true);
      return;
    }
    
    try {
      await atualizarEscala(proximaEscalaComNomes.id!, { pronto: !proximaEscalaComNomes.pronto });
      toast.success(proximaEscalaComNomes.pronto ? 'Marcado como não pronto' : 'Marcado como pronto! ✅');
    } catch (erro) {
      toast.error('Erro ao atualizar escala');
    }
  };

  const handleConcluirEscala = async () => {
    if (!proximaEscalaComNomes) return;
    
    // Verificar se Check-In foi realizado
    if (!proximaEscalaComNomes.checkInRealizado) {
      toast.error('É necessário realizar o Check-In antes de concluir a escala');
      setMostrarCheckIn(true);
      return;
    }
    
    try {
      await atualizarEscala(proximaEscalaComNomes.id!, { concluida: true });
      toast.success('Escala finalizada com sucesso 🙌');
    } catch (erro) {
      toast.error('Erro ao concluir escala');
    }
  };

  if (carregando) {
    return (
      <Layout currentPage="home">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Clock className="w-12 h-12 text-accent" />
            </div>
            <p className="text-foreground/60">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="home">
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Bem-vindo ao Church Scale</h1>
          <p className="text-sm md:text-base text-foreground/60">Gerenciador de escalas de serviço</p>
        </div>

        {proximaEscalaComNomes ? (
          <>
            {/* Próxima Escala Card */}
            <Card className="bg-card border-2 border-card-foreground/10 mb-6 p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-foreground/60 mb-2">PRÓXIMA ESCALA</p>
                  <h2 className="text-xl md:text-3xl font-bold text-foreground">
                    {formatarData(proximaEscalaComNomes.data, proximaEscalaComNomes.horario)}
                  </h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    proximaEscalaComNomes.pronto
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {proximaEscalaComNomes.pronto ? '✓ Pronto' : 'Não pronto'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    proximaEscalaComNomes.checkInRealizado
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {proximaEscalaComNomes.checkInRealizado ? '✓ Check-In' : '⏰ Check-In Pendente'}
                  </div>
                </div>
              </div>

              {/* Contagem Regressiva */}
              <div className="bg-secondary/30 rounded-lg p-3 md:p-4 mb-6 border border-accent/20">
                <p className="text-xs text-foreground/60 mb-1">TEMPO RESTANTE</p>
                <p className="text-xl md:text-2xl font-mono font-bold text-accent">{tempoRestante}</p>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">VOLUNTÁRIO</p>
                  <p className="text-sm md:text-base text-foreground font-semibold">{proximaEscalaComNomes.voluntarioNome}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">MINISTÉRIO</p>
                  <p className="text-sm md:text-base text-foreground font-semibold">{proximaEscalaComNomes.ministerioNome}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">FUNÇÃO</p>
                  <p className="text-sm md:text-base text-foreground font-semibold">{proximaEscalaComNomes.funcao}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">EVENTO</p>
                  <p className="text-sm md:text-base text-foreground font-semibold">{proximaEscalaComNomes.evento}</p>
                </div>
              </div>

              {proximaEscalaComNomes.oQueLevar && (
                <div className="mb-6 bg-secondary/20 rounded-lg p-3 md:p-4 border border-accent/10">
                  <p className="text-xs text-foreground/60 mb-2">O QUE LEVAR</p>
                  <p className="text-sm md:text-base text-foreground">{proximaEscalaComNomes.oQueLevar}</p>
                </div>
              )}

              {proximaEscalaComNomes.observacoes && (
                <div className="mb-6 bg-secondary/20 rounded-lg p-3 md:p-4 border border-accent/10">
                  <p className="text-xs text-foreground/60 mb-2">OBSERVAÇÕES</p>
                  <p className="text-sm md:text-base text-foreground">{proximaEscalaComNomes.observacoes}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col gap-3 w-full">
                {/* Check-In Destaque - Obrigatório */}
                <Button
                  onClick={() => setMostrarCheckIn(true)}
                  className={`w-full text-sm md:text-base py-3 md:py-4 flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${
                    proximaEscalaComNomes.checkInRealizado
                      ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 hover:bg-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500 hover:bg-yellow-500/30 animate-pulse'
                  }`}
                  title="Check-In Obrigatório"
                >
                  <MapPin size={20} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {proximaEscalaComNomes.checkInRealizado ? '✓ Check-In Confirmado' : '⏰ Check-In Obrigatório'}
                  </span>
                </Button>

                {/* Ações Secundárias */}
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={handleMarcarPronto}
                    variant={proximaEscalaComNomes.pronto ? 'outline' : 'default'}
                    className={`flex-1 text-xs md:text-sm py-2 flex items-center justify-center gap-2 ${proximaEscalaComNomes.pronto ? 'border-accent text-accent' : ''}`}
                    title="Marcar como pronto"
                  >
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">{proximaEscalaComNomes.pronto ? 'Não pronto' : 'Pronto'}</span>
                  </Button>
                  <Button
                    onClick={handleConcluirEscala}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-xs md:text-sm py-2"
                  >
                    Concluir
                  </Button>
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => setMostrarCompartilhar(true)}
                    variant="outline"
                    className="flex-1 border-accent text-accent text-xs md:text-sm py-2 flex items-center justify-center gap-2"
                    title="Compartilhar"
                  >
                    <Share2 size={16} className="flex-shrink-0" />
                    <span className="whitespace-nowrap">Compartilhar</span>
                  </Button>
                </div>
                <Button
                  onClick={() => navigate('/escalas')}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary text-xs md:text-sm py-2"
                >
                  Ver todas as escalas
                </Button>
              </div>
            </Card>
          </>
        ) : (
          <Card className="bg-card border-2 border-card-foreground/10 p-6 md:p-8 text-center">
            <AlertCircle className="w-10 md:w-12 h-10 md:h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Nenhuma escala próxima</h2>
            <p className="text-sm md:text-base text-foreground/60 mb-6">Crie uma nova escala para começar</p>
            <Button
              onClick={() => navigate('/escalas')}
              className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Criar nova escala
            </Button>
          </Card>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:mt-8">
          <Card className="bg-card border-2 border-blue-500/30 hover:border-blue-500/60 p-3 md:p-4 transition-smooth animate-fadeInUp" style={{animationDelay: '0s'}}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-400" />
              <p className="text-foreground/60 text-xs md:text-sm">Total</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-400">{escalas.length}</p>
          </Card>
          <Card className="bg-card border-2 border-yellow-500/30 hover:border-yellow-500/60 p-3 md:p-4 transition-smooth animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-2 mb-2">
              <Clock4 size={18} className="text-yellow-400" />
              <p className="text-foreground/60 text-xs md:text-sm">Pendentes</p>
            </div>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-400">{escalas.filter(e => !e.concluida).length}</p>
          </Card>
          <Card className="bg-card border-2 border-green-500/30 hover:border-green-500/60 p-3 md:p-4 transition-smooth animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCheck size={18} className="text-green-400" />
              <p className="text-foreground/60 text-xs md:text-sm">Concluídas</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-400">{escalas.filter(e => e.concluida).length}</p>
          </Card>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      {proximaEscalaComNomes && (
        <CompartilharModal
          aberto={mostrarCompartilhar}
          onClose={() => setMostrarCompartilhar(false)}
          escala={proximaEscalaComNomes}
          voluntario={voluntarios.find(v => v.id === proximaEscalaComNomes.voluntarioId)}
          ministerio={ministerios.find(m => m.id === proximaEscalaComNomes.ministerioId)}
        />
      )}

      {/* Modal de Check-In */}
      {proximaEscala && (
        <CheckInModal
          aberto={mostrarCheckIn}
          onClose={() => setMostrarCheckIn(false)}
          escalaId={proximaEscala.id || 0}
          onCheckInSucesso={() => {
            // Recarregar dados se necessário
          }}
        />
      )}
    </Layout>
  );
}
