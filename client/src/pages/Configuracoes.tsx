import React, { useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Trash2, AlertCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db';
import { usePushNotificacoes } from '@/hooks/usePushNotificacoes';

export default function Configuracoes() {
  const { exportarDados, importarDados, recarregarDados } = useApp();
  const { permissaoGranted, solicitarPermissao, notificar } = usePushNotificacoes();
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(permissaoGranted);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportar = async () => {
    try {
      const dados = await exportarDados();
      const elemento = document.createElement('a');
      elemento.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(dados);
      elemento.download = `church-scale-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(elemento);
      elemento.click();
      document.body.removeChild(elemento);
      toast.success('Backup exportado com sucesso');
    } catch (erro) {
      toast.error('Erro ao exportar backup');
    }
  };

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    try {
      const conteudo = await arquivo.text();
      if (!window.confirm('Tem certeza? Isso irá substituir todos os dados atuais.')) {
        return;
      }
      await importarDados(conteudo);
      toast.success('Dados importados com sucesso');
    } catch (erro) {
      toast.error('Erro ao importar dados');
    }
  };

  const handleLimparTudo = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Isso irá deletar TODOS os dados! Esta ação não pode ser desfeita. Tem certeza?')) {
      return;
    }

    try {
      await db.escalas.clear();
      await db.voluntarios.clear();
      await db.ministerios.clear();
      await db.notificacoes.clear();
      await recarregarDados();
      toast.success('Todos os dados foram deletados');
    } catch (erro) {
      toast.error('Erro ao limpar dados');
    }
  };

  const handleAtivarNotificacoes = async () => {
    const granted = await solicitarPermissao();
    if (granted) {
      setNotificacoesAtivas(true);
      notificar('✅ Notificações Ativadas', 'Você receberá notificações de escalas e lembretes de check-in');
    }
  };

  return (
    <Layout currentPage="configuracoes">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">⚙️ Configurações</h1>
          <p className="text-foreground/60">Gerenciamento de dados, backup e notificações</p>
        </div>

        {/* Seção de Notificações Push */}
        <Card className="bg-card border border-border p-4 md:p-6 mb-6">
          <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Bell size={24} className="text-sidebar-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Notificações Push</h2>
                <p className="text-sm text-foreground/60">Receba lembretes de escalas e check-in</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              notificacoesAtivas
                ? 'bg-green-600/20 text-green-400'
                : 'bg-yellow-600/20 text-yellow-400'
            }`}>
              {notificacoesAtivas ? '✓ Ativado' : '⚠ Desativado'}
            </div>
          </div>
          <p className="text-sm text-foreground/70 mb-4">
            Ative as notificações push para receber alertas quando novas escalas forem criadas e lembretes de check-in 60 minutos antes do culto.
          </p>
          <Button
            onClick={handleAtivarNotificacoes}
            disabled={notificacoesAtivas}
            className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 gap-2"
          >
            <Bell size={18} />
            {notificacoesAtivas ? 'Notificações Ativadas' : 'Ativar Notificações Push'}
          </Button>
        </Card>

        {/* Seção de Backup */}
        <Card className="bg-card border border-border p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Backup e Restauração</h2>
          <p className="text-foreground/60 mb-6">
            Exporte seus dados para um arquivo JSON ou importe dados de um backup anterior.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleExportar}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 justify-start gap-2"
            >
              <Download size={20} />
              Exportar Backup
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full border-border justify-start gap-2"
            >
              <Upload size={20} />
              Importar Backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportar}
              className="hidden"
            />
          </div>
        </Card>

        {/* Seção de Informações */}
        <Card className="bg-card border border-border p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Informações do Aplicativo</h2>
          <div className="space-y-3">
            <div>
              <p className="text-foreground/60 text-sm">VERSÃO</p>
              <p className="text-foreground font-semibold">2.8.0</p>
            </div>
            <div>
              <p className="text-foreground/60 text-sm">ARMAZENAMENTO</p>
              <p className="text-foreground font-semibold">IndexedDB (100% Offline)</p>
            </div>
            <div>
              <p className="text-foreground/60 text-sm">FUNCIONALIDADES</p>
              <p className="text-foreground font-semibold">
                Escalas, Voluntários, Ministérios, Dashboard, Notificações Push, Backup
              </p>
            </div>
          </div>
        </Card>

        {/* Seção de Perigo */}
        <Card className="bg-card border border-destructive p-4 md:p-6">
          <div className="flex items-start gap-4 flex-col md:flex-row">
            <AlertCircle className="text-destructive flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Zona de Perigo</h2>
              <p className="text-foreground/60 mb-4">
                Deletar todos os dados do aplicativo. Esta ação é irreversível.
              </p>
              <Button
                onClick={handleLimparTudo}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              >
                <Trash2 size={20} />
                Deletar Todos os Dados
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
