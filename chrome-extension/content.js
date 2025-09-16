console.log("content.js injetado na página!");

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
        const { startDay, startMonth, endDay, endMonth, format } = message;
        const today = new Date();
        const year = today.getFullYear();
        
        // Lista de todas as áreas (providerIds)
        const allProviderIds = ["2645", "368", "2596", "745", "3414", "4220"];
        const areaNames = {
            "2645": "VIRTUS II",
            "368": "VIRTUS R.4.4", 
            "2596": "VIRTUS I",
            "745": "VIRTUS R3.2",
            "3414": "VIRTUS VPA",
            "4220": "VIRTUS R1"
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
        const { startDay, startMonth, endDay, endMonth, providerId } = message;
        const today = new Date();
        const year = today.getFullYear();

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
});