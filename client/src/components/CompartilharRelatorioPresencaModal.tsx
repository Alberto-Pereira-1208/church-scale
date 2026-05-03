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
  gerarTextoRelatorioPresenca,
  copiarParaClipboard,
  gerarURLWhatsApp,
  gerarURLEmail,
  gerarURLSMS,
  DadosRelatorioPresenca,
} from '@/lib/compartilhamento';
import { Copy, MessageCircle, Mail, MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface CompartilharRelatorioPresencaModalProps {
  aberto: boolean;
  onClose: () => void;
  dados: DadosRelatorioPresenca;
}

export const CompartilharRelatorioPresencaModal: React.FC<
  CompartilharRelatorioPresencaModalProps
> = ({ aberto, onClose, dados }) => {
  const [copiado, setCopiado] = useState(false);
  const texto = gerarTextoRelatorioPresenca(dados);

  const handleCopiar = async () => {
    const sucesso = await copiarParaClipboard(texto);
    if (sucesso) {
      setCopiado(true);
      toast.success('✅ Relatório copiado!');
      setTimeout(() => setCopiado(false), 2000);
    } else {
      toast.error('Erro ao copiar');
    }
  };

  const handleCompartilharWhatsApp = () => {
    const url = gerarURLWhatsApp(texto);
    window.open(url, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  const handleCompartilharEmail = () => {
    const url = gerarURLEmail(
      texto,
      `Relatório de Presença - ${dados.voluntarioNome} (${dados.mesAno})`
    );
    window.location.href = url;
    toast.success('Abrindo email...');
  };

  const handleCompartilharSMS = () => {
    const url = gerarURLSMS(texto);
    window.location.href = url;
    toast.success('Abrindo SMS...');
  };

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Share2 size={24} className="text-accent" />
            Compartilhar Relatório de Presença
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            {dados.voluntarioNome} - {dados.mesAno}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview do Texto */}
          <Card className="bg-secondary/20 border-border p-4">
            <p className="text-sm text-foreground/60 mb-2">Preview:</p>
            <div className="bg-background/50 rounded p-3 text-xs text-foreground/80 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
              {texto}
            </div>
          </Card>

          {/* Opções de Compartilhamento */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground mb-3">Compartilhar via:</p>

            <Button
              onClick={handleCopiar}
              className={`w-full justify-start gap-2 ${
                copiado
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
              variant="outline"
            >
              <Copy size={18} />
              {copiado ? 'Copiado!' : 'Copiar para Clipboard'}
            </Button>

            <Button
              onClick={handleCompartilharWhatsApp}
              className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle size={18} />
              WhatsApp
            </Button>

            <Button
              onClick={handleCompartilharEmail}
              className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail size={18} />
              Email
            </Button>

            <Button
              onClick={handleCompartilharSMS}
              className="w-full justify-start gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <MessageSquare size={18} />
              SMS
            </Button>
          </div>

          {/* Informações do Relatório */}
          <Card className="bg-secondary/10 border-border p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground/60">Total de Escalas</p>
                <p className="text-xl font-bold text-accent">{dados.total}</p>
              </div>
              <div>
                <p className="text-foreground/60">Taxa de Presença</p>
                <p className="text-xl font-bold text-green-400">{dados.percentualPresenca}%</p>
              </div>
              <div>
                <p className="text-foreground/60">Presenças</p>
                <p className="text-xl font-bold text-green-400">{dados.presencas}</p>
              </div>
              <div>
                <p className="text-foreground/60">Faltas</p>
                <p className="text-xl font-bold text-red-400">{dados.faltas}</p>
              </div>
            </div>
          </Card>

          {/* Botão Fechar */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-border"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
