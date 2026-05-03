import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface DadosExportacao {
  estatisticas: {
    total: number;
    presentes: number;
    ausentes: number;
    pendentes: number;
    taxaPresenca: number;
  };
  ministerios: Array<{
    name: string;
    presentes: number;
    ausentes: number;
    total: number;
    taxa: number;
  }>;
  voluntarios: Array<{
    name: string;
    presentes: number;
    ausentes: number;
    taxa: number;
    total: number;
  }>;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Limpar estilos problemáticos de cores Tailwind 4 (OKLAB, OKLCH)
 */
const limparEstilosProblematicos = (element: Element) => {
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.getAttribute('style') || '';
    
    // Remover atributos de estilo que contenham oklab ou oklch
    if (style.includes('oklab') || style.includes('oklch')) {
      const cleanStyle = style
        .replace(/background-color\s*:\s*oklab\([^)]*\)[^;]*/g, '')
        .replace(/color\s*:\s*oklab\([^)]*\)[^;]*/g, '')
        .replace(/background-color\s*:\s*oklch\([^)]*\)[^;]*/g, '')
        .replace(/color\s*:\s*oklch\([^)]*\)[^;]*/g, '')
        .replace(/--[^:]*:\s*oklab\([^)]*\)[^;]*/g, '')
        .replace(/--[^:]*:\s*oklch\([^)]*\)[^;]*/g, '')
        .replace(/;\s*;/g, ';')
        .trim();
      
      if (cleanStyle) {
        htmlEl.setAttribute('style', cleanStyle);
      } else {
        htmlEl.removeAttribute('style');
      }
    }
  });
};

/**
 * Exportar dashboard como PDF
 * Corrigido para compatibilidade com cores Tailwind 4 (OKLAB, OKLCH)
 */
export const exportarPDF = async (elementId: string, dados: DadosExportacao) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    // Criar cópia do elemento
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Limpar estilos problemáticos
    limparEstilosProblematicos(clone);
    
    // Adicionar clone temporariamente ao DOM fora da tela
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = element.offsetWidth + 'px';
    tempContainer.style.visibility = 'hidden';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    try {
      // Capturar o elemento como imagem
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#000000',
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          // Ignorar elementos problemáticos
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
      });

      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width em mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar imagem ao PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height em mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Salvar PDF
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      pdf.save(`relatorio-presenca-${dataAtual}.pdf`);
    } finally {
      // Remover container temporário
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
  } catch (erro) {
    console.error('Erro ao exportar PDF:', erro);
    throw erro;
  }
};

/**
 * Exportar dados como Excel
 */
export const exportarExcel = (dados: DadosExportacao) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Aba 1: Estatísticas Gerais
    const estatisticasSheet = [
      ['ESTATÍSTICAS GERAIS'],
      [''],
      ['Métrica', 'Valor'],
      ['Total de Escalas', dados.estatisticas.total],
      ['Presentes', dados.estatisticas.presentes],
      ['Ausentes', dados.estatisticas.ausentes],
      ['Pendentes', dados.estatisticas.pendentes],
      ['Taxa de Presença (%)', dados.estatisticas.taxaPresenca],
    ];

    if (dados.dataInicio || dados.dataFim) {
      estatisticasSheet.push(['']);
      estatisticasSheet.push(['Período do Relatório']);
      if (dados.dataInicio) estatisticasSheet.push(['Data Início', dados.dataInicio]);
      if (dados.dataFim) estatisticasSheet.push(['Data Fim', dados.dataFim]);
    }

    estatisticasSheet.push(['']);
    estatisticasSheet.push(['Data de Geração', new Date().toLocaleString('pt-BR')]);

    const wsEstatisticas = XLSX.utils.aoa_to_sheet(estatisticasSheet);
    XLSX.utils.book_append_sheet(workbook, wsEstatisticas, 'Estatísticas');

    // Aba 2: Ministérios
    const ministeriosSheet = [
      ['PRESENÇA POR MINISTÉRIO'],
      [''],
      ['Ministério', 'Presentes', 'Ausentes', 'Total', 'Taxa (%)'],
      ...dados.ministerios.map(m => [
        m.name,
        m.presentes,
        m.ausentes,
        m.total,
        m.taxa,
      ]),
    ];

    const wsMinisterios = XLSX.utils.aoa_to_sheet(ministeriosSheet);
    // Definir largura das colunas
    wsMinisterios['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsMinisterios, 'Ministérios');

    // Aba 3: Voluntários
    const voluntariosSheet = [
      ['PRESENÇA POR VOLUNTÁRIO'],
      [''],
      ['Voluntário', 'Presentes', 'Ausentes', 'Total', 'Taxa (%)'],
      ...dados.voluntarios.map(v => [
        v.name,
        v.presentes,
        v.ausentes,
        v.total,
        v.taxa,
      ]),
    ];

    const wsVoluntarios = XLSX.utils.aoa_to_sheet(voluntariosSheet);
    wsVoluntarios['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsVoluntarios, 'Voluntários');

    // Salvar arquivo
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(workbook, `relatorio-presenca-${dataAtual}.xlsx`);
  } catch (erro) {
    console.error('Erro ao exportar Excel:', erro);
    throw erro;
  }
};

/**
 * Exportar dados como CSV
 */
export const exportarCSV = (dados: DadosExportacao) => {
  try {
    let csv = 'RELATÓRIO DE PRESENÇA\n';
    csv += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n\n`;

    if (dados.dataInicio || dados.dataFim) {
      csv += 'PERÍODO DO RELATÓRIO\n';
      if (dados.dataInicio) csv += `Data Início: ${dados.dataInicio}\n`;
      if (dados.dataFim) csv += `Data Fim: ${dados.dataFim}\n`;
      csv += '\n';
    }

    // Estatísticas
    csv += 'ESTATÍSTICAS GERAIS\n';
    csv += `Total de Escalas,${dados.estatisticas.total}\n`;
    csv += `Presentes,${dados.estatisticas.presentes}\n`;
    csv += `Ausentes,${dados.estatisticas.ausentes}\n`;
    csv += `Pendentes,${dados.estatisticas.pendentes}\n`;
    csv += `Taxa de Presença (%),${dados.estatisticas.taxaPresenca}\n\n`;

    // Ministérios
    csv += 'PRESENÇA POR MINISTÉRIO\n';
    csv += 'Ministério,Presentes,Ausentes,Total,Taxa (%)\n';
    dados.ministerios.forEach(m => {
      csv += `"${m.name}",${m.presentes},${m.ausentes},${m.total},${m.taxa}\n`;
    });
    csv += '\n';

    // Voluntários
    csv += 'PRESENÇA POR VOLUNTÁRIO\n';
    csv += 'Voluntário,Presentes,Ausentes,Total,Taxa (%)\n';
    dados.voluntarios.forEach(v => {
      csv += `"${v.name}",${v.presentes},${v.ausentes},${v.total},${v.taxa}\n`;
    });

    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-presenca-${dataAtual}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (erro) {
    console.error('Erro ao exportar CSV:', erro);
    throw erro;
  }
};
