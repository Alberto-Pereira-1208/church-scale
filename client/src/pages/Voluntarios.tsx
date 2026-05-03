import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export default function Voluntarios() {
  const { voluntarios, adicionarVoluntario, recarregarDados, carregando } = useApp();
  const [novoVoluntario, setNovoVoluntario] = useState('');
  const [adicionando, setAdicionando] = useState(false);

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoVoluntario.trim()) {
      toast.error('Digite o nome do voluntário');
      return;
    }

    try {
      setAdicionando(true);
      await adicionarVoluntario(novoVoluntario);
      setNovoVoluntario('');
      toast.success('Voluntário adicionado com sucesso');
    } catch (erro) {
      toast.error('Erro ao adicionar voluntário');
    } finally {
      setAdicionando(false);
    }
  };

  const handleDeletar = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja deletar este voluntário?')) return;

    try {
      await db.voluntarios.delete(id);
      await recarregarDados();
      toast.success('Voluntário deletado com sucesso');
    } catch (erro) {
      toast.error('Erro ao deletar voluntário');
    }
  };

  if (carregando) {
    return (
      <Layout currentPage="voluntarios">
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground/60">Carregando voluntários...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="voluntarios">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Voluntários</h1>
          <p className="text-foreground/60 mb-8">Gerenciamento de voluntários para escalas</p>
        </div>

        {/* Formulário de Adição */}
        <Card className="bg-card border border-border p-6 mb-8">
          <form onSubmit={handleAdicionar} className="flex gap-2">
            <Input
              placeholder="Nome do novo voluntário"
              value={novoVoluntario}
              onChange={(e) => setNovoVoluntario(e.target.value)}
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

        {/* Lista de Voluntários */}
        {voluntarios.length > 0 ? (
          <div className="space-y-3">
            {voluntarios.map(voluntario => (
              <Card
                key={voluntario.id}
                className="bg-card border border-border p-4 flex items-center justify-between hover:border-accent transition-colors"
              >
                <div>
                  <p className="text-foreground font-semibold">{voluntario.nome}</p>
                  <p className="text-foreground/60 text-sm">ID: {voluntario.id}</p>
                </div>
                <Button
                  onClick={() => handleDeletar(voluntario.id)}
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
            <p className="text-foreground/60 mb-4">Nenhum voluntário cadastrado</p>
            <p className="text-foreground/40 text-sm">Adicione um novo voluntário acima para começar</p>
          </Card>
        )}

        {/* Estatísticas */}
        <Card className="bg-card border border-border p-4 mt-8">
          <p className="text-foreground/60 text-sm mb-1">TOTAL DE VOLUNTÁRIOS</p>
          <p className="text-3xl font-bold text-accent">{voluntarios.length}</p>
        </Card>
      </div>
    </Layout>
  );
}
