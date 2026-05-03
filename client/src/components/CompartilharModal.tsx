import React, { useState } from 'react';
import { Escala, Voluntario, Ministerio } from '@/lib/db';
import {
  gerarTextoEscala,
  copiarParaClipboard,
  gerarURLWhatsApp,
  gerarURLEmail,
  gerarURLSMS,
  temCompartilhamentoNativo,
  compartilharNativo,
} from '@/lib/compartilhamento';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Copy,
  MessageCircle,
  Mail,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompartilharModalProps {
  aberto: boolean;
  onClose: () => void;
  escala: Escala;
  voluntario?: Voluntario;
  ministerio?: Ministerio;
}

export const CompartilharModal: React.FC<CompartilharModalProps> = ({
  aberto,
  onClose,
  escala,
  voluntario,
  ministerio,
}) => {
  const [copiado, setCopiado] = useState(false);

  const texto = gerarTextoEscala({ escala, voluntario, ministerio });
  const temCompartilhamento = temCompartilhamentoNativo();

  const handleCopiar = async () => {
    const sucesso = await copiarParaClipboard(texto);
    if (sucesso) {
      setCopiado(true);
      toast.success('Texto copiado para a área de transferência!');
      setTimeout(() => setCopiado(false), 2000);
    } else {
      toast.error('Erro ao copiar texto');
    }
  };

  const handleCompartilharNativo = async () => {
    const sucesso = await compartilharNativo(texto, 'Escala de Serviço');
    if (sucesso) {
      toast.success('Compartilhado com sucesso!');
      onClose();
    }
  };

  const handleWhatsApp = () => {
    const url = gerarURLWhatsApp(texto);
    window.open(url, '_blank');
    toast.success('Abrindo WhatsApp...');
    onClose();
  };

  const handleEmail = () => {
    const url = gerarURLEmail(texto);
    window.location.href = url;
    toast.success('Abrindo cliente de email...');
    onClose();
  };

  const handleSMS = () => {
    const url = gerarURLSMS(texto);
    window.location.href = url;
    toast.success('Abrindo SMS...');
    onClose();
  };

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Compartilhar Escala</DialogTitle>
          <DialogDescription className="text-foreground/60">
            Escolha como deseja compartilhar esta escala
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview do texto */}
          <div>
            <label className="text-xs text-foreground/60 mb-2 block">TEXTO A COMPARTILHAR</label>
            <Textarea
              value={texto}
              readOnly
              className="bg-input border-border text-foreground font-mono text-sm"
              rows={10}
            />
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCopiar}
              variant="outline"
              className={`border-border ${copiado ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <Copy size={18} className="mr-2" />
              {copiado ? 'Copiado!' : 'Copiar'}
            </Button>

            <Button
              onClick={handleWhatsApp}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <MessageCircle size={18} className="mr-2" />
              WhatsApp
            </Button>

            <Button
              onClick={handleEmail}
              variant="outline"
              className="border-border"
            >
              <Mail size={18} className="mr-2" />
              Email
            </Button>

            <Button
              onClick={handleSMS}
              variant="outline"
              className="border-border"
            >
              <MessageSquare size={18} className="mr-2" />
              SMS
            </Button>

            {temCompartilhamento && (
              <Button
                onClick={handleCompartilharNativo}
                className="bg-accent text-accent-foreground hover:bg-accent/90 col-span-2"
              >
                <Share2 size={18} className="mr-2" />
                Compartilhar (Nativo)
              </Button>
            )}
          </div>

          {/* Dica */}
          <div className="bg-secondary/20 rounded-lg p-3 border border-accent/10">
            <p className="text-xs text-foreground/60">
              💡 <strong>Dica:</strong> Clique em "Copiar" para copiar o texto e compartilhar manualmente em qualquer aplicativo.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
