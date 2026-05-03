import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  criarJustificativa,
  validarJustificativa,
  MOTIVOS_FALTA,
  Justificativa,
} from '@/lib/justificativas';

interface JustificativaFaltaModalProps {
  aberto: boolean;
  onClose: () => void;
  registroPresencaId: number;
  escalaId: number;
  voluntarioId: number;
  voluntarioNome: string;
  dataEscala: string;
  horarioEscala: string;
  onJustificativaSalva?: (justificativa: Justificativa) => void;
}

export const JustificativaFaltaModal: React.FC<JustificativaFaltaModalProps> = ({
  aberto,
  onClose,
  registroPresencaId,
  escalaId,
  voluntarioId,
  voluntarioNome,
  dataEscala,
  horarioEscala,
  onJustificativaSalva,
}) => {
  const [motivo, setMotivo] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  const handleSalvarJustificativa = async () => {
    setErros([]);

    // Criar justificativa
    const justificativa = criarJustificativa(
      registroPresencaId,
      escalaId,
      voluntarioId,
      motivo,
      descricao
    );

    // Validar
    const validacao = validarJustificativa(justificativa);
    if (!validacao.valido) {
      setErros(validacao.erros);
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      setCarregando(true);

      // Aqui você salvaria no banco de dados
      // await db.justificativas.add(justificativa);

      toast.success('✅ Justificativa enviada com sucesso!');
      if (onJustificativaSalva) {
        onJustificativaSalva(justificativa);
      }

      // Limpar formulário
      setMotivo('');
      setDescricao('');
      onClose();
    } catch (erro) {
      console.error('Erro ao salvar justificativa:', erro);
      toast.error('Erro ao salvar justificativa');
    } finally {
      setCarregando(false);
    }
  };

  const dataFormatada = new Date(dataEscala + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const motioSelecionado = MOTIVOS_FALTA.find(m => m.id === motivo);

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <AlertCircle size={24} className="text-yellow-400" />
            Justificar Falta
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Explique o motivo da sua falta nesta escala
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Escala */}
          <Card className="bg-secondary/20 border-accent/20 p-4">
            <div className="space-y-2">
              <p className="text-sm text-foreground/60">ESCALA</p>
              <p className="font-semibold text-foreground">{voluntarioNome}</p>
              <p className="text-sm text-foreground/80">
                📅 {dataFormatada} às {horarioEscala}
              </p>
            </div>
          </Card>

          {/* Erros */}
          {erros.length > 0 && (
            <Card className="bg-red-500/10 border-red-500/30 p-4">
              <div className="space-y-2">
                {erros.map((erro, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-1 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{erro}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Motivo */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Motivo da Falta *
            </label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                {MOTIVOS_FALTA.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {motioSelecionado && (
              <p className="text-xs text-foreground/60 mt-2">{motioSelecionado.descricao}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Descrição Detalhada * ({descricao.length}/500)
            </label>
            <Textarea
              placeholder="Explique detalhadamente o motivo da sua falta..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value.slice(0, 500))}
              className="bg-secondary border-border min-h-24 resize-none"
            />
            <p className="text-xs text-foreground/60 mt-2">
              Mínimo 10 caracteres, máximo 500 caracteres
            </p>
          </div>

          {/* Aviso */}
          <Card className="bg-blue-500/10 border-blue-500/30 p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <div className="text-sm text-foreground/80">
                <p className="font-semibold text-blue-400 mb-1">Informações Importantes</p>
                <ul className="space-y-1 text-xs">
                  <li>• Sua justificativa será analisada pela liderança</li>
                  <li>• Justificativas completas têm maior chance de aprovação</li>
                  <li>• Você receberá notificação quando a decisão for tomada</li>
                  <li>• Faltas justificadas não afetam sua taxa de presença</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-border flex-1"
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarJustificativa}
              disabled={!motivo || descricao.length < 10 || carregando}
              className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1"
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} className="mr-2" />
                  Enviar Justificativa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
