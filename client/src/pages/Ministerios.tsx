import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export default function Ministerios() {
  const { ministerios, adicionarMinisterio, recarregarDados, carregando } = useApp();
  const [novoMinisterio, setNovoMinisterio] = useState('');
  const [adicionando, setAdicionando] = useState(false);

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoMinisterio.trim()) {
      toast.error('Digite o nome do ministério');
      return;
    }

    try {
      setAdicionando(true);
      await adicionarMinisterio(novoMinisterio);
      setNovoMinisterio('');
      toast.success('Ministério adicionado com sucesso');
    } catch (erro) {
      toast.error('Erro ao adicionar ministério');
    } finally {
      setAdicionando(false);
    }
  };

  const handleDeletar = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja deletar este ministério?')) return;

    try {
      await db.ministerios.delete(id);
      await recarregarDados();
      toast.success('Ministério deletado com sucesso');
    } catch (erro) {
      toast.error('Erro ao deletar ministério');
    }
  };

  if (carregando) {
    return (
      <Layout currentPage="ministerios">
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground/60">Carregando ministérios...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="ministerios">
      <div className="p-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Ministérios</h1>
          <p className="text-foreground/60 mb-8">Gerenciamento de ministérios para escalas</p>
        </div>

        <Card className="bg-card border border-border p-6 mb-8">
          <form onSubmit={handleAdicionar} className="flex gap-2">
            <Input
              placeholder="Nome do novo ministério"
              value={novoMinisterio}
              onChange={(e) => setNovoMinisterio(e.target.value)}
              className="bg-input border-border text-foreground flex-1"
            />
            <Button
              type="submit"
              disabled={adicionando}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus size={18} className="mr-2" />
              {adicionando ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </form>
        </Card>

        {ministerios.length > 0 ? (
          <div className="space-y-3">
            {ministerios.map(ministerio => (
              <Card
                key={ministerio.id}
                className="bg-card border border-border p-4 flex items-center justify-between hover:border-accent transition-colors"
              >
                <div>
                  <p className="text-foreground font-semibold">{ministerio.nome}</p>
                  <p className="text-foreground/60 text-sm">ID: {ministerio.id}</p>
                </div>
                <Button
                  onClick={() => handleDeletar(ministerio.id)}
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border border-border p-8 text-center">
            <p className="text-foreground/60 mb-4">Nenhum ministério cadastrado</p>
            <p className="text-foreground/40 text-sm">Adicione um novo ministério acima para começar</p>
          </Card>
        )}

        <Card className="bg-card border border-border p-4 mt-8">
          <p className="text-foreground/60 text-sm mb-1">TOTAL DE MINISTÉRIOS</p>
          <p className="text-3xl font-bold text-accent">{ministerios.length}</p>
        </Card>
      </div>
    </Layout>
  );
}
