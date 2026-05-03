import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { RegistroPresenca } from '@/lib/db';

interface GraficosPresencaProps {
  registros: RegistroPresenca[];
  titulo?: string;
}

export const GraficosPresenca: React.FC<GraficosPresencaProps> = ({
  registros,
  titulo = 'Análise de Presença',
}) => {
  // Calcular dados para gráfico de pizza (Status)
  const calcularStatusData = () => {
    const presentes = registros.filter(r => r.status === 'Presente').length;
    const faltas = registros.filter(r => r.status === 'Falta').length;
    const justificados = registros.filter(r => r.status === 'Justificado').length;
    const trocados = registros.filter(r => r.status === 'Trocado').length;

    return [
      { name: 'Presente', value: presentes, color: '#22c55e' },
      { name: 'Falta', value: faltas, color: '#ef4444' },
      { name: 'Justificado', value: justificados, color: '#3b82f6' },
      { name: 'Trocado', value: trocados, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  };

  // Calcular dados para gráfico de barras (Pontual vs Atrasado)
  const calcularPontualidadeData = () => {
    const presentes = registros.filter(r => r.status === 'Presente');
    const pontuais = presentes.filter(r => r.subStatus === 'Pontual').length;
    const atrasados = presentes.filter(r => r.subStatus === 'Atrasado').length;

    return [
      { name: 'Pontual', value: pontuais, color: '#10b981' },
      { name: 'Atrasado', value: atrasados, color: '#fbbf24' },
    ];
  };

  // Calcular dados por mês
  const calcularDadosPorMes = () => {
    const meses: Record<string, { presentes: number; faltas: number; justificados: number }> = {};

    registros.forEach(r => {
      const mes = r.dataEscala.substring(0, 7); // YYYY-MM
      if (!meses[mes]) {
        meses[mes] = { presentes: 0, faltas: 0, justificados: 0 };
      }

      if (r.status === 'Presente') meses[mes].presentes++;
      else if (r.status === 'Falta') meses[mes].faltas++;
      else if (r.status === 'Justificado') meses[mes].justificados++;
    });

    return Object.entries(meses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, dados]) => ({
        mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        Presentes: dados.presentes,
        Faltas: dados.faltas,
        Justificados: dados.justificados,
      }));
  };

  // Calcular dados por ministério
  const calcularDadosPorMinisterio = () => {
    const ministerios: Record<string, { presentes: number; faltas: number }> = {};

    registros.forEach(r => {
      const ministerio = r.evento || 'Sem evento';
      if (!ministerios[ministerio]) {
        ministerios[ministerio] = { presentes: 0, faltas: 0 };
      }

      if (r.status === 'Presente') ministerios[ministerio].presentes++;
      else if (r.status === 'Falta') ministerios[ministerio].faltas++;
    });

    return Object.entries(ministerios)
      .map(([ministerio, dados]) => ({
        ministerio: ministerio.substring(0, 15) + (ministerio.length > 15 ? '...' : ''),
        Presentes: dados.presentes,
        Faltas: dados.faltas,
      }))
      .sort((a, b) => (b.Presentes + b.Faltas) - (a.Presentes + a.Faltas))
      .slice(0, 8);
  };

  const statusData = calcularStatusData();
  const pontualidadeData = calcularPontualidadeData();
  const dadosPorMes = calcularDadosPorMes();
  const dadosPorMinisterio = calcularDadosPorMinisterio();

  const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{titulo}</h2>

      {/* Gráficos em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Status */}
        {statusData.length > 0 && (
          <Card className="bg-secondary/20 border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} registros`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Gráfico de Barras - Pontualidade */}
        {pontualidadeData.length > 0 && (
          <Card className="bg-secondary/20 border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pontualidade</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pontualidadeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => `${value} registros`}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Gráfico de Linha - Presença por Mês */}
      {dadosPorMes.length > 0 && (
        <Card className="bg-secondary/20 border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Presença por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Presentes"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
              />
              <Line
                type="monotone"
                dataKey="Faltas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
              <Line
                type="monotone"
                dataKey="Justificados"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráfico de Barras - Presença por Evento */}
      {dadosPorMinisterio.length > 0 && (
        <Card className="bg-secondary/20 border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Presença por Evento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosPorMinisterio}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="ministerio" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="Presentes" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Faltas" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Mensagem quando não há dados */}
      {registros.length === 0 && (
        <Card className="bg-secondary/20 border-border p-8 text-center">
          <p className="text-foreground/60">Nenhum dado disponível para exibir gráficos</p>
        </Card>
      )}
    </div>
  );
};
