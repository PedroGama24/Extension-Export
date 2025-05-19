document.getElementById("start").addEventListener("click", async () => {
  const startDay = parseInt(document.getElementById("startDay").value, 10);
  const startMonth = parseInt(document.getElementById("startMonth").value, 10);
  const endDay = parseInt(document.getElementById("endDay").value, 10);
  const endMonth = parseInt(document.getElementById("endMonth").value, 10);

  document.getElementById("status").textContent = "Iniciando exportação...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      document.getElementById("status").textContent = "Erro: Nenhuma aba ativa encontrada.";
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: "START_EXPORT_RANGE", startDay, startMonth, endDay, endMonth },
      (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById("status").textContent = "Erro ao iniciar exportação.";
        } else {
          document.getElementById("status").textContent = "Exportação em andamento...";
        }
      }
    );
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "EXPORT_STATUS") {
        document.getElementById("status").textContent = message.status;
      }
    });
  });
});