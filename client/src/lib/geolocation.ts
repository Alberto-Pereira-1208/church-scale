/**
 * Coordenadas do local de check-in
 * Rua Norberto Seara Heusi, 793 - Escola Agrícola - Blumenau/SC
 */
export const LOCAL_CHECKIN = {
  latitude: -26.9194,
  longitude: -49.0647,
  nome: 'Escola Agrícola - Blumenau/SC',
  endereco: 'Rua Norberto Seara Heusi, 793 - Blumenau/SC',
  raioPermitido: 100, // metros
};

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface ResultadoGeolocation {
  sucesso: boolean;
  coordenadas?: Coordenadas;
  erro?: string;
}

export interface ResultadoCheckIn {
  permitido: boolean;
  distancia: number;
  mensagem: string;
}

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * Retorna a distância em metros
 */
export const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;

  return Math.round(distancia);
};

/**
 * Obtém a localização atual do usuário
 */
export const obterLocalizacao = async (): Promise<ResultadoGeolocation> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        sucesso: false,
        erro: 'Geolocalização não suportada neste navegador',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          sucesso: true,
          coordenadas: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (erro) => {
        let mensagemErro = 'Erro ao obter localização';

        switch (erro.code) {
          case erro.PERMISSION_DENIED:
            mensagemErro = 'Permissão de localização negada. Ative a localização nas configurações do navegador.';
            break;
          case erro.POSITION_UNAVAILABLE:
            mensagemErro = 'Informação de localização indisponível';
            break;
          case erro.TIMEOUT:
            mensagemErro = 'Timeout ao obter localização. Tente novamente.';
            break;
        }

        resolve({
          sucesso: false,
          erro: mensagemErro,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Valida se o usuário está dentro do raio permitido para check-in
 */
export const validarCheckIn = (
  coordenadas: Coordenadas,
  local: typeof LOCAL_CHECKIN = LOCAL_CHECKIN
): ResultadoCheckIn => {
  const distancia = calcularDistancia(
    coordenadas.latitude,
    coordenadas.longitude,
    local.latitude,
    local.longitude
  );

  const permitido = distancia <= local.raioPermitido;

  let mensagem = '';
  if (permitido) {
    mensagem = `✅ Você está a ${distancia}m do local. Check-in permitido!`;
  } else {
    const distanciaFora = distancia - local.raioPermitido;
    mensagem = `❌ Você está a ${distancia}m do local (${distanciaFora}m fora do raio permitido de ${local.raioPermitido}m)`;
  }

  return {
    permitido,
    distancia,
    mensagem,
  };
};

/**
 * Formata a distância para exibição
 */
export const formatarDistancia = (distancia: number): string => {
  if (distancia < 1000) {
    return `${distancia}m`;
  }
  return `${(distancia / 1000).toFixed(2)}km`;
};
