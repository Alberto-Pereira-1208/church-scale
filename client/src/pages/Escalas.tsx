import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { formatarData } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Eye, CheckCircle2, Share2, MapPin, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { CompartilharModal } from '@/components/CompartilharModal';
import { CompartilharTodasModal } from '@/components/CompartilharTodasModal';
import { CheckInModal } from '@/components/CheckInModal';
import { DuplicarEscalaModal } from '@/components/DuplicarEscalaModal';
import { ConfirmarExclusaoModal } from '@/components/ConfirmarExclusaoModal';
import { JustificativaExclusaoModal } from '@/components/JustificativaExclusaoModal';
import { registrarExclusao } from '@/lib/db';
import { registrarJustificativaExclusao } from '@/lib/justificativaExclusao';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Escalas() {
  const [, navigate] = useLocation();
  const { escalas, voluntarios, ministerios, deletarEscala, atualizarEscala, adicionarEscala, carregando } = useApp();
  const [escalaSelecionada, setEscalaSelecionada] = useState<any>(null);
  const [escalaParaCompartilhar, setEscalaParaCompartilhar] = useState<any>(null);
  const [escalaParaCheckIn, setEscalaParaCheckIn] = useState<any>(null);
  const [escalaDuplicar, setEscalaDuplicar] = useState<any>(null);
  const [compartilharTodas, setCompartilharTodas] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'concluidas'>('pendentes');
  const [escalaParaExcluir, setEscalaParaExcluir] = useState<any>(null);
  const [mostrarJustificativa, setMostrarJustificativa] = useState(false);
  const [ultimoRegistroExclusaoId, setUltimoRegistroExclusaoId] = useState<number | null>(null);
  const [ultimaEscalaExcluida, setUltimaEscalaExcluida] = useState<any>(null);

  const escalasComNomes = useMemo(() => {
    return escalas.map(e => ({
      ...e,
      voluntarioNome: voluntarios.find(v => v.id === e.voluntarioId)?.nome || 'N/A',
      ministerioNome: ministerios.find(m => m.id === e.ministerioId)?.nome || 'N/A',
    }));
  }, [escalas, voluntarios, ministerios]);

  const escalasFiltradasOrdanadas = escalasComNomes
    .filter(e => {
      if (filtro === 'pendentes') return !e.concluida;
      if (filtro === 'concluidas') return e.concluida;
      return true;
    })
    .sort((a, b) => a.data.localeCompare(b.data));

  const handleDeletar = (escala: any) => {
    setEscalaParaExcluir(escala);
  };

  const handleConfirmarExclusao = async (motivo: string, descricao?: string, nomeServoTroca?: string) => {
    if (!escalaParaExcluir) return;
    try {
      // Registrar exclusão no histórico
      const registroId = await registrarExclusao(
        escalaParaExcluir.id,
        escalaParaExcluir.voluntarioId,
        escalaParaExcluir.ministerioId,
        escalaParaExcluir.funcao,
        escalaParaExcluir.evento,
        escalaParaExcluir.data,
        escalaParaExcluir.horario,
        motivo as 'cancelamento' | 'troca' | 'erro' | 'pessoal' | 'outro',
        descricao,
        nomeServoTroca
      );

      // Deletar escala
      await deletarEscala(escalaParaExcluir.id);
      toast.success('Escala excluída com sucesso');
      
      // Armazenar dados para justificativa
      setUltimoRegistroExclusaoId(registroId);
      setUltimaEscalaExcluida(escalaParaExcluir);
      setEscalaParaExcluir(null);
      
      // Mostrar modal de justificativa
      setMostrarJustificativa(true);
    } catch (erro) {
      console.error('Erro ao excluir escala:', erro);
      toast.error('Erro ao excluir escala');
    }
  };

  const handleConfirmarJustificativa = async (justificativa: string) => {
    if (!ultimoRegistroExclusaoId) return;
    try {
      await registrarJustificativaExclusao(ultimoRegistroExclusaoId, justificativa);
      toast.success('Justificativa registrada com sucesso');
      setMostrarJustificativa(false);
      setUltimoRegistroExclusaoId(null);
      setUltimaEscalaExcluida(null);
    } catch (erro) {
      console.error('Erro ao registrar justificativa:', erro);
      toast.error('Erro ao registrar justificativa');
    }
  };

  const handleMarcarConcluida = async (escala: any) => {
    try {
      await atualizarEscala(escala.id, { concluida: !escala.concluida });
      toast.success(escala.concluida ? 'Marcada como pendente' : 'Escala finalizada com sucesso 🙌');
    } catch (erro) {
      toast.error('Erro ao atualizar escala');
    }
  };

  if (carregando) {
    return (
      <Layout currentPage="escalas">
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground/60">Carregando escalas...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="escalas">
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Escalas</h1>
            <p className="text-sm md:text-base text-foreground/60">Gerenciamento de todas as escalas de serviço</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={() => setCompartilharTodas(true)}
              variant="outline"
              className="flex-1 md:flex-none text-xs md:text-base"
            >
              <Share2 size={18} className="mr-2" />
              Compartilhar Todas
            </Button>
            <Button
              onClick={() => navigate('/escalas/nova')}
              className="flex-1 md:flex-none bg-accent text-accent-foreground hover:bg-accent/90 text-xs md:text-base"
            >
              <Plus size={18} className="mr-2" />
              Nova Escala
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['todas', 'pendentes', 'concluidas'] as const).map(f => (
            <Button
              key={f}
              onClick={() => setFiltro(f)}
              variant={filtro === f ? 'default' : 'outline'}
              className={`text-xs md:text-sm whitespace-nowrap ${filtro === f ? 'bg-accent text-accent-foreground' : 'border-border'}`}
            >
              {f === 'todas' && 'Todas'}
              {f === 'pendentes' && 'Pendentes'}
              {f === 'concluidas' && 'Concluídas'}
            </Button>
          ))}
        </div>

        {/* Lista de Escalas */}
        {escalasFiltradasOrdanadas.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {escalasFiltradasOrdanadas.map(escala => (
              <Card
                key={escala.id}
                className={`border-2 p-3 md:p-4 cursor-pointer transition-all duration-200 ${
                  escala.concluida
                    ? 'border-border bg-secondary/20 opacity-60'
                    : 'border-border hover:border-accent'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                  <div className="flex-1 w-full" onClick={() => setEscalaSelecionada(escala)}>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        {formatarData(escala.data, escala.horario)}
                      </h3>
                      <div className="flex gap-2">
                        {escala.pronto && (
                          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded">
                            ✓ Pronto
                          </span>
                        )}
                        {escala.concluida && (
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded">
                            ✓ Concluída
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-foreground/80 mb-1">
                      <span className="font-semibold">Voluntário:</span> {escala.voluntarioNome || 'N/A'}
                    </p>
                    <p className="text-xs md:text-sm text-foreground/80 mb-1">
                      <span className="font-semibold">Ministério:</span> {escala.ministerioNome || 'N/A'}
                    </p>
                    <p className="text-xs md:text-sm text-foreground/80 mb-1">
                      <span className="font-semibold">Função:</span> {escala.funcao}
                    </p>
                    <p className="text-xs md:text-sm text-foreground/80">
                      <span className="font-semibold">Evento:</span> {escala.evento}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-1 md:gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                    <Button
                      onClick={() => setEscalaSelecionada(escala)}
                      variant="outline"
                      size="sm"
                      className="border-border"
                    >
                      <Eye size={16} />
                    </Button>
                    {!escala.concluida && (
                      <>
                        <Button
                          onClick={() => navigate(`/escalas/editar?id=${escala.id}`)}
                          variant="outline"
                          size="sm"
                          className="border-accent text-accent"
                          title="Editar"
                        >
                          ✏️
                        </Button>
                        <Button
                          onClick={() => handleMarcarConcluida(escala)}
                          variant="outline"
                          size="sm"
                          className="border-accent text-accent"
                        >
                          <CheckCircle2 size={16} />
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => setEscalaParaCheckIn(escala)}
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent"
                      title="Check-In"
                    >
                      <MapPin size={16} />
                    </Button>
                    <Button
                      onClick={() => setEscalaParaCompartilhar(escala)}
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent"
                    >
                      <Share2 size={16} />
                    </Button>
                    {!escala.concluida && (
                      <Button
                        onClick={() => setEscalaDuplicar(escala)}
                        variant="outline"
                        size="sm"
                        className="border-accent text-accent"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeletar(escala)}
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border border-border p-6 md:p-8 text-center">
            <p className="text-sm md:text-base text-foreground/60 mb-4">Nenhuma escala encontrada</p>
            <Button
              onClick={() => navigate('/escalas/nova')}
              className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-sm md:text-base"
            >
              <Plus size={18} className="mr-2" />
              Criar primeira escala
            </Button>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!escalaSelecionada} onOpenChange={() => setEscalaSelecionada(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          {escalaSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {formatarData(escalaSelecionada.data, escalaSelecionada.horario)}
                </DialogTitle>
                <DialogDescription className="text-foreground/60">
                  Detalhes da escala
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">VOLUNTÁRIO</p>
                  <p className="text-foreground font-semibold">{escalaSelecionada.voluntarioNome || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">MINISTÉRIO</p>
                  <p className="text-foreground font-semibold">{escalaSelecionada.ministerioNome || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">FUNÇÃO</p>
                  <p className="text-foreground font-semibold">{escalaSelecionada.funcao}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">EVENTO</p>
                  <p className="text-foreground font-semibold">{escalaSelecionada.evento}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">O QUE LEVAR</p>
                  <p className="text-foreground">{escalaSelecionada.oQueLevar || 'Nada especificado'}</p>
                </div>
                {escalaSelecionada.observacoes && (
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">OBSERVAÇÕES</p>
                    <p className="text-foreground">{escalaSelecionada.observacoes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 flex-wrap">
                <Button
                  onClick={() => {
                    setEscalaSelecionada(null);
                    navigate(`/escalas/editar?id=${escalaSelecionada.id}`);
                  }}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1 min-w-[100px]"
                >
                  Editar
                </Button>
                {!escalaSelecionada.concluida && (
                  <Button
                    onClick={() => {
                      setEscalaDuplicar(escalaSelecionada);
                      setEscalaSelecionada(null);
                    }}
                    variant="outline"
                    className="border-accent text-accent flex-1 min-w-[100px]"
                  >
                    <Copy size={16} className="mr-2" />
                    Duplicar
                  </Button>
                )}
                <Button
                  onClick={() => {
                    handleDeletar(escalaSelecionada.id);
                    setEscalaSelecionada(null);
                  }}
                  variant="outline"
                  className="border-destructive text-destructive flex-1 min-w-[100px]"
                >
                  Deletar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      {escalaParaCompartilhar && (
        <CompartilharModal
          aberto={!!escalaParaCompartilhar}
          onClose={() => setEscalaParaCompartilhar(null)}
          escala={escalaParaCompartilhar}
          voluntario={voluntarios.find(v => v.id === escalaParaCompartilhar.voluntarioId)}
          ministerio={ministerios.find(m => m.id === escalaParaCompartilhar.ministerioId)}
        />
      )}

      {/* Modal de Check-In */}
      {escalaParaCheckIn && (
        <CheckInModal
          aberto={!!escalaParaCheckIn}
          onClose={() => setEscalaParaCheckIn(null)}
          escalaId={escalaParaCheckIn.id || 0}
        />
      )}

      {/* Modal de Duplicar */}
      {escalaDuplicar && (
        <DuplicarEscalaModal
          aberto={!!escalaDuplicar}
          escala={escalaDuplicar}
          voluntarios={voluntarios}
          onDuplicar={adicionarEscala}
          onFechar={() => setEscalaDuplicar(null)}
        />
      )}

      {/* Modal de Compartilhar Todas */}
      {compartilharTodas && (
        <CompartilharTodasModal
          aberto={compartilharTodas}
          onClose={() => setCompartilharTodas(false)}
          escalas={escalas}
          voluntarios={voluntarios}
          ministerios={ministerios}
        />
      )}

      {/* Modal de Confirmar Exclusão */}
      {escalaParaExcluir && (
        <ConfirmarExclusaoModal
          aberto={!!escalaParaExcluir}
          escala={escalaParaExcluir}
          onConfirmar={handleConfirmarExclusao}
          onCancelar={() => setEscalaParaExcluir(null)}
        />
      )}

      {/* Modal de Justificativa Pos-Exclusao */}
      {mostrarJustificativa && ultimaEscalaExcluida && (
        <JustificativaExclusaoModal
          aberto={mostrarJustificativa}
          onClose={() => {
            setMostrarJustificativa(false);
            setUltimoRegistroExclusaoId(null);
            setUltimaEscalaExcluida(null);
          }}
          escala={{
            funcao: ultimaEscalaExcluida.funcao,
            evento: ultimaEscalaExcluida.evento,
            data: ultimaEscalaExcluida.data,
            horario: ultimaEscalaExcluida.horario,
          }}
          onConfirmar={handleConfirmarJustificativa}
        />
      )}
    </Layout>
  );
}
