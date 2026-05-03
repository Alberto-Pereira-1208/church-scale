import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db, RegistroPresenca, obterHistoricoPresenca } from '@/lib/db';
import { useApp } from '@/contexts/AppContext';
import { ArrowLeft, Download } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { GraficosPresenca } from '@/components/GraficosPresenca';

export default function AnalisePresenca() {
  const [, navigate] = useLocation() as [string, (path: string) => void];
  const { voluntarios, ministerios } = useApp();
  
  const [registros, setRegistros] = useState<RegistroPresenca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroVoluntario, setFiltroVoluntario] = useState<string>('todos');
  const [filtroMinisterio, setFiltroMinisterio] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('');

  // Carregar histórico
  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        setCarregando(true);
        const voluntarioId = filtroVoluntario && filtroVoluntario !== 'todos' ? parseInt(filtroVoluntario) : undefined;
        const ministerioId = filtroMinisterio && filtroMinisterio !== 'todos' ? parseInt(filtroMinisterio) : undefined;
        
        const dados = await obterHistoricoPresenca(voluntarioId, ministerioId, filtroMes);
        setRegistros(dados);
      } catch (erro) {
        console.error('Erro ao carregar histórico:', erro);
        toast.error('Erro ao carregar histórico');
      } finally {
        setCarregando(false);
      }
    };

    carregarHistorico();
  }, [filtroVoluntario, filtroMinisterio, filtroMes]);

  // Gerar meses disponíveis
  const gerarMeses = () => {
    const meses = new Set<string>();
    registros.forEach(r => {
      const mes = r.dataEscala.substring(0, 7); // YYYY-MM
      meses.add(mes);
    });
    return Array.from(meses).sort().reverse();
  };

  const exportarGrafico = () => {
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const getTituloAnalise = () => {
    let titulo = 'Análise de Presença';
    
    if (filtroVoluntario !== 'todos') {
      const voluntario = voluntarios.find(v => v.id === parseInt(filtroVoluntario));
      if (voluntario) titulo += ` - ${voluntario.nome}`;
    }
    
    if (filtroMes && filtroMes !== 'todos') {
      const mesFormatado = new Date(filtroMes + '-01').toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      titulo += ` (${mesFormatado})`;
    }
    
    return titulo;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-foreground hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Análise de Presença</h1>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Select value={filtroVoluntario} onValueChange={setFiltroVoluntario}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Voluntário" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="todos">Todos os voluntários</SelectItem>
                  {voluntarios.map(v => (
                    <SelectItem key={v.id} value={v.id?.toString() || ''}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filtroMinisterio} onValueChange={setFiltroMinisterio}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Ministério" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="todos">Todos os ministérios</SelectItem>
                  {ministerios.map(m => (
                    <SelectItem key={m.id} value={m.id?.toString() || ''}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filtroMes} onValueChange={setFiltroMes}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-border">
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {gerarMeses().map(mes => (
                    <SelectItem key={mes} value={mes}>
                      {new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={exportarGrafico}
                variant="outline"
                className="border-border flex-1"
              >
                <Download size={18} className="mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-foreground/60">Carregando gráficos...</p>
          </div>
        ) : registros.length === 0 ? (
          <Card className="bg-secondary/20 border-border p-8 text-center">
            <p className="text-foreground/60">Nenhum registro encontrado para exibir gráficos</p>
          </Card>
        ) : (
          <GraficosPresenca
            registros={registros}
            titulo={getTituloAnalise()}
          />
        )}
      </div>
    </div>
  );
}
