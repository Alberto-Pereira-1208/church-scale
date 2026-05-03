import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db, Notificacao, Escala, formatarData } from '@/lib/db';
import { Bell, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface NotificacaoComEscala extends Notificacao {
  escala?: Escala;
}

const tiposNotificacao = {
  'tres_dias': '3 dias antes',
  'um_dia': '1 dia antes',
  'manha': 'Manhã do dia',
  'uma_hora': '1 hora antes',
  'checkin_60min': 'Check-In 60 min antes',
};

export default function HistoricoNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoComEscala[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      setCarregando(true);
      const notif = await db.notificacoes.toArray();
      const notifComEscala: NotificacaoComEscala[] = [];

      for (const n of notif) {
        const escala = await db.escalas.get(n.escalaId);
        notifComEscala.push({ ...n, escala });
      }

      // Ordenar por data de envio (mais recentes primeiro)
      notifComEscala.sort((a, b) => {
        const dataA = a.dataEnvio || 0;
        const dataB = b.dataEnvio || 0;
        return dataB - dataA;
      });

      setNotificacoes(notifComEscala);
    } catch (erro) {
      console.error('Erro ao carregar notificações:', erro);
      toast.error('Erro ao carregar histórico');
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparHistorico = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico de notificações?')) return;

    try {
      await db.notificacoes.clear();
      setNotificacoes([]);
      toast.success('Histórico limpo com sucesso');
    } catch (erro) {
      console.error('Erro ao limpar histórico:', erro);
      toast.error('Erro ao limpar histórico');
    }
  };

  const handleDeletarNotificacao = async (id: number) => {
    try {
      await db.notificacoes.delete(id);
      setNotificacoes(notificacoes.filter(n => n.id !== id));
      toast.success('Notificação removida');
    } catch (erro) {
      console.error('Erro ao deletar notificação:', erro);
      toast.error('Erro ao deletar notificação');
    }
  };

  if (carregando) {
    return (
      <Layout currentPage="historico">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Bell className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
            <p className="text-foreground/60">Carregando histórico...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="historico">
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Bell className="text-accent" size={32} />
            Histórico de Notificações
          </h1>
          <p className="text-sm md:text-base text-foreground/60">
            Visualize todas as notificações de Check-In e escalas já enviadas
          </p>
        </div>

        {notificacoes.length === 0 ? (
          <Card className="bg-card border-2 border-card-foreground/10 p-6 md:p-8 text-center">
            <Bell className="w-16 h-16 text-accent/50 mx-auto mb-4" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2">
              Nenhuma notificação ainda
            </h2>
            <p className="text-sm md:text-base text-foreground/60">
              As notificações aparecerão aqui conforme forem enviadas
            </p>
          </Card>
        ) : (
          <>
            {/* Filtro por tipo */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="text-sm text-foreground/60">Total: {notificacoes.length}</span>
              <span className="text-sm text-foreground/60">
                Enviadas: {notificacoes.filter(n => n.enviada).length}
              </span>
            </div>

            {/* Lista de notificações */}
            <div className="space-y-3">
              {notificacoes.map((notif) => (
                <Card
                  key={notif.id}
                  className="bg-card border-2 border-card-foreground/10 p-4 md:p-6 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Tipo de notificação */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded">
                          {tiposNotificacao[notif.tipo as keyof typeof tiposNotificacao] || notif.tipo}
                        </span>
                        {notif.enviada && (
                          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                            ✓ Enviada
                          </span>
                        )}
                      </div>

                      {/* Informações da escala */}
                      {notif.escala ? (
                        <>
                          <p className="text-sm md:text-base font-semibold text-foreground mb-1">
                            {notif.escala.evento}
                          </p>
                          <div className="text-xs md:text-sm text-foreground/70 space-y-1">
                            <p className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatarData(notif.escala.data, notif.escala.horario)}
                            </p>
                            <p>🎯 {notif.escala.funcao}</p>
                            {notif.dataEnvio && (
                              <p className="text-foreground/50">
                                Enviada em: {new Date(notif.dataEnvio).toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-foreground/60 italic">Escala não encontrada</p>
                      )}
                    </div>

                    {/* Botão deletar */}
                    <Button
                      onClick={() => notif.id && handleDeletarNotificacao(notif.id)}
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive/10 flex-shrink-0"
                      title="Deletar notificação"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Botão limpar histórico */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLimparHistorico}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} className="mr-2" />
                Limpar Histórico
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
