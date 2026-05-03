import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface RouteParams {
  id: string;
}

export default function EditarEscala() {
  const [, navigate] = useLocation();
  const { voluntarios, ministerios, atualizarEscala, carregando } = useApp();
  const [escalaSalvando, setEscalaSalvando] = useState(false);
  const [escalaCarregando, setEscalaCarregando] = useState(true);
  const [escalaNaoEncontrada, setEscalaNaoEncontrada] = useState(false);

  const [formData, setFormData] = useState({
    id: 0,
    voluntarioId: '',
    ministerioId: '',
    funcao: '',
    evento: '',
    data: '',
    horario: '',
    oQueLevar: '',
    observacoes: '',
  });

  // Extrair ID da URL
  const params = new URLSearchParams(window.location.search);
  const escalaId = parseInt(params.get('id') || '0');

  // Carregar dados da escala
  useEffect(() => {
    const carregarEscala = async () => {
      try {
        setEscalaCarregando(true);
        const escala = await db.escalas.get(escalaId);

        if (!escala) {
          setEscalaNaoEncontrada(true);
          return;
        }

        setFormData({
          id: escala.id || 0,
          voluntarioId: escala.voluntarioId ? escala.voluntarioId.toString() : '',
          ministerioId: escala.ministerioId ? escala.ministerioId.toString() : '',
          funcao: escala.funcao || '',
          evento: escala.evento || '',
          data: escala.data || '',
          horario: escala.horario || '',
          oQueLevar: escala.oQueLevar || '',
          observacoes: escala.observacoes || '',
        });
      } catch (erro) {
        console.error('Erro ao carregar escala:', erro);
        toast.error('Erro ao carregar escala: ' + (erro instanceof Error ? erro.message : 'Erro desconhecido'));
        setEscalaNaoEncontrada(true);
      } finally {
        setEscalaCarregando(false);
      }
    };

    if (escalaId > 0) {
      carregarEscala();
    }
  }, [escalaId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.voluntarioId) {
      toast.error('Selecione um voluntário');
      return;
    }
    if (!formData.ministerioId) {
      toast.error('Selecione um ministério');
      return;
    }
    if (!formData.funcao.trim()) {
      toast.error('Digite a função');
      return;
    }
    if (!formData.evento.trim()) {
      toast.error('Digite o evento');
      return;
    }
    if (!formData.data) {
      toast.error('Selecione a data');
      return;
    }
    if (!formData.horario) {
      toast.error('Digite o horário');
      return;
    }

    try {
      setEscalaSalvando(true);
      await atualizarEscala(formData.id, {
        voluntarioId: parseInt(formData.voluntarioId),
        ministerioId: parseInt(formData.ministerioId),
        funcao: formData.funcao,
        evento: formData.evento,
        data: formData.data,
        horario: formData.horario,
        oQueLevar: formData.oQueLevar,
        observacoes: formData.observacoes,
      });

      toast.success('Escala atualizada com sucesso! ✅');
      navigate('/escalas');
    } catch (erro) {
      toast.error('Erro ao atualizar escala');
    } finally {
      setEscalaSalvando(false);
    }
  };

  if (carregando || escalaCarregando) {
    return (
      <Layout currentPage="escalas">
        <div className="flex items-center justify-center h-full">
          <p className="text-foreground/60">Carregando escala...</p>
        </div>
      </Layout>
    );
  }

  if (escalaNaoEncontrada) {
    return (
      <Layout currentPage="escalas">
        <div className="p-8 max-w-2xl mx-auto">
          <Card className="bg-card border border-border p-8 text-center">
            <p className="text-foreground/60 mb-4">Escala não encontrada</p>
            <Button
              onClick={() => navigate('/escalas')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Voltar para Escalas
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="escalas">
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/escalas')}
            variant="outline"
            size="sm"
            className="border-border"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Editar Escala</h1>
            <p className="text-foreground/60">Altere os detalhes da escala</p>
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-card border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voluntário */}
            <div>
              <Label className="text-foreground mb-2 block">Voluntário *</Label>
              <Select value={formData.voluntarioId} onValueChange={(value) => handleSelectChange('voluntarioId', value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Selecione um voluntário" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {voluntarios.map(v => (
                    <SelectItem key={v.id} value={v.id?.toString() || ''} className="text-foreground">
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ministério */}
            <div>
              <Label className="text-foreground mb-2 block">Ministério *</Label>
              <Select value={formData.ministerioId} onValueChange={(value) => handleSelectChange('ministerioId', value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Selecione um ministério" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {ministerios.map(m => (
                    <SelectItem key={m.id} value={m.id?.toString() || ''} className="text-foreground">
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Função */}
            <div>
              <Label className="text-foreground mb-2 block">Função *</Label>
              <Input
                name="funcao"
                placeholder="Ex: Organista, Pregador, Porteiro"
                value={formData.funcao}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* Evento */}
            <div>
              <Label className="text-foreground mb-2 block">Evento *</Label>
              <Input
                name="evento"
                placeholder="Ex: Culto de domingo, Reunião de oração"
                value={formData.evento}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* Data */}
            <div>
              <Label className="text-foreground mb-2 block">Data *</Label>
              <Input
                name="data"
                type="date"
                value={formData.data}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* Horário */}
            <div>
              <Label className="text-foreground mb-2 block">Horário *</Label>
              <Input
                name="horario"
                type="time"
                value={formData.horario}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* O que levar */}
            <div>
              <Label className="text-foreground mb-2 block">O que levar</Label>
              <Input
                name="oQueLevar"
                placeholder="Ex: Bíblia, Instrumento musical"
                value={formData.oQueLevar}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground"
              />
            </div>

            {/* Observações */}
            <div>
              <Label className="text-foreground mb-2 block">Observações</Label>
              <Textarea
                name="observacoes"
                placeholder="Adicione observações importantes"
                value={formData.observacoes}
                onChange={handleInputChange}
                className="bg-input border-border text-foreground"
                rows={4}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={escalaSalvando}
                className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1"
              >
                <Save size={18} className="mr-2" />
                {escalaSalvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/escalas')}
                variant="outline"
                className="border-border flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
