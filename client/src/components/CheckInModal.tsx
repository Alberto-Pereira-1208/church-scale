import React, { useState, useEffect } from 'react';
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
  obterLocalizacao,
  validarCheckIn,
  LOCAL_CHECKIN,
  formatarDistancia,
  Coordenadas,
} from '@/lib/geolocation';
import { MapPin, Loader2, CheckCircle2, AlertCircle, Navigation, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  db,
  registrarPresenca,
  validarDataCheckIn,
  validarHorarioCheckIn,
  calcularHorarioIdeal,
  calcularHorarioTolerancia,
} from '@/lib/db';

interface CheckInModalProps {
  aberto: boolean;
  onClose: () => void;
  escalaId: number;
  onCheckInSucesso?: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  aberto,
  onClose,
  escalaId,
  onCheckInSucesso,
}) => {
  const [carregando, setCarregando] = useState(false);
  const [localizacaoObtida, setLocalizacaoObtida] = useState(false);
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [distancia, setDistancia] = useState<number | null>(null);
  const [permitido, setPermitido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [jafezCheckIn, setJaFezCheckIn] = useState(false);
  
  // Novos estados para validação de integridade
  const [escala, setEscala] = useState<any>(null);
  const [horarioIdeal, setHorarioIdeal] = useState<string>('');
  const [horarioTolerancia, setHorarioTolerancia] = useState<string>('');
  const [dataValida, setDataValida] = useState<boolean>(true);
  const [horarioValido, setHorarioValido] = useState<boolean>(true);
  const [statusClassificacao, setStatusClassificacao] = useState<'Pontual' | 'Atrasado' | 'Falta'>('Falta');

  // Verificar se já fez check-in e carregar dados da escala
  useEffect(() => {
    const verificarCheckIn = async () => {
      try {
        const escalaData = await db.escalas.get(escalaId);
        if (!escalaData) {
          setErro('Escala não encontrada');
          return;
        }

        setEscala(escalaData);

        // Calcular horários
        const ideal = calcularHorarioIdeal(escalaData.horario);
        const tolerancia = calcularHorarioTolerancia(ideal);
        setHorarioIdeal(ideal);
        setHorarioTolerancia(tolerancia);

        // Verificar se já fez check-in
        const checkIns = await db.checkIns.where('escalaId').equals(escalaId).toArray();
        if (checkIns.length > 0) {
          setJaFezCheckIn(true);
        }

        // Validar data
        const hoje = new Date().toISOString();
        const dataValida = validarDataCheckIn(escalaData.data, hoje);
        setDataValida(dataValida);

        if (!dataValida) {
          setErro(`❌ O Check-In só pode ser realizado no dia da escala (${escalaData.data})`);
        }
      } catch (erro) {
        console.error('Erro ao verificar check-in:', erro);
        setErro('Erro ao carregar dados da escala');
      }
    };

    if (aberto) {
      verificarCheckIn();
    }
  }, [aberto, escalaId]);

  const handleObterLocalizacao = async () => {
    setCarregando(true);
    setErro(null);

    try {
      // Validar data antes de tentar check-in
      if (!dataValida) {
        const hoje = new Date().toISOString().split('T')[0];
        const dataEscala = escala?.data;
        setErro(`❌ O Check-In só pode ser realizado no dia da escala (${dataEscala}). Hoje é ${hoje}`);
        setCarregando(false);
        return;
      }

      const resultado = await obterLocalizacao();

      if (!resultado.sucesso) {
        setErro(resultado.erro || 'Erro ao obter localização');
        toast.error(resultado.erro || 'Erro ao obter localização');
        setCarregando(false);
        return;
      }

      if (!resultado.coordenadas) {
        setErro('Coordenadas não obtidas');
        setCarregando(false);
        return;
      }

      setCoordenadas(resultado.coordenadas);

      // Validar check-in geográfico
      const validacao = validarCheckIn(resultado.coordenadas);
      setDistancia(validacao.distancia);
      setPermitido(validacao.permitido);
      setLocalizacaoObtida(true);

      if (!validacao.permitido) {
        toast.error(validacao.mensagem);
      }
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro desconhecido';
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarCheckIn = async () => {
    if (!permitido || !coordenadas || !escala) {
      toast.error('Você não está no raio permitido para check-in');
      return;
    }

    try {
      setCarregando(true);

      // Validação 1: Data
      const agora = new Date().toISOString();
      const dataCheckInValida = validarDataCheckIn(escala.data, agora);

      if (!dataCheckInValida) {
        const hoje = new Date().toISOString().split('T')[0];
        const dataEscala = escala.data;
        toast.error(`❌ O Check-In só pode ser realizado no dia da escala (${dataEscala}). Hoje é ${hoje}`);
        setCarregando(false);
        return;
      }

      // Validação 2: Horário
      const horaAgora = new Date().toTimeString().split(' ')[0]; // HH:mm:ss
      const validacaoHorario = validarHorarioCheckIn(escala.horario, horaAgora);

      // Classificar status
      let statusFinal: 'Pontual' | 'Atrasado' | 'Falta' = validacaoHorario.status;
      setStatusClassificacao(statusFinal);

      // Se passou da tolerância, bloquear
      if (statusFinal === 'Falta') {
        const horarioToleranciaFormatado = horarioTolerancia;
        toast.error(
          `⏰ Desculpe, o prazo de tolerância expirou (até ${horarioToleranciaFormatado}). Registrado como falta.`
        );
        
        // Registrar como falta automática
        await db.historicoPresenca.add({
          escalaId,
          voluntarioId: escala.voluntarioId,
          ministerioId: escala.ministerioId,
          funcao: escala.funcao,
          evento: escala.evento,
          dataEscala: escala.data,
          horarioEscala: escala.horario,
          horarioIdeal,
          status: 'Falta',
          dataValida: true,
          horarioValido: false,
          criadoEm: Date.now(),
        });

        setCarregando(false);
        onClose();
        return;
      }

      // Salvar check-in no banco de dados
      await db.checkIns.add({
        escalaId,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
        distancia: distancia || 0,
        dataHora: Date.now(),
        confirmado: true,
      });

      // Registrar presença no histórico (imutável) com validações
      await registrarPresenca(
        escalaId,
        escala.voluntarioId,
        escala.ministerioId,
        escala.funcao,
        escala.evento,
        escala.data,
        escala.horario,
        agora,
        horaAgora
      );

      // Marcar checkInRealizado como true na escala
      await db.escalas.update(escalaId, { checkInRealizado: true });

      // Mensagem de sucesso com status
      const mensagem = statusFinal === 'Pontual'
        ? `✅ Check-in realizado com sucesso! Você chegou ${Math.abs(validacaoHorario.diferenca)} minutos antecipado.`
        : `✅ Check-in realizado! Você chegou ${validacaoHorario.diferenca} minutos atrasado.`;

      toast.success(mensagem);
      if (onCheckInSucesso) {
        onCheckInSucesso();
      }
      onClose();
    } catch (erro) {
      console.error('Erro ao salvar check-in:', erro);
      toast.error('Erro ao salvar check-in');
    } finally {
      setCarregando(false);
    }
  };

  const handleAbrirMapa = () => {
    const url = `https://www.google.com/maps/search/${LOCAL_CHECKIN.latitude},${LOCAL_CHECKIN.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <MapPin size={24} className="text-accent" />
            Check-In de Presença
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Confirme sua presença no local com validação de data e horário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Local */}
          <Card className="bg-secondary/20 border-accent/20 p-4">
            <div className="space-y-2">
              <p className="text-sm text-foreground/60">LOCAL DE CHECK-IN</p>
              <p className="font-semibold text-foreground">{LOCAL_CHECKIN.nome}</p>
              <p className="text-sm text-foreground/60">{LOCAL_CHECKIN.endereco}</p>
              <p className="text-xs text-foreground/40 mt-2">
                📍 Latitude: {LOCAL_CHECKIN.latitude.toFixed(4)} | Longitude: {LOCAL_CHECKIN.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-foreground/40">
                🎯 Raio permitido: {LOCAL_CHECKIN.raioPermitido}m
              </p>
            </div>
          </Card>

          {/* Informações de Horário */}
          {escala && (
            <Card className="bg-blue-500/10 border-blue-500/30 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-blue-400" />
                  <p className="font-semibold text-foreground">Horários da Escala</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-foreground/60">Horário da Escala</p>
                    <p className="font-mono text-foreground">{escala.horario}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Chegue até</p>
                    <p className="font-mono text-green-400">{horarioIdeal}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60">Tolerância até</p>
                    <p className="font-mono text-yellow-400">{horarioTolerancia}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  ⏰ Você deve chegar 1 hora antes da escala. Tolerância máxima: 25 minutos após o horário ideal.
                </p>
              </div>
            </Card>
          )}

          {/* Validação de Data */}
          {!dataValida && (
            <Card className="bg-red-500/10 border-red-500/30 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                <div>
                  <p className="font-semibold text-red-400">❌ Data Inválida</p>
                  <p className="text-sm text-foreground/60">
                    O Check-In só pode ser realizado no dia da escala ({escala?.data})
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Status de Check-In */}
          {jafezCheckIn && (
            <Card className="bg-green-500/10 border-green-500/30 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-500" />
                <p className="text-foreground">✅ Você já fez check-in nesta escala</p>
              </div>
            </Card>
          )}

          {/* Resultado da Localização */}
          {localizacaoObtida && coordenadas && (
            <Card
              className={`p-4 border ${
                permitido
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {permitido ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <AlertCircle size={20} className="text-red-500" />
                  )}
                  <p className={`font-semibold ${permitido ? 'text-green-400' : 'text-red-400'}`}>
                    {permitido ? '✅ Check-in Permitido' : '❌ Check-in Não Permitido'}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-foreground/80">
                    📍 Sua localização: {coordenadas.latitude.toFixed(4)}, {coordenadas.longitude.toFixed(4)}
                  </p>
                  <p className="text-foreground/80">
                    📏 Distância do local: <span className="font-semibold text-accent">{formatarDistancia(distancia || 0)}</span>
                  </p>
                  {!permitido && (
                    <p className="text-red-400">
                      ⚠️ Você está {(distancia || 0) - LOCAL_CHECKIN.raioPermitido}m fora do raio permitido
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Erro */}
          {erro && (
            <Card className="bg-red-500/10 border-red-500/30 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            {!localizacaoObtida ? (
              <Button
                onClick={handleObterLocalizacao}
                disabled={carregando || !dataValida}
                className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1"
              >
                {carregando ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Obtendo localização...
                  </>
                ) : (
                  <>
                    <Navigation size={18} className="mr-2" />
                    Obter Minha Localização
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleConfirmarCheckIn}
                  disabled={!permitido || carregando || jafezCheckIn || !dataValida}
                  className={`flex-1 ${
                    permitido && dataValida
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'bg-secondary text-foreground/50 cursor-not-allowed'
                  }`}
                >
                  {carregando ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : jafezCheckIn ? (
                    <>
                      <CheckCircle2 size={18} className="mr-2" />
                      Já Confirmado
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="mr-2" />
                      Confirmar Check-In
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleObterLocalizacao}
                  variant="outline"
                  className="border-border"
                  disabled={carregando}
                >
                  🔄 Atualizar
                </Button>
              </>
            )}
          </div>

          {/* Botão de Mapa */}
          <Button
            onClick={handleAbrirMapa}
            variant="outline"
            className="w-full border-border"
          >
            <MapPin size={18} className="mr-2" />
            Ver no Google Maps
          </Button>

          {/* Dica */}
          <div className="bg-secondary/20 rounded-lg p-3 border border-accent/10">
            <p className="text-xs text-foreground/60">
              💡 <strong>Importante:</strong> O check-in só é permitido no dia da escala, dentro do horário de tolerância (até {horarioTolerancia}). Certifique-se de que a localização está ativada.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
