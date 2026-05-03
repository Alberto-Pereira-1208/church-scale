import { useEffect, useRef } from 'react';
import { verificarNotificacoes, formatarData } from '@/lib/db';
import { toast } from 'sonner';

export const useNotificacoes = () => {
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Verificar notificações a cada 5 minutos
    const verificarEMostrar = async () => {
      try {
        const escalas = await verificarNotificacoes();
        
        for (const escala of escalas) {
          let mensagem = '';
          let duracao = 10000;
          
          // Mensagem customizada para Check-In 60 minutos antes
          if (escala.tipoNotificacao === 'checkin_60min') {
            mensagem = `
              ⏰ LEMBRETE: Check-In em 60 minutos!
              📅 ${formatarData(escala.data, escala.horario)}
              ⛪ ${escala.evento}
              🎯 ${escala.funcao}
              Faça o Check-In para confirmar sua presença.
            `;
            duracao = 15000;
          } else {
            mensagem = `
              📅 ${formatarData(escala.data, escala.horario)}
              🎯 ${escala.funcao}
              ⛪ ${escala.evento}
              ${escala.oQueLevar ? `📦 Levar: ${escala.oQueLevar}` : ''}
              ${escala.observacoes ? `📝 Obs: ${escala.observacoes}` : ''}
            `;
          }
          
          toast.info(mensagem, {
            duration: duracao,
            position: 'top-center',
          });
        }
      } catch (erro) {
        console.error('Erro ao verificar notificações:', erro);
      }
    };

    // Verificar imediatamente ao montar
    verificarEMostrar();

    // Configurar intervalo
    intervaloRef.current = setInterval(verificarEMostrar, 5 * 60 * 1000);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, []);
};
