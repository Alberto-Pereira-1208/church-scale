import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { ArrowLeft, Trash2, Download } from 'lucide-react';
import { obterHistoricoExclusoes, RegistroExclusao, formatarData } from '@/lib/db';
import { toast } from 'sonner';

export default function HistoricoExclusoes() {
  const [exclusoes, setExclusoes] = useState<RegistroExclusao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarExclusoes();
  }, []);

  const carregarExclusoes = async () => {
    try {
      setCarregando(true);
      const dados = await obterHistoricoExclusoes();
      setExclusoes(dados);
    } catch (erro) {
      console.error('Erro ao carregar histórico de exclusões:', erro);
      toast.error('Erro ao carregar histórico');
    } finally {
      setCarregando(false);
    }
  };

  const MOTIVOS_LABELS: Record<string, string> = {
    cancelamento: '🚫 Cancelamento do Evento',
    troca: '🔄 Troca de Escala',
    erro: '⚠️ Erro no Cadastro',
    pessoal: '👤 Motivo Pessoal',
    outro: '❓ Outro',
  };

  const exportarCSV = () => {
    const headers = ['Data de Exclusão', 'Hora de Exclusão', 'Escala', 'Data', 'Horário', 'Função', 'Evento', 'Motivo', 'Descrição'];
    const rows = exclusoes.map(e => [
      new Date(e.deletadoEm).toLocaleDateString('pt-BR'),
      new Date(e.deletadoEm).toLocaleTimeString('pt-BR'),
      `${e.dataEscala} ${e.horarioEscala}`,
      e.dataEscala,
      e.horarioEscala,
      e.funcao,
      e.evento,
      MOTIVOS_LABELS[e.motivo] || e.motivo,
      e.descricao || '-',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-exclusoes-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success('Arquivo exportado com sucesso');
  };

  return (
    <Layout currentPage="historico-exclusoes">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.history.back()}
                  className="text-foreground hover:bg-secondary"
                >
                  <ArrowLeft size={20} />
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Histórico de Exclusões</h1>
              </div>
              <Button
                onClick={exportarCSV}
                variant="outline"
                className="border-border"
                disabled={exclusoes.length === 0}
              >
                <Download size={18} className="mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-foreground/60">Carregando histórico...</p>
            </div>
          ) : exclusoes.length === 0 ? (
            <Card className="bg-secondary/20 border-border p-8 text-center">
              <Trash2 size={48} className="mx-auto text-foreground/30 mb-4" />
              <p className="text-foreground/60">Nenhuma exclusão registrada</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Resumo */}
              <Card className="bg-secondary/20 border-border p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-foreground/60">Total de Exclusões</p>
                    <p className="text-2xl font-bold text-foreground">{exclusoes.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Cancelamentos</p>
                    <p className="text-2xl font-bold text-red-400">
                      {exclusoes.filter(e => e.motivo === 'cancelamento').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Trocas</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {exclusoes.filter(e => e.motivo === 'troca').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Erros</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {exclusoes.filter(e => e.motivo === 'erro').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Outros</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {exclusoes.filter(e => e.motivo === 'pessoal' || e.motivo === 'outro').length}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Lista de Exclusões */}
              <div className="space-y-3">
                {exclusoes.map(exclusao => {
                  const dataExclusao = new Date(exclusao.deletadoEm);
                  const dataFormatada = dataExclusao.toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                  const horaFormatada = dataExclusao.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <Card key={exclusao.id} className="bg-secondary/20 border-border p-4 hover:bg-secondary/30 transition">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              {exclusao.funcao} - {exclusao.evento}
                            </p>
                            <p className="text-sm text-foreground/60">
                              📅 {exclusao.dataEscala} às {exclusao.horarioEscala}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-foreground/60">Excluído em</p>
                            <p className="text-sm font-mono text-foreground">
                              {dataFormatada} {horaFormatada}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <span className="px-3 py-1 bg-foreground/10 rounded-full text-sm text-foreground">
                            {MOTIVOS_LABELS[exclusao.motivo] || exclusao.motivo}
                          </span>
                        </div>

                        {exclusao.descricao && (
                          <p className="text-sm text-foreground/70 pt-2 border-t border-border/50">
                            📝 {exclusao.descricao}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
