console.log("content.js injetado na página!");

// Função para processar dados no formato de relatório
function processDataForReport(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) return csvData;
    
    // Função auxiliar para converter coluna (A, B, C, ..., AA, AB, ..., AF, ..., Y, Z, AA, AB, ...) para índice
    function columnToIndex(column) {
        let index = 0;
        for (let i = 0; i < column.length; i++) {
            index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
        }
        return index - 1; // Converte para base 0
    }
    
    // Primeiro, vamos detectar automaticamente as colunas de data pelo nome
    // Vamos procurar por "Data" e "Data Abertura Chamado" nos cabeçalhos
    
    // Parse CSV robusto
    let allData = [];
    let headers = [];
    
    lines.forEach((line, lineIndex) => {
        if (!line.trim()) return;
        
        // Parse cuidadoso do CSV
        const cells = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i += 2;
                    continue;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                cells.push(current);
                current = '';
                i++;
                continue;
            } else {
                current += char;
            }
            i++;
        }
        cells.push(current);
        
        if (lineIndex === 0) {
            headers = cells.map(cell => cell.replace(/^"|"$/g, '').trim());
            allData.push(cells); // Mantém cabeçalho original
        } else {
            // Processa dados: detecta e formata colunas de data automaticamente
            const processedCells = cells.map((cell, cellIndex) => {
                let cleanCell = cell.replace(/^"|"$/g, '');
                
                // Verifica se a coluna atual é uma coluna de data pelo nome do cabeçalho
                const headerName = headers[cellIndex] || '';
                const isDateColumn = headerName.toLowerCase().includes('data') || 
                                   headerName.toLowerCase().includes('date') ||
                                   headerName.toLowerCase().includes('início') ||
                                   headerName.toLowerCase().includes('inicio') ||
                                   headerName.toLowerCase().includes('fim');
                
                // Formata datas se a coluna for identificada como data
                if (isDateColumn && cleanCell) {
                    const formattedDate = formatDateValue(cleanCell);
                    if (formattedDate !== cleanCell) {
                        cleanCell = formattedDate;
                    }
                }
                
                return cleanCell;
            });
            
            allData.push(processedCells);
        }
    });
    
    // Formata data para dd/mm/aaaa
    function formatDateValue(value) {
        if (!value || typeof value !== 'string') return value;
        
        let date = null;
        
        // YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            const datePart = value.split(' ')[0];
            const [year, month, day] = datePart.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // DD/MM/YYYY ou DD/MM/YY ou DD/MM/YYYY HH:mm:ss
        else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) {
            const datePart = value.split(' ')[0];
            let [day, month, year] = datePart.split('/');
            
            // Se ano tem apenas 2 dígitos, converte para 4 dígitos
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                year = parseInt(year) > 50 ? (currentCentury - 100 + parseInt(year)) : (currentCentury + parseInt(year));
            }
            
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // DD-MM-YYYY ou DD-MM-YY ou DD-MM-YYYY HH:mm:ss
        else if (/^\d{1,2}-\d{1,2}-\d{2,4}/.test(value)) {
            const datePart = value.split(' ')[0];
            let [day, month, year] = datePart.split('-');
            
            // Se ano tem apenas 2 dígitos, converte para 4 dígitos
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                year = parseInt(year) > 50 ? (currentCentury - 100 + parseInt(year)) : (currentCentury + parseInt(year));
            }
            
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // YYYY/MM/DD ou YY/MM/DD ou YYYY/MM/DD HH:mm:ss
        else if (/^\d{2,4}\/\d{1,2}\/\d{1,2}/.test(value)) {
            const datePart = value.split(' ')[0];
            let [year, month, day] = datePart.split('/');
            
            // Se ano tem apenas 2 dígitos, converte para 4 dígitos
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                year = parseInt(year) > 50 ? (currentCentury - 100 + parseInt(year)) : (currentCentury + parseInt(year));
            }
            
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // Formato brasileiro com horário: DD/MM/YYYY HH:mm ou DD/MM/YYYY HH:mm:ss
        else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}/.test(value)) {
            const [datePart] = value.split(' ');
            let [day, month, year] = datePart.split('/');
            
            // Se ano tem apenas 2 dígitos, converte para 4 dígitos
            if (year.length === 2) {
                const currentYear = new Date().getFullYear();
                const currentCentury = Math.floor(currentYear / 100) * 100;
                year = parseInt(year) > 50 ? (currentCentury - 100 + parseInt(year)) : (currentCentury + parseInt(year));
            }
            
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // Formato DD/MM HH:mm (sem ano) - assume ano atual
        else if (/^\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}/.test(value)) {
            const [datePart] = value.split(' ');
            const [day, month] = datePart.split('/');
            const currentYear = new Date().getFullYear();
            
            date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        }
        // Formato DD/MM (apenas dia e mês, sem ano e sem horário) - assume ano atual
        else if (/^\d{1,2}\/\d{1,2}$/.test(value.trim())) {
            const [day, month] = value.trim().split('/');
            const currentYear = new Date().getFullYear();
            
            date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        }
        
        if (date && !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            // Retorna apenas a data sem horário no formato dd/mm/aaaa (4 dígitos para o ano)
            return `${day}/${month}/${year}`;
        }
        
        return value;
    }
    
    // Função para obter valor para ordenação
    function getSortValue(cell) {
        if (!cell) return '';
        
        // Se é data, converte para timestamp para ordenação cronológica
        if (/^\d{2}\/\d{2}\/\d{4}/.test(cell)) {
            const [day, month, year] = cell.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
        }
        
        // Se é número, converte para número
        const numValue = parseFloat(cell.replace(/[^\d.-]/g, ''));
        if (!isNaN(numValue)) {
            return numValue;
        }
        
        // Se é texto, usa string para ordenação alfabética
        return cell.toLowerCase();
    }
    
    // Separa cabeçalho dos dados
    const headerRow = allData[0];
    const dataRows = allData.slice(1);
    
    // Encontra os índices das colunas de ordenação pelos nomes
    const dataColumnIndex = headers.findIndex(h => h.toLowerCase().includes('data') && !h.toLowerCase().includes('abertura'));
    const dataAberturaIndex = headers.findIndex(h => h.toLowerCase().includes('data') && h.toLowerCase().includes('abertura'));
    
    // Para ordenação, vamos usar as colunas de data encontradas
    // Se não encontrar, usa os índices originais como fallback
    const sortColumn1 = dataColumnIndex >= 0 ? dataColumnIndex : 1; // Coluna Data (B)
    const sortColumn2 = dataAberturaIndex >= 0 ? dataAberturaIndex : 14; // Data Abertura (O)
    const sortColumn3 = 31; // Coluna AF - mantém fixo por enquanto
    
    // Ordena dados pelas colunas encontradas (do menor para maior)
    dataRows.sort((a, b) => {
        // Primeiro pela primeira coluna de data
        const aCol1 = getSortValue(a[sortColumn1] || '');
        const bCol1 = getSortValue(b[sortColumn1] || '');
        
        if (aCol1 !== bCol1) {
            if (typeof aCol1 === 'number' && typeof bCol1 === 'number') {
                return aCol1 - bCol1;
            }
            return aCol1 < bCol1 ? -1 : 1;
        }
        
        // Se primeira coluna for igual, ordena pela segunda coluna de data
        const aCol2 = getSortValue(a[sortColumn2] || '');
        const bCol2 = getSortValue(b[sortColumn2] || '');
        
        if (aCol2 !== bCol2) {
            if (typeof aCol2 === 'number' && typeof bCol2 === 'number') {
                return aCol2 - bCol2;
            }
            return aCol2 < bCol2 ? -1 : 1;
        }
        
        // Se segunda coluna for igual, ordena pela terceira coluna
        const aCol3 = getSortValue(a[sortColumn3] || '');
        const bCol3 = getSortValue(b[sortColumn3] || '');
        
        if (typeof aCol3 === 'number' && typeof bCol3 === 'number') {
            return aCol3 - bCol3;
        }
        return aCol3 < bCol3 ? -1 : 1;
    });
    
    // Reconstrói CSV com dados ordenados
    const allSortedData = [headerRow, ...dataRows];
    
    const finalLines = allSortedData.map(row => {
        return row.map(cell => {
            // Adiciona aspas se necessário
            if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell || '';
        }).join(',');
    });
    
    return finalLines.join('\n');
}

// Função para criar Excel formatado para relatório (aba única)
function createExcelForReport(csvData, sheetName = "Relatório") {
    const lines = csvData.split('\n').filter(line => line.trim());
    
    let xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="DateCell">
   <NumberFormat ss:Format="dd/mm/yyyy"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName}">
  <Table>`;

    lines.forEach((line, rowIndex) => {
        if (!line.trim()) return;
        
        // Parse simples do CSV
        const cells = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                cells.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        cells.push(current.trim().replace(/^"|"$/g, ''));
        
        // Adiciona linha ao XML
        const isHeader = rowIndex === 0;
        xmlContent += `\n   <Row>`;
        
        cells.forEach((cell, cellIndex) => {
            // Escapa caracteres especiais do XML
            const escapedCell = cell.replace(/&/g, '&amp;')
                                   .replace(/</g, '&lt;')
                                   .replace(/>/g, '&gt;')
                                   .replace(/"/g, '&quot;')
                                   .replace(/'/g, '&apos;');
            
            let styleClass = '';
            let dataType = 'String';
            let cellValue = escapedCell;
            
            if (isHeader) {
                styleClass = ' ss:StyleID="Header"';
            } else {
                // Detecta colunas de data automaticamente pelo conteúdo
                const isDateCell = /^\d{2}\/\d{2}\/\d{4}$/.test(cell);
                
                if (isDateCell) {
                    // Se é data no formato dd/mm/yyyy, formata como data no Excel
                    const [day, month, year] = cell.split('/');
                    // Converte para formato de data do Excel (YYYY-MM-DD)
                    cellValue = `${year}-${month}-${day}`;
                    dataType = 'DateTime';
                    styleClass = ' ss:StyleID="DateCell"';
                } else {
                    // Detecta se é número
                    const isNumber = !isNaN(parseFloat(cell)) && isFinite(cell) && cell !== '';
                    if (isNumber) {
                        dataType = 'Number';
                        cellValue = parseFloat(cell);
                    }
                    styleClass = ' ss:StyleID="DataCell"';
                }
            }
            
            xmlContent += `\n    <Cell${styleClass}><Data ss:Type="${dataType}">${cellValue}</Data></Cell>`;
        });
        
        xmlContent += `\n   </Row>`;
    });

    xmlContent += `\n  </Table>
 </Worksheet>
</Workbook>`;

    return new Blob([xmlContent], { 
        type: 'application/vnd.ms-excel' 
    });
}

// Função para criar Excel com múltiplas abas usando XML nativo
function createExcelWithTabs(allAreaData) {
    // Cria um arquivo Excel simples usando XML que o Excel reconhece
    let xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
  </Style>
 </Styles>`;

    allAreaData.forEach(areaData => {
        // Nome da aba (limita e remove caracteres especiais)
        const sheetName = areaData.areaName.replace(/[&<>"']/g, '').substring(0, 31);
        
        xmlContent += `\n <Worksheet ss:Name="${sheetName}">
  <Table>`;

        // Processa os dados CSV
        const csvLines = areaData.csvData.split('\n').filter(line => line.trim());
        
        csvLines.forEach((line, rowIndex) => {
            if (!line.trim()) return;
            
            // Parse simples do CSV
            const cells = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cells.push(current.trim().replace(/^"|"$/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }
            cells.push(current.trim().replace(/^"|"$/g, ''));
            
            // Adiciona linha ao XML
            const styleClass = rowIndex === 0 ? ' ss:StyleID="Header"' : '';
            xmlContent += `\n   <Row${styleClass}>`;
            
            cells.forEach(cell => {
                // Escapa caracteres especiais do XML
                const escapedCell = cell.replace(/&/g, '&amp;')
                                       .replace(/</g, '&lt;')
                                       .replace(/>/g, '&gt;')
                                       .replace(/"/g, '&quot;')
                                       .replace(/'/g, '&apos;');
                
                // Detecta se é número
                const isNumber = !isNaN(parseFloat(cell)) && isFinite(cell) && cell !== '';
                const dataType = isNumber ? 'Number' : 'String';
                const cellValue = isNumber ? parseFloat(cell) : escapedCell;
                
                xmlContent += `\n    <Cell><Data ss:Type="${dataType}">${cellValue}</Data></Cell>`;
            });
            
            xmlContent += `\n   </Row>`;
        });

        xmlContent += `\n  </Table>
 </Worksheet>`;
    });

    xmlContent += `\n</Workbook>`;

    return new Blob([xmlContent], { 
        type: 'application/vnd.ms-excel' 
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_EXPORT") {
        const days = message.days.split(",").flatMap((part) => {
            if (part.includes("-")) {
                const [start, end] = part.split("-").map(Number);
                return Array.from({ length: end - start + 1 }, (_, i) => start + i);
            }
            return [Number(part)];
        });

        const month = Number(message.month); // Recebe do popup
        const today = new Date();
        const year = today.getFullYear();

        function formatDate(day) {
            const mm = month.toString().padStart(2, '0');
            const dd = day.toString().padStart(2, '0');
            return `${year}-${mm}-${dd}`;
        }

        function buildExportUrl(day) {
            const dateStr = formatDate(day);
            const timestamp = Date.now();
            return `https://alloha.fs.ocs.oraclecloud.com/?m=gridexport&a=download&itype=manage&providerId=2645&date=${dateStr}&panel=top&view=time&downloadId=mdivejeiiirk0wck2ud&dates=${dateStr}&recursively=1&&${timestamp}`;
        }

        function updateStatus(msg) {
            chrome.runtime.sendMessage({ type: "EXPORT_STATUS", status: msg });
        }

        (async () => {
            let csvs = [];
            for (const day of days) {
                const url = buildExportUrl(day);
                updateStatus(`Baixando CSV de ${day}...`);
                const resp = await fetch(url, { credentials: "include" });
                if (resp.ok) {
                    const text = await resp.text();
                    csvs.push(text);
                    updateStatus(`CSV do dia ${day} baixado com sucesso.`);
                } else {
                    updateStatus(`Erro ao baixar CSV do dia ${day}: ${resp.status}`);
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            updateStatus("Juntando arquivos...");

            if (csvs.length > 0) {
                let finalCsv = csvs[0];
                for (let i = 1; i < csvs.length; i++) {
                    finalCsv += '\n' + csvs[i].split('\n').slice(1).join('\n');
                }
                const BOM = '\uFEFF'; // UTF-8 BOM
                const blob = new Blob([BOM + finalCsv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'exportacao_unica.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                updateStatus("Exportação única concluída!");
                alert("Exportação única concluída!");
            } else {
                updateStatus("Nenhum CSV foi baixado.");
                alert("Nenhum CSV foi baixado.");
            }
        })();
    }

    if (message.type === "START_EXPORT_ALL_AREAS") {
        const { startDay, startMonth, endDay, endMonth, format, year } = message;
        
        // Lista de todas as áreas (providerIds)
        const allProviderIds = ["9163", "368"];
        const areaNames = {
            "9301": "VIRTUS RJ",
            "9163": "VIRTUS CGT", 
        };

        // Gera todas as datas do intervalo
        function getDateRange(startDay, startMonth, endDay, endMonth) {
            const dates = [];
            let current = new Date(year, startMonth - 1, startDay);
            const end = new Date(year, endMonth - 1, endDay);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }

        function formatDate(date) {
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const dd = date.getDate().toString().padStart(2, '0');
            return `${year}-${mm}-${dd}`;
        }

        function buildExportUrl(date, providerId) {
            const dateStr = formatDate(date);
            const timestamp = Date.now();
            return `https://alloha.fs.ocs.oraclecloud.com/?m=gridexport&a=download&itype=manage&providerId=${providerId}&date=${dateStr}&panel=top&view=time&downloadId=mdivejeiiirk0wck2ud&dates=${dateStr}&recursively=1&&${timestamp}`;
        }

        function updateStatus(msg) {
            chrome.runtime.sendMessage({ type: "EXPORT_STATUS", status: msg });
        }

        (async () => {
            const dates = getDateRange(startDay, startMonth, endDay, endMonth);
            let allAreaData = []; // Array para armazenar dados de cada área
            let totalAreas = allProviderIds.length;
            let currentArea = 0;

            for (const providerId of allProviderIds) {
                currentArea++;
                const areaName = areaNames[providerId];
                updateStatus(`Processando área ${currentArea}/${totalAreas}: ${areaName}...`);
                
                let areaCsvs = [];
                for (const date of dates) {
                    const url = buildExportUrl(date, providerId);
                    updateStatus(`${areaName} - Baixando CSV de ${formatDate(date)}...`);
                    
                    try {
                        const resp = await fetch(url, { credentials: "include" });
                        if (resp.ok) {
                            const text = await resp.text();
                            if (text.trim()) { // Só adiciona se o CSV não estiver vazio
                                areaCsvs.push(text);
                                updateStatus(`${areaName} - CSV do dia ${formatDate(date)} baixado com sucesso.`);
                            }
                        } else {
                            updateStatus(`${areaName} - Erro ao baixar CSV do dia ${formatDate(date)}: ${resp.status}`);
                        }
                    } catch (error) {
                        updateStatus(`${areaName} - Erro ao baixar CSV do dia ${formatDate(date)}: ${error.message}`);
                    }
                    
                    await new Promise((resolve) => setTimeout(resolve, 500)); // Delay menor para múltiplas áreas
                }

                // Processa os CSVs da área atual
                if (areaCsvs.length > 0) {
                    let areaFinalCsv = areaCsvs[0];
                    for (let i = 1; i < areaCsvs.length; i++) {
                        areaFinalCsv += '\n' + areaCsvs[i].split('\n').slice(1).join('\n');
                    }
                    
                    // Armazena dados da área para criar aba no Excel
                    allAreaData.push({
                        areaName: areaName,
                        csvData: areaFinalCsv
                    });
                }
                
                updateStatus(`Área ${areaName} processada. ${totalAreas - currentArea} áreas restantes.`);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Pausa entre áreas
            }

            updateStatus("Criando arquivo de exportação...");

            if (allAreaData.length > 0) {
                try {
                    if (format === "csv") {
                        // Exportação em CSV consolidado
                        updateStatus("Criando arquivo CSV consolidado...");
                        
                        let csvLines = [];
                        let headerAdded = false;
                        
                        allAreaData.forEach((areaData, areaIndex) => {
                            const lines = areaData.csvData.split('\n').filter(line => line.trim());
                            
                            if (lines.length > 0) {
                                lines.forEach((line, lineIndex) => {
                                    if (lineIndex === 0 && !headerAdded) {
                                        csvLines.push(line);
                                        headerAdded = true;
                                    } else if (lineIndex > 0) {
                                        if (line.trim()) {
                                            csvLines.push(line.trim());
                                        }
                                    }
                                });
                            }
                        });
                        
                        const finalCsvContent = csvLines.join('\n');
                        const BOM = '\uFEFF';
                        const blob = new Blob([BOM + finalCsvContent], { 
                            type: 'text/csv;charset=utf-8' 
                        });
                        
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'exportacao_todas_areas.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        updateStatus("Exportação CSV consolidado concluída!");
                        alert("Exportação CSV consolidado concluída!");
                    } else if (format === "report") {
                        // Exportação em formato de relatório Excel com dados formatados
                        updateStatus("Criando relatório Excel formatado...");
                        
                        let csvLines = [];
                        let headerAdded = false;
                        
                        allAreaData.forEach((areaData, areaIndex) => {
                            updateStatus(`Formatando dados da área ${areaData.areaName}...`);
                            
                            // Processa dados da área com formatação especial
                            const processedData = processDataForReport(areaData.csvData);
                            const lines = processedData.split('\n').filter(line => line.trim());
                            
                            if (lines.length > 0) {
                                lines.forEach((line, lineIndex) => {
                                    if (lineIndex === 0 && !headerAdded) {
                                        csvLines.push(line);
                                        headerAdded = true;
                                    } else if (lineIndex > 0) {
                                        if (line.trim()) {
                                            csvLines.push(line.trim());
                                        }
                                    }
                                });
                            }
                        });
                        
                        updateStatus("Gerando arquivo Excel formatado...");
                        
                        const finalCsvContent = csvLines.join('\n');
                        
                        // Cria arquivo Excel formatado em vez de CSV
                        const excelBlob = createExcelForReport(finalCsvContent, "Relatório Formatado");
                        
                        const url = URL.createObjectURL(excelBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'relatorio_dados_formatado.xls';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        updateStatus("Relatório Excel formatado concluído!");
                        alert("Relatório Excel formatado concluído!");
                    } else {
                        // Exportação em Excel com abas separadas (formato padrão)
                        updateStatus("Criando arquivo Excel com abas separadas...");
                        
                        const excelBlob = createExcelWithTabs(allAreaData);
                        
                        const url = URL.createObjectURL(excelBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'exportacao_todas_areas.xls';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        updateStatus("Exportação Excel com abas separadas concluída!");
                        alert("Exportação Excel com abas separadas concluída!");
                    }
                } catch (error) {
                    console.error('Erro ao criar arquivo:', error);
                    updateStatus("Erro ao criar arquivo. Criando CSV como alternativa...");
                    
                    // Fallback para CSV consolidado
                    let csvLines = [];
                    let headerAdded = false;
                    
                    allAreaData.forEach((areaData, areaIndex) => {
                        const lines = areaData.csvData.split('\n').filter(line => line.trim());
                        
                        if (lines.length > 0) {
                            lines.forEach((line, lineIndex) => {
                                if (lineIndex === 0 && !headerAdded) {
                                    csvLines.push(line);
                                    headerAdded = true;
                                } else if (lineIndex > 0) {
                                    if (line.trim()) {
                                        csvLines.push(line.trim());
                                    }
                                }
                            });
                        }
                    });
                    
                    const finalCsvContent = csvLines.join('\n');
                    const BOM = '\uFEFF';
                    const blob = new Blob([BOM + finalCsvContent], { 
                        type: 'text/csv;charset=utf-8' 
                    });
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'exportacao_todas_areas.csv';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    updateStatus("Exportação CSV alternativa concluída!");
                    alert("Exportação CSV alternativa concluída!");
                }
            } else {
                updateStatus("Nenhum dado foi baixado de qualquer área.");
                alert("Nenhum dado foi baixado de qualquer área.");
            }
        })();
    }

    if (message.type === "START_EXPORT_RANGE") {
        const { startDay, startMonth, endDay, endMonth, providerId, format, year } = message;

        // Gera todas as datas do intervalo
        function getDateRange(startDay, startMonth, endDay, endMonth) {
            const dates = [];
            let current = new Date(year, startMonth - 1, startDay);
            const end = new Date(year, endMonth - 1, endDay);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return dates;
        }

        function formatDate(date) {
            const mm = (date.getMonth() + 1).toString().padStart(2, '0');
            const dd = date.getDate().toString().padStart(2, '0');
            return `${year}-${mm}-${dd}`;
        }

        function buildExportUrl(date) {
            const dateStr = formatDate(date);
            const timestamp = Date.now();
            return `https://alloha.fs.ocs.oraclecloud.com/?m=gridexport&a=download&itype=manage&providerId=${providerId}&date=${dateStr}&panel=top&view=time&downloadId=mdivejeiiirk0wck2ud&dates=${dateStr}&recursively=1&&${timestamp}`;
        }

        function updateStatus(msg) {
            chrome.runtime.sendMessage({ type: "EXPORT_STATUS", status: msg });
        }

        (async () => {
            const dates = getDateRange(startDay, startMonth, endDay, endMonth);
            let csvs = [];
            for (const date of dates) {
                const url = buildExportUrl(date);
                updateStatus(`Baixando CSV de ${formatDate(date)}...`);
                const resp = await fetch(url, { credentials: "include" });
                if (resp.ok) {
                    const text = await resp.text();
                    csvs.push(text);
                    updateStatus(`CSV do dia ${formatDate(date)} baixado com sucesso.`);
                } else {
                    updateStatus(`Erro ao baixar CSV do dia ${formatDate(date)}: ${resp.status}`);
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            updateStatus("Juntando arquivos...");

            if (csvs.length > 0) {
                let finalCsv = csvs[0];
                for (let i = 1; i < csvs.length; i++) {
                    finalCsv += '\n' + csvs[i].split('\n').slice(1).join('\n');
                }
                
                // Se for modo relatório, processa os dados e cria Excel
                if (format === "report") {
                    updateStatus("Formatando dados do relatório...");
                    finalCsv = processDataForReport(finalCsv);
                    
                    updateStatus("Gerando arquivo Excel formatado...");
                    const excelBlob = createExcelForReport(finalCsv, "Relatório Formatado");
                    
                    const url = URL.createObjectURL(excelBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'relatorio_dados_formatado.xls';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    const successMessage = "Relatório Excel formatado concluído!";
                    updateStatus(successMessage);
                    alert(successMessage);
                    return; // Sai da função para não executar o código CSV abaixo
                }
                
                const BOM = '\uFEFF'; // UTF-8 BOM
                const blob = new Blob([BOM + finalCsv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const fileName = 'exportacao_unica.csv';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                const successMessage = "Exportação única concluída!";
                updateStatus(successMessage);
                alert(successMessage);
            } else {
                updateStatus("Nenhum CSV foi baixado.");
                alert("Nenhum CSV foi baixado.");
            }
        })();
    }
});