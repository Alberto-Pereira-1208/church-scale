import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface JustificativaExclusaoModalProps {
  aberto: boolean;
  onClose: () => void;
  escala?: {
    funcao: string;
    evento: string;
    data: string;
    horario: string;
  };
  onConfirmar: (justificativa: string) => Promise<void>;
}

export const JustificativaExclusaoModal: React.FC<JustificativaExclusaoModalProps> = ({
  aberto,
  onClose,
  escala,
  onConfirmar,
}) => {
  const [justificativa, setJustificativa] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const handleConfirmar = async () => {
    if (!justificativa.trim()) {
      toast.error('Preencha a justificativa');
      return;
    }

    try {
      setCarregando(true);
      await onConfirmar(justificativa);
      toast.success('Justificativa registrada com sucesso');
      setJustificativa('');
      onClose();
    } catch (erro) {
      console.error('Erro ao registrar justificativa:', erro);
      toast.error('Erro ao registrar justificativa');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertCircle size={20} className="text-yellow-500" />
            Justificar Exclusão
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Explique o motivo da exclusão desta escala
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Escala */}
          {escala && (
            <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
              <div className="text-sm">
                <span className="font-medium text-foreground">Função:</span>
                <span className="text-foreground/70 ml-2">{escala.funcao}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Evento:</span>
                <span className="text-foreground/70 ml-2">{escala.evento}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Data/Hora:</span>
                <span className="text-foreground/70 ml-2">
                  {escala.data} às {escala.horario}
                </span>
              </div>
            </div>
          )}

          {/* Campo de Justificativa */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Justificativa * ({justificativa.length}/500)
            </label>
            <Textarea
              placeholder="Explique detalhadamente por que esta escala foi excluída..."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value.slice(0, 500))}
              className="bg-secondary border-border min-h-24 resize-none"
              disabled={carregando}
            />
            <p className="text-xs text-foreground/60 mt-2">
              Máximo 500 caracteres
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              ⚠️ Esta justificativa será registrada permanentemente e não poderá ser editada.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={carregando}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={!justificativa.trim() || carregando}
              className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Justificativa'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
