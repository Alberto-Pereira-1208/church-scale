import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Copy, MessageCircle, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Escala, Voluntario, Ministerio } from '@/lib/db';
import { gerarTextoTodasEscalas, copiarParaClipboard, gerarURLWhatsApp, gerarURLEmail, gerarURLSMS } from '@/lib/compartilhamento';

interface CompartilharTodasModalProps {
  aberto: boolean;
  onClose: () => void;
  escalas: Escala[];
  voluntarios: Voluntario[];
  ministerios: Ministerio[];
}

export const CompartilharTodasModal: React.FC<CompartilharTodasModalProps> = ({
  aberto,
  onClose,
  escalas,
  voluntarios,
  ministerios,
}) => {
  const [copiado, setCopiado] = useState(false);

  const textoCompartilhamento = gerarTextoTodasEscalas(escalas, voluntarios, ministerios);

  const handleCopiar = async () => {
    const sucesso = await copiarParaClipboard(textoCompartilhamento);
    if (sucesso) {
      setCopiado(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopiado(false), 2000);
    } else {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const handleWhatsApp = () => {
    const url = gerarURLWhatsApp(textoCompartilhamento);
    window.open(url, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  const handleEmail = () => {
    const url = gerarURLEmail(textoCompartilhamento, 'Escalas de Serviço - Church Scale');
    window.open(url);
    toast.success('Abrindo cliente de email...');
  };

  const handleSMS = () => {
    const url = gerarURLSMS(textoCompartilhamento);
    window.open(url);
    toast.success('Abrindo SMS...');
  };

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Share2 size={24} className="text-accent" />
            Compartilhar Todas as Escalas
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Compartilhe todas as {escalas.length} escala{escalas.length !== 1 ? 's' : ''} de uma vez
          </DialogDescription>
        </DialogHeader>

        {/* Preview do Texto */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4 max-h-[300px] overflow-y-auto">
          <pre className="text-xs md:text-sm text-foreground whitespace-pre-wrap break-words font-mono">
            {textoCompartilhamento}
          </pre>
        </div>

        {/* Botões de Compartilhamento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            onClick={handleCopiar}
            variant={copiado ? 'default' : 'outline'}
            className={`text-xs md:text-sm ${copiado ? 'bg-green-600 border-green-600' : 'border-accent text-accent'}`}
          >
            <Copy size={16} className="mr-1" />
            {copiado ? 'Copiado!' : 'Copiar'}
          </Button>

          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="text-xs md:text-sm border-green-500 text-green-500 hover:bg-green-500/10"
          >
            <MessageCircle size={16} className="mr-1" />
            WhatsApp
          </Button>

          <Button
            onClick={handleEmail}
            variant="outline"
            className="text-xs md:text-sm border-blue-500 text-blue-500 hover:bg-blue-500/10"
          >
            <Mail size={16} className="mr-1" />
            Email
          </Button>

          <Button
            onClick={handleSMS}
            variant="outline"
            className="text-xs md:text-sm border-purple-500 text-purple-500 hover:bg-purple-500/10"
          >
            <Phone size={16} className="mr-1" />
            SMS
          </Button>
        </div>

        {/* Botão Fechar */}
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border text-foreground"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
