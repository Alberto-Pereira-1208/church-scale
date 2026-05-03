import { Card } from '@/components/ui/card';
import { RegistroExclusao } from '@/lib/db';
import { Trash2, AlertCircle } from 'lucide-react';

export interface SecaoExclusoesProps {
  exclusoes: RegistroExclusao[];
}

const MOTIVOS_LABELS: Record<string, { label: string; emoji: string; cor: string }> = {
  cancelamento: {
    label: 'Cancelamento do Evento',
    emoji: '🚫',
    cor: 'bg-red-500/5 border-red-500/30',
  },
  troca: {
    label: 'Troca de Escala',
    emoji: '🔄',
    cor: 'bg-blue-500/5 border-blue-500/30',
  },
  erro: {
    label: 'Erro no Cadastro',
    emoji: '⚠️',
    cor: 'bg-yellow-500/5 border-yellow-500/30',
  },
  pessoal: {
    label: 'Motivo Pessoal',
    emoji: '👤',
    cor: 'bg-purple-500/5 border-purple-500/30',
  },
  outro: {
    label: 'Outro',
    emoji: '❓',
    cor: 'bg-gray-500/5 border-gray-500/30',
  },
};

export const SecaoExclusoes = ({ exclusoes }: SecaoExclusoesProps) => {
  if (!exclusoes || exclusoes.length === 0) {
    return null;
  }

  const formatarData = (dataISO: string, horario: string): string => {
    const data = new Date(dataISO + 'T00:00:00');
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = dias[data.getDay()];
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');

    return `${diaSemana}, ${dia}/${mes} às ${horario}`;
  };

  const formatarDataDeletada = (timestamp: number): string => {
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Trash2 size={20} className="text-red-400" />
        <h2 className="text-lg font-bold text-foreground">Escalas Excluídas</h2>
        <span className="text-sm text-foreground/60 ml-auto">{exclusoes.length} exclusão(ões)</span>
      </div>

      <div className="space-y-2">
        {exclusoes.map((exclusao) => {
          const motivo = MOTIVOS_LABELS[exclusao.motivo] || MOTIVOS_LABELS.outro;

          return (
            <Card
              key={exclusao.id}
              className={`border p-4 transition-all ${motivo.cor} hover:bg-opacity-20`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Data e Hora */}
                <div>
                  <p className="text-sm text-foreground/60">Data e Hora</p>
                  <p className="font-semibold text-foreground">
                    {formatarData(exclusao.dataEscala, exclusao.horarioEscala)}
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    Excluída em: {formatarDataDeletada(exclusao.deletadoEm)}
                  </p>
                </div>

                {/* Motivo */}
                <div>
                  <p className="text-sm text-foreground/60">Motivo</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{motivo.emoji}</span>
                    <span className="font-semibold text-foreground">{motivo.label}</span>
                  </div>
                </div>

                {/* Evento e Função */}
                <div>
                  <p className="text-sm text-foreground/60">Evento</p>
                  <p className="text-foreground text-sm font-medium">{exclusao.evento}</p>
                  <p className="text-xs text-foreground/60 mt-1">Função: {exclusao.funcao}</p>
                </div>

                {/* Detalhes Adicionais */}
                {(exclusao.nomeServoTroca || exclusao.descricao) && (
                  <div className="md:col-span-3">
                    <div className="flex items-start gap-2 p-2 bg-foreground/5 rounded border border-foreground/10">
                      <AlertCircle size={16} className="text-foreground/60 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-foreground/80 flex-1">
                        {exclusao.nomeServoTroca && (
                          <p className="mb-1">
                            <span className="font-semibold">Trocou com:</span> {exclusao.nomeServoTroca}
                          </p>
                        )}
                        {exclusao.descricao && (
                          <p>
                            <span className="font-semibold">Descrição:</span> {exclusao.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
