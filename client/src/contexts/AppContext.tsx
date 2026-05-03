import React, { createContext, useContext, useState, useEffect } from 'react';
import { Escala, Voluntario, Ministerio, db, removerEscalasAntigas, detectarERegistrarFaltas } from '@/lib/db';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { seedDadosExemplo } from '@/lib/seedData';

interface AppContextType {
  escalas: Escala[];
  voluntarios: Voluntario[];
  ministerios: Ministerio[];
  carregando: boolean;
  adicionarEscala: (escala: Omit<Escala, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<void>;
  atualizarEscala: (id: number, escala: Partial<Escala>) => Promise<void>;
  deletarEscala: (id: number) => Promise<void>;
  adicionarVoluntario: (nome: string) => Promise<void>;
  adicionarMinisterio: (nome: string) => Promise<void>;
  recarregarDados: () => Promise<void>;
  exportarDados: () => Promise<string>;
  importarDados: (dados: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Ativar notificações locais
  useNotificacoes();

  // Carregar dados do banco de dados
  const recarregarDados = async () => {
    try {
      setCarregando(true);
      await seedDadosExemplo();
      await removerEscalasAntigas();
      await detectarERegistrarFaltas();
      
      const escalasData = await db.escalas.toArray();
      const voluntariosData = await db.voluntarios.toArray();
      const ministeriosData = await db.ministerios.toArray();
      
      setEscalas(escalasData);
      setVoluntarios(voluntariosData);
      setMinisterios(ministeriosData);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    } finally {
      setCarregando(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    recarregarDados();
  }, []);

  const adicionarEscala = async (escala: Omit<Escala, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const agora = Date.now();
      const novaEscala: Escala = {
        ...escala,
        criadoEm: agora,
        atualizadoEm: agora,
      };
      
      const id = await db.escalas.add(novaEscala);
      
      // Adicionar notificações para a escala
      await db.notificacoes.bulkAdd([
        { escalaId: id, tipo: 'tres_dias', enviada: false },
        { escalaId: id, tipo: 'um_dia', enviada: false },
        { escalaId: id, tipo: 'manha', enviada: false },
        { escalaId: id, tipo: 'uma_hora', enviada: false },
        { escalaId: id, tipo: 'checkin_60min', enviada: false },
      ]);
      
      await recarregarDados();
    } catch (erro) {
      console.error('Erro ao adicionar escala:', erro);
      throw erro;
    }
  };

  const atualizarEscala = async (id: number, escala: Partial<Escala>) => {
    try {
      await db.escalas.update(id, {
        ...escala,
        atualizadoEm: Date.now(),
      });
      await recarregarDados();
    } catch (erro) {
      console.error('Erro ao atualizar escala:', erro);
      throw erro;
    }
  };

  const deletarEscala = async (id: number) => {
    try {
      await db.escalas.delete(id);
      await db.notificacoes.where('escalaId').equals(id).delete();
      // Nota: Registros de presenca/falta no historico NAO sao deletados (imutaveis)
      await recarregarDados();
    } catch (erro) {
      console.error('Erro ao deletar escala:', erro);
      throw erro;
    }
  };

  const adicionarVoluntario = async (nome: string) => {
    try {
      const novoVoluntario: Voluntario = {
        nome,
        criadoEm: Date.now(),
      };
      await db.voluntarios.add(novoVoluntario);
      await recarregarDados();
    } catch (erro) {
      console.error('Erro ao adicionar voluntário:', erro);
      throw erro;
    }
  };

  const adicionarMinisterio = async (nome: string) => {
    try {
      const novoMinisterio: Ministerio = {
        nome,
        criadoEm: Date.now(),
      };
      await db.ministerios.add(novoMinisterio);
      await recarregarDados();
    } catch (erro) {
      console.error('Erro ao adicionar ministério:', erro);
      throw erro;
    }
  };

  const exportarDados = async (): Promise<string> => {
    try {
      const escalasData = await db.escalas.toArray();
      const voluntariosData = await db.voluntarios.toArray();
      const ministeriosData = await db.ministerios.toArray();
      
      const dados = {
        escalas: escalasData,
        voluntarios: voluntariosData,
        ministerios: ministeriosData,
        exportadoEm: new Date().toISOString(),
      };
      
      return JSON.stringify(dados, null, 2);
    } catch (erro) {
      console.error('Erro ao exportar dados:', erro);
      throw erro;
    }
  };

  const importarDados = async (dados: string) => {
    try {
      const parsed = JSON.parse(dados);
      
      // Limpar dados existentes
      await db.escalas.clear();
      await db.voluntarios.clear();
      await db.ministerios.clear();
      await db.notificacoes.clear();
      
      // Importar novos dados
      if (parsed.escalas && Array.isArray(parsed.escalas)) {
        await db.escalas.bulkAdd(parsed.escalas);
      }
      if (parsed.voluntarios && Array.isArray(parsed.voluntarios)) {
        await db.voluntarios.bulkAdd(parsed.voluntarios);
      }
      if (parsed.ministerios && Array.isArray(parsed.ministerios)) {
        await db.ministerios.bulkAdd(parsed.ministerios);
      }
      
      await recarregarDados();
    } catch (erro) {
      console.error('Erro ao importar dados:', erro);
      throw erro;
    }
  };

  const value: AppContextType = {
    escalas,
    voluntarios,
    ministerios,
    carregando,
    adicionarEscala,
    atualizarEscala,
    deletarEscala,
    adicionarVoluntario,
    adicionarMinisterio,
    recarregarDados,
    exportarDados,
    importarDados,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};
