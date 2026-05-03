import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PushNotificacaoOptions {
  title: string;
  body: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export const usePushNotificacoes = () => {
  const [permissaoGranted, setPermissaoGranted] = useState(false);
  const [serviceWorkerRegistrado, setServiceWorkerRegistrado] = useState(false);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          setServiceWorkerRegistrado(true);
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Verificar permissão de notificações
  useEffect(() => {
    if ('Notification' in window) {
      setPermissaoGranted(Notification.permission === 'granted');
    }
  }, []);

  /**
   * Solicitar permissão de notificações
   */
  const solicitarPermissao = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermissaoGranted(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setPermissaoGranted(granted);

        if (granted) {
          toast.success('Notificações ativadas com sucesso!');
        } else {
          toast.error('Permissão de notificações negada');
        }

        return granted;
      } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
        toast.error('Erro ao ativar notificações');
        return false;
      }
    }

    return false;
  };

  /**
   * Enviar notificação push
   */
  const enviarNotificacao = async (opcoes: PushNotificacaoOptions) => {
    try {
      // Se não tiver permissão, solicitar
      if (!permissaoGranted) {
        const granted = await solicitarPermissao();
        if (!granted) {
          return false;
        }
      }

      // Se tiver Service Worker registrado, usar Notification API
      if ('Notification' in window && permissaoGranted) {
        const notificacao = new Notification(opcoes.title, {
          body: opcoes.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: opcoes.tag || 'church-scale',
          requireInteraction: opcoes.requireInteraction || false,
          data: opcoes.data || {},
        });

        // Adicionar listener de clique
        notificacao.addEventListener('click', () => {
          window.focus();
          notificacao.close();
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  };

  /**
   * Enviar notificação de nova escala
   */
  const notificarNovaEscala = async (escala: {
    voluntario: string;
    ministerio: string;
    funcao: string;
    evento: string;
    data: string;
    horario: string;
  }) => {
    return enviarNotificacao({
      title: '✅ Nova Escala Criada',
      body: `${escala.voluntario} - ${escala.funcao} em ${escala.evento}`,
      tag: `escala-${escala.data}-${escala.horario}`,
      data: {
        url: '/escalas',
        tipo: 'nova-escala',
      },
    });
  };

  /**
   * Enviar notificação de check-in pendente
   */
  const notificarCheckInPendente = async (escala: {
    voluntario: string;
    ministerio: string;
    funcao: string;
    evento: string;
    data: string;
    horario: string;
  }) => {
    return enviarNotificacao({
      title: '⏰ Lembrete: Check-In em 60 minutos',
      body: `${escala.voluntario} - ${escala.funcao} em ${escala.evento}`,
      tag: `checkin-${escala.data}-${escala.horario}`,
      requireInteraction: true,
      data: {
        url: '/escalas',
        tipo: 'checkin-pendente',
      },
    });
  };

  /**
   * Enviar notificação genérica
   */
  const notificar = (titulo: string, mensagem: string, tipo: string = 'info') => {
    return enviarNotificacao({
      title: titulo,
      body: mensagem,
      tag: `notificacao-${Date.now()}`,
      data: {
        tipo,
      },
    });
  };

  return {
    permissaoGranted,
    serviceWorkerRegistrado,
    solicitarPermissao,
    enviarNotificacao,
    notificarNovaEscala,
    notificarCheckInPendente,
    notificar,
  };
};
