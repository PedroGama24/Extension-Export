console.log("content.js injetado na página!");
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
            return `https://alloha.fs.ocs.oraclecloud.com/?m=gridexport&a=download&itype=manage&providerId=2645&date=${dateStr}&panel=top&view=time&downloadId=auto&dates=${dateStr}`;
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

    if (message.type === "START_EXPORT_RANGE") {
        const { startDay, startMonth, endDay, endMonth } = message;
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
            return `https://alloha.fs.ocs.oraclecloud.com/?m=gridexport&a=download&itype=manage&providerId=2645&date=${dateStr}&panel=top&view=time&downloadId=auto&dates=${dateStr}`;
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