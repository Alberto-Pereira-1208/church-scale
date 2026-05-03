import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { db } from '@/lib/db';
import { Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PreferencesNotificacoes {
  tres_dias: boolean;
  um_dia: boolean;
  manha: boolean;
  uma_hora: boolean;
  checkin_60min: boolean;
}

const descricoes: Record<keyof PreferencesNotificacoes, { titulo: string; descricao: string }> = {
  tres_dias: {
    titulo: '3 dias antes',
    descricao: 'Receba um lembrete 3 dias antes da escala',
  },
  um_dia: {
    titulo: '1 dia antes',
    descricao: 'Receba um lembrete 1 dia antes da escala',
  },
  manha: {
    titulo: 'Manhã do dia',
    descricao: 'Receba um lembrete pela manhã (8:00) do dia da escala',
  },
  uma_hora: {
    titulo: '1 hora antes',
    descricao: 'Receba um lembrete 1 hora antes da escala começar',
  },
  checkin_60min: {
    titulo: 'Check-In 60 minutos antes',
    descricao: 'Receba um lembrete para fazer Check-In 60 minutos antes do culto',
  },
};

export default function CustomizarNotificacoes() {
  const [preferences, setPreferences] = useState<PreferencesNotificacoes>({
    tres_dias: true,
    um_dia: true,
    manha: true,
    uma_hora: true,
    checkin_60min: true,
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPreferencias();
  }, []);

  const carregarPreferencias = async () => {
    try {
      setCarregando(true);
      const stored = localStorage.getItem('notificacoes_preferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (erro) {
      console.error('Erro ao carregar preferências:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleToggle = (tipo: keyof PreferencesNotificacoes) => {
    setPreferences(prev => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      localStorage.setItem('notificacoes_preferences', JSON.stringify(preferences));
      toast.success('Preferências salvas com sucesso! ✅');
    } catch (erro) {
      console.error('Erro ao salvar preferências:', erro);
      toast.error('Erro ao salvar preferências');
    } finally {
      setSalvando(false);
    }
  };

  const handleResetarPadrao = () => {
    if (!confirm('Deseja resetar para as configurações padrão?')) return;
    const padrao: PreferencesNotificacoes = {
      tres_dias: true,
      um_dia: true,
      manha: true,
      uma_hora: true,
      checkin_60min: true,
    };
    setPreferences(padrao);
  };

  if (carregando) {
    return (
      <Layout currentPage="customizar">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Bell className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
            <p className="text-foreground/60">Carregando preferências...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="customizar">
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Bell className="text-accent" size={32} />
            Customizar Notificações
          </h1>
          <p className="text-sm md:text-base text-foreground/60">
            Escolha quais notificações de escala você deseja receber
          </p>
        </div>

        {/* Aviso */}
        <Card className="bg-accent/10 border-2 border-accent/30 p-4 md:p-6 mb-6">
          <p className="text-sm md:text-base text-foreground">
            💡 <strong>Dica:</strong> Desabilitar notificações não afeta o Check-In. Você sempre poderá fazer Check-In manualmente.
          </p>
        </Card>

        {/* Opções de notificação */}
        <div className="space-y-4 mb-8">
          {(Object.keys(preferences) as Array<keyof PreferencesNotificacoes>).map((tipo) => (
            <Card
              key={tipo}
              className="bg-card border-2 border-card-foreground/10 p-4 md:p-6 flex items-center justify-between hover:border-accent/30 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                  {descricoes[tipo].titulo}
                </h3>
                <p className="text-sm text-foreground/60">
                  {descricoes[tipo].descricao}
                </p>
              </div>
              <Switch
                checked={preferences[tipo]}
                onCheckedChange={() => handleToggle(tipo)}
                className="ml-4 flex-shrink-0"
              />
            </Card>
          ))}
        </div>

        {/* Resumo */}
        <Card className="bg-secondary/20 border-2 border-accent/10 p-4 md:p-6 mb-8">
          <p className="text-sm md:text-base text-foreground">
            📊 <strong>Notificações ativas:</strong> {Object.values(preferences).filter(Boolean).length} de 5
          </p>
        </Card>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleSalvar}
            disabled={salvando}
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {salvando ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
          <Button
            onClick={handleResetarPadrao}
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10"
          >
            Resetar para Padrão
          </Button>
        </div>
      </div>
    </Layout>
  );
}
