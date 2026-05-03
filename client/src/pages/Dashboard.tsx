import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle2, XCircle, Calendar, Download, FileText } from 'lucide-react';
import { exportarPDF, exportarExcel, exportarCSV } from '@/lib/exportacao';
import { toast } from 'sonner';

export default function Dashboard() {
  const { escalas, voluntarios, ministerios } = useApp();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Filtrar escalas por data
  const escalasFiltradasPorData = useMemo(() => {
    return escalas.filter(e => {
      if (dataInicio && e.data < dataInicio) return false;
      if (dataFim && e.data > dataFim) return false;
      return true;
    });
  }, [escalas, dataInicio, dataFim]);

  // Calcular estatísticas gerais
  const estatisticasGerais = useMemo(() => {
    const total = escalasFiltradasPorData.length;
    const presentes = escalasFiltradasPorData.filter(e => e.concluida && e.checkInRealizado).length;
    const ausentes = escalasFiltradasPorData.filter(e => e.concluida && !e.checkInRealizado).length;
    const pendentes = escalasFiltradasPorData.filter(e => !e.concluida).length;

    return {
      total,
      presentes,
      ausentes,
      pendentes,
      taxaPresenca: total > 0 ? Math.round((presentes / (presentes + ausentes)) * 100) || 0 : 0,
    };
  }, [escalasFiltradasPorData]);

  // Dados para gráfico de presença por ministério
  const dadosMinisterios = useMemo(() => {
    const mapa = new Map<number, { presentes: number; ausentes: number }>();

    escalasFiltradasPorData.forEach(e => {
      if (!mapa.has(e.ministerioId)) {
        mapa.set(e.ministerioId, { presentes: 0, ausentes: 0 });
      }

      const dados = mapa.get(e.ministerioId)!;
      if (e.concluida) {
        if (e.checkInRealizado) {
          dados.presentes++;
        } else {
          dados.ausentes++;
        }
      }
    });

    return Array.from(mapa.entries()).map(([ministerioId, dados]) => {
      const ministerio = ministerios.find(m => m.id === ministerioId);
      const total = dados.presentes + dados.ausentes;
      const taxa = total > 0 ? Math.round((dados.presentes / total) * 100) : 0;

      return {
        name: ministerio?.nome || 'Desconhecido',
        presentes: dados.presentes,
        ausentes: dados.ausentes,
        taxa,
        total,
      };
    }).sort((a, b) => b.taxa - a.taxa);
  }, [escalasFiltradasPorData, ministerios]);

  // Dados para gráfico de voluntários
  const dadosVoluntarios = useMemo(() => {
    const mapa = new Map<number, { presentes: number; ausentes: number }>();

    escalasFiltradasPorData.forEach(e => {
      if (!mapa.has(e.voluntarioId)) {
        mapa.set(e.voluntarioId, { presentes: 0, ausentes: 0 });
      }

      const dados = mapa.get(e.voluntarioId)!;
      if (e.concluida) {
        if (e.checkInRealizado) {
          dados.presentes++;
        } else {
          dados.ausentes++;
        }
      }
    });

    return Array.from(mapa.entries())
      .map(([voluntarioId, dados]) => {
        const voluntario = voluntarios.find(v => v.id === voluntarioId);
        const total = dados.presentes + dados.ausentes;
        const taxa = total > 0 ? Math.round((dados.presentes / total) * 100) : 0;

        return {
          name: voluntario?.nome || 'Desconhecido',
          presentes: dados.presentes,
          ausentes: dados.ausentes,
          taxa,
          total,
        };
      })
      .sort((a, b) => b.presentes - a.presentes)
      .slice(0, 10); // Top 10
  }, [escalasFiltradasPorData, voluntarios]);

  // Dados para gráfico de pizza
  const dadosPizza = useMemo(() => {
    return [
      { name: 'Presentes', value: estatisticasGerais.presentes, color: '#C6FF00' },
      { name: 'Ausentes', value: estatisticasGerais.ausentes, color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [estatisticasGerais]);

  const limparFiltros = () => {
    setDataInicio('');
    setDataFim('');
  };

  const handleExportarPDF = async () => {
    try {
      toast.loading('Gerando PDF...');
      await exportarPDF('dashboard-content', {
        estatisticas: estatisticasGerais,
        ministerios: dadosMinisterios,
        voluntarios: dadosVoluntarios,
        dataInicio,
        dataFim,
      });
      toast.dismiss();
      toast.success('PDF exportado com sucesso!');
    } catch (erro) {
      toast.dismiss();
      toast.error('Erro ao exportar PDF');
      console.error(erro);
    }
  };

  const handleExportarExcel = () => {
    try {
      exportarExcel({
        estatisticas: estatisticasGerais,
        ministerios: dadosMinisterios,
        voluntarios: dadosVoluntarios,
        dataInicio,
        dataFim,
      });
      toast.success('Excel exportado com sucesso!');
    } catch (erro) {
      toast.error('Erro ao exportar Excel');
      console.error(erro);
    }
  };

  const handleExportarCSV = () => {
    try {
      exportarCSV({
        estatisticas: estatisticasGerais,
        ministerios: dadosMinisterios,
        voluntarios: dadosVoluntarios,
        dataInicio,
        dataFim,
      });
      toast.success('CSV exportado com sucesso!');
    } catch (erro) {
      toast.error('Erro ao exportar CSV');
      console.error(erro);
    }
  };

  return (
    <Layout currentPage="dashboard">
      <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto" id="dashboard-content">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">📊 Dashboard de Presença</h1>
            <p className="text-foreground/60">Análise de presença por ministério e voluntário</p>
          </div>

          {/* Filtros e Exportação */}
          <Card className="bg-card border border-border p-4 md:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="data-inicio" className="text-sm font-semibold">Data Início</Label>
                <Input
                  id="data-inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-fim" className="text-sm font-semibold">Data Fim</Label>
                <Input
                  id="data-fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={limparFiltros}
                  variant="outline"
                  className="w-full border-border"
                >
                  Limpar Filtros
                </Button>
              </div>
              <div className="flex items-end">
                <div className="w-full flex gap-2">
                  <Button
                    onClick={handleExportarPDF}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                  >
                    <FileText size={16} />
                    PDF
                  </Button>
                  <Button
                    onClick={handleExportarExcel}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700 gap-2"
                  >
                    <Download size={16} />
                    Excel
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportarCSV}
                variant="outline"
                className="w-full border-border gap-2"
              >
                <Download size={16} />
                Exportar como CSV
              </Button>
            </div>
          </Card>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border border-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Total de Escalas</p>
                  <p className="text-3xl font-bold text-accent">{estatisticasGerais.total}</p>
                </div>
                <Calendar size={32} className="text-accent/50" />
              </div>
            </Card>

            <Card className="bg-card border border-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Presentes</p>
                  <p className="text-3xl font-bold text-green-400">{estatisticasGerais.presentes}</p>
                </div>
                <CheckCircle2 size={32} className="text-green-400/50" />
              </div>
            </Card>

            <Card className="bg-card border border-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Ausentes</p>
                  <p className="text-3xl font-bold text-red-400">{estatisticasGerais.ausentes}</p>
                </div>
                <XCircle size={32} className="text-red-400/50" />
              </div>
            </Card>

            <Card className="bg-card border border-border p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm mb-1">Taxa de Presença</p>
                  <p className="text-3xl font-bold text-accent">{estatisticasGerais.taxaPresenca}%</p>
                </div>
                <Users size={32} className="text-accent/50" />
              </div>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gráfico de Pizza */}
            {dadosPizza.length > 0 && (
              <Card className="bg-card border border-border p-4 md:p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Presença Geral</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Gráfico de Ministérios */}
            {dadosMinisterios.length > 0 && (
              <Card className="bg-card border border-border p-4 md:p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Taxa por Ministério</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosMinisterios}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #C6FF00' }}
                      formatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="taxa" fill="#C6FF00" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Gráfico de Voluntários */}
          {dadosVoluntarios.length > 0 && (
            <Card className="bg-card border border-border p-4 md:p-6 mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4">Top 10 Voluntários (Presentes)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosVoluntarios} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={150} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #C6FF00' }}
                    formatter={(value) => value}
                  />
                  <Legend />
                  <Bar dataKey="presentes" fill="#C6FF00" name="Presentes" />
                  <Bar dataKey="ausentes" fill="#EF4444" name="Ausentes" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Tabela de Ministérios */}
          {dadosMinisterios.length > 0 && (
            <Card className="bg-card border border-border p-4 md:p-6 mb-8">
              <h2 className="text-lg font-bold text-foreground mb-4">Detalhes por Ministério</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4 text-foreground/60">Ministério</th>
                      <th className="text-center py-2 px-4 text-foreground/60">Presentes</th>
                      <th className="text-center py-2 px-4 text-foreground/60">Ausentes</th>
                      <th className="text-center py-2 px-4 text-foreground/60">Total</th>
                      <th className="text-center py-2 px-4 text-foreground/60">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosMinisterios.map((m, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-secondary/10">
                        <td className="py-3 px-4 text-foreground">{m.name}</td>
                        <td className="py-3 px-4 text-center text-green-400 font-semibold">{m.presentes}</td>
                        <td className="py-3 px-4 text-center text-red-400 font-semibold">{m.ausentes}</td>
                        <td className="py-3 px-4 text-center text-foreground">{m.total}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-accent/20 text-accent px-2 py-1 rounded font-semibold">{m.taxa}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Mensagem vazia */}
          {escalasFiltradasPorData.length === 0 && (
            <Card className="bg-card border border-border p-8 text-center">
              <p className="text-foreground/60 mb-4">Nenhuma escala encontrada para o período selecionado</p>
              <Button onClick={limparFiltros} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Limpar Filtros
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
