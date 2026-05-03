import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
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
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotificacoes } from '@/hooks/usePushNotificacoes';

export default function NovaEscala() {
  const [, navigate] = useLocation();
  const { escalas, voluntarios, ministerios, adicionarEscala, adicionarVoluntario, adicionarMinisterio } = useApp();
  const { notificarNovaEscala } = usePushNotificacoes();
  const [carregando, setCarregando] = useState(false);
  const [mostrarNovoVoluntario, setMostrarNovoVoluntario] = useState(false);
  const [mostrarNovoMinisterio, setMostrarNovoMinisterio] = useState(false);
  const [novoVoluntarioNome, setNovoVoluntarioNome] = useState('');
  const [novoMinisterioNome, setNovoMinisterioNome] = useState('');

  const [formData, setFormData] = useState({
    voluntarioId: '',
    ministerioId: '',
    funcao: '',
    evento: '',
    data: '',
    horario: '',
    oQueLevar: '',
    observacoes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdicionarVoluntario = async () => {
    if (!novoVoluntarioNome.trim()) {
      toast.error('Digite o nome do voluntário');
      return;
    }
    try {
      await adicionarVoluntario(novoVoluntarioNome);
      setNovoVoluntarioNome('');
      setMostrarNovoVoluntario(false);
      toast.success('Voluntário adicionado com sucesso');
    } catch (erro) {
      toast.error('Erro ao adicionar voluntário');
    }
  };

  const handleAdicionarMinisterio = async () => {
    if (!novoMinisterioNome.trim()) {
      toast.error('Digite o nome do ministério');
      return;
    }
    try {
      await adicionarMinisterio(novoMinisterioNome);
      setNovoMinisterioNome('');
      setMostrarNovoMinisterio(false);
      toast.success('Ministério adicionado com sucesso');
    } catch (erro) {
      toast.error('Erro ao adicionar ministério');
    }
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
      setCarregando(true);
      const voluntario = voluntarios.find(v => v.id?.toString() === formData.voluntarioId);
      const ministerio = ministerios.find(m => m.id?.toString() === formData.ministerioId);

      await adicionarEscala({
        voluntarioId: parseInt(formData.voluntarioId),
        ministerioId: parseInt(formData.ministerioId),
        funcao: formData.funcao,
        evento: formData.evento,
        data: formData.data,
        horario: formData.horario,
        oQueLevar: formData.oQueLevar,
        observacoes: formData.observacoes,
        concluida: false,
        pronto: false,
        checkInRealizado: false,
      });

      // Enviar notificação push
      if (voluntario && ministerio) {
        await notificarNovaEscala({
          voluntario: voluntario.nome,
          ministerio: ministerio.nome,
          funcao: formData.funcao,
          evento: formData.evento,
          data: formData.data,
          horario: formData.horario,
        });
      }

      toast.success('Escala criada com sucesso! ✅');
      navigate('/escalas');
    } catch (erro) {
      toast.error('Erro ao criar escala');
    } finally {
      setCarregando(false);
    }
  };

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
            <h1 className="text-4xl font-bold text-foreground">Nova Escala</h1>
            <p className="text-foreground/60">Crie uma nova escala de serviço</p>
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-card border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voluntário */}
            <div>
              <Label className="text-foreground mb-2 block">Voluntário *</Label>
              <div className="flex gap-2">
                <Select value={formData.voluntarioId} onValueChange={(value) => handleSelectChange('voluntarioId', value)}>
                  <SelectTrigger className="bg-input border-border text-foreground flex-1">
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
                <Button
                  type="button"
                  onClick={() => setMostrarNovoVoluntario(!mostrarNovoVoluntario)}
                  variant="outline"
                  className="border-accent text-accent"
                >
                  <Plus size={18} />
                </Button>
              </div>
              {mostrarNovoVoluntario && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nome do novo voluntário"
                    value={novoVoluntarioNome}
                    onChange={(e) => setNovoVoluntarioNome(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={handleAdicionarVoluntario}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Adicionar
                  </Button>
                </div>
              )}
            </div>

            {/* Ministério */}
            <div>
              <Label className="text-foreground mb-2 block">Ministério *</Label>
              <div className="flex gap-2">
                <Select value={formData.ministerioId} onValueChange={(value) => handleSelectChange('ministerioId', value)}>
                  <SelectTrigger className="bg-input border-border text-foreground flex-1">
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
                <Button
                  type="button"
                  onClick={() => setMostrarNovoMinisterio(!mostrarNovoMinisterio)}
                  variant="outline"
                  className="border-accent text-accent"
                >
                  <Plus size={18} />
                </Button>
              </div>
              {mostrarNovoMinisterio && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nome do novo ministério"
                    value={novoMinisterioNome}
                    onChange={(e) => setNovoMinisterioNome(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={handleAdicionarMinisterio}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Adicionar
                  </Button>
                </div>
              )}
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
                disabled={carregando}
                className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1"
              >
                {carregando ? 'Criando...' : 'Criar Escala'}
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
