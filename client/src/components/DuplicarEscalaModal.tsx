import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Escala, Voluntario, formatarData } from '@/lib/db';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DuplicarEscalaModalProps {
  aberto: boolean;
  escala: Escala | null;
  voluntarios: Voluntario[];
  onDuplicar: (novaEscala: Escala) => Promise<void>;
  onFechar: () => void;
}

export const DuplicarEscalaModal: React.FC<DuplicarEscalaModalProps> = ({
  aberto,
  escala,
  voluntarios,
  onDuplicar,
  onFechar,
}) => {
  const [novaData, setNovaData] = useState('');
  const [novoVoluntarioId, setNovoVoluntarioId] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleAbrir = () => {
    if (escala) {
      setNovaData(escala.data);
      setNovoVoluntarioId(escala.voluntarioId.toString());
    }
  };

  const handleFechar = () => {
    setNovaData('');
    setNovoVoluntarioId('');
    onFechar();
  };

  const handleDuplicar = async () => {
    if (!escala || !novaData || !novoVoluntarioId) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setCarregando(true);
      const novaEscala: Escala = {
        ...escala,
        id: undefined,
        data: novaData,
        voluntarioId: parseInt(novoVoluntarioId),
        pronto: false,
        checkInRealizado: false,
        concluida: false,
        criadoEm: Date.now(),
        atualizadoEm: Date.now(),
      };

      await onDuplicar(novaEscala);
      handleFechar();
      toast.success('Escala duplicada com sucesso! ✓');
    } catch (erro) {
      console.error('Erro ao duplicar escala:', erro);
      toast.error('Erro ao duplicar escala');
    } finally {
      setCarregando(false);
    }
  };

  if (!escala) return null;

  const voluntarioAtual = voluntarios.find(v => v.id === escala.voluntarioId);

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy size={20} className="text-accent" />
            Duplicar Escala
          </DialogTitle>
          <DialogDescription>
            Crie uma cópia desta escala com data e voluntário diferentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info da escala original */}
          <div className="bg-secondary/20 rounded-lg p-3 border border-accent/10">
            <p className="text-xs text-foreground/60 mb-1">ESCALA ORIGINAL</p>
            <p className="text-sm font-semibold text-foreground mb-2">{escala.evento}</p>
            <p className="text-xs text-foreground/70">
              📅 {formatarData(escala.data, escala.horario)}
            </p>
            <p className="text-xs text-foreground/70">
              👤 {voluntarioAtual?.nome || 'Voluntário desconhecido'}
            </p>
          </div>

          {/* Nova data */}
          <div className="space-y-2">
            <Label htmlFor="nova-data" className="text-sm font-semibold">
              Nova Data
            </Label>
            <Input
              id="nova-data"
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              className="bg-input border-border"
            />
          </div>

          {/* Novo voluntário */}
          <div className="space-y-2">
            <Label htmlFor="novo-voluntario" className="text-sm font-semibold">
              Novo Voluntário
            </Label>
            <Select value={novoVoluntarioId} onValueChange={setNovoVoluntarioId}>
              <SelectTrigger id="novo-voluntario" className="bg-input border-border">
                <SelectValue placeholder="Selecione um voluntário" />
              </SelectTrigger>
              <SelectContent>
                {voluntarios.map((v) => (
                  <SelectItem key={v.id} value={v.id!.toString()}>
                    {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info de dados mantidos */}
          <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
            <p className="text-xs font-semibold text-accent mb-2">✓ Dados mantidos:</p>
            <ul className="text-xs text-foreground/70 space-y-1">
              <li>• Ministério: {escala.ministerioId}</li>
              <li>• Função: {escala.funcao}</li>
              <li>• Horário: {escala.horario}</li>
              <li>• O que levar: {escala.oQueLevar || 'Nenhum'}</li>
            </ul>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          <Button
            onClick={handleFechar}
            variant="outline"
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDuplicar}
            disabled={carregando || !novaData || !novoVoluntarioId}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {carregando ? 'Duplicando...' : 'Duplicar Escala'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
