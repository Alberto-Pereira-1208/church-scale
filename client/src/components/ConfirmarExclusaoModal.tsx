import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Escala } from '@/lib/db';

export interface ConfirmarExclusaoModalProps {
  aberto: boolean;
  escala: Escala | null;
  onConfirmar: (motivo: string, descricao: string, nomeServoTroca?: string) => void;
  onCancelar: () => void;
}

const MOTIVOS = [
  { valor: 'cancelamento', label: '🚫 Cancelamento do Evento', descricao: 'O evento foi cancelado' },
  { valor: 'troca', label: '🔄 Troca de Escala', descricao: 'A escala foi trocada com outro voluntário' },
  { valor: 'erro', label: '⚠️ Erro no Cadastro', descricao: 'Houve um erro ao cadastrar a escala' },
  { valor: 'pessoal', label: '👤 Motivo Pessoal', descricao: 'Motivo pessoal do voluntário' },
  { valor: 'outro', label: '❓ Outro', descricao: 'Outro motivo (descrever abaixo)' },
];

export const ConfirmarExclusaoModal = ({
  aberto,
  escala,
  onConfirmar,
  onCancelar,
}: ConfirmarExclusaoModalProps) => {
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [nomeServo, setNomeServo] = useState<string>('');
  const [descricaoOutro, setDescricaoOutro] = useState<string>('');

  const handleConfirmar = () => {
    if (!motivoSelecionado) {
      alert('Por favor, selecione um motivo');
      return;
    }

    if (motivoSelecionado === 'troca' && !nomeServo.trim()) {
      alert('Por favor, digite o nome do servo que está trocando a escala');
      return;
    }

    if (motivoSelecionado === 'outro' && !descricaoOutro.trim()) {
      alert('Por favor, descreva o motivo da exclusão');
      return;
    }

    const descricao = motivoSelecionado === 'outro' ? descricaoOutro : '';
    onConfirmar(motivoSelecionado, descricao, nomeServo || undefined);

    // Limpar estado
    setMotivoSelecionado('');
    setNomeServo('');
    setDescricaoOutro('');
  };

  const motivo = MOTIVOS.find(m => m.valor === motivoSelecionado);

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onCancelar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Confirmar Exclusão de Escala
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Registre o motivo da exclusão.
          </DialogDescription>
        </DialogHeader>

        {escala && (
          <Card className="p-4 bg-red-950/20 border-red-800">
            <div className="space-y-2 text-sm">
              <div className="font-semibold">ESCALA A SER EXCLUÍDA</div>
              <div className="text-red-100">
                {escala.voluntarioId ? `Voluntário: ${escala.voluntarioId}` : 'N/A'}
              </div>
              <div>
                📅 {new Date(escala.data).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                })} às {escala.horario}
              </div>
              <div>🎯 {escala.funcao}</div>
              <div>🎪 {escala.evento}</div>
            </div>
          </Card>
        )}

        <Card className="p-4 bg-yellow-950/20 border-yellow-800">
          <div className="space-y-2 text-sm text-yellow-100">
            <div className="font-semibold flex items-center gap-2">
              ⚠️ Atenção
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>O histórico de check-in será preservado</li>
              <li>A exclusão será registrada permanentemente</li>
              <li>Não será possível recuperar a escala</li>
              <li>O motivo será rastreado para auditoria</li>
            </ul>
          </div>
        </Card>

        <div className="space-y-4">
          <div>
            <Label htmlFor="motivo" className="text-sm font-medium">
              Motivo da Exclusão <span className="text-red-500">*</span>
            </Label>
            <Select value={motivoSelecionado} onValueChange={setMotivoSelecionado}>
              <SelectTrigger id="motivo" className="mt-2">
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS.map((m) => (
                  <SelectItem key={m.valor} value={m.valor}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {motivo && (
              <p className="text-xs text-gray-400 mt-1">{motivo.descricao}</p>
            )}
          </div>

          {motivoSelecionado === 'troca' && (
            <div>
              <Label htmlFor="nomeServo" className="text-sm font-medium">
                Nome do Servo que está Trocando <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomeServo"
                placeholder="Digite o nome do servo que está trocando a escala"
                value={nomeServo}
                onChange={(e) => setNomeServo(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Identifique com quem a escala está sendo trocada
              </p>
            </div>
          )}

          {motivoSelecionado === 'outro' && (
            <div>
              <Label htmlFor="descricao" className="text-sm font-medium">
                Descrição do Motivo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="descricao"
                placeholder="Descreva o motivo da exclusão"
                value={descricaoOutro}
                onChange={(e) => setDescricaoOutro(e.target.value)}
                maxLength={500}
                className="mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                {descricaoOutro.length}/500 caracteres
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={!motivoSelecionado}
          >
            Excluir Escala
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
