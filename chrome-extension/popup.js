// 🎯 Aplicando as 8 Regras de Ouro de Shneiderman

// 1. CONSISTÊNCIA - Elementos consistentes em toda a interface
// 2. ATALHOS - Teclas de atalho e navegação por teclado
// 3. FEEDBACK INFORMATIVO - Feedback visual e sonoro em tempo real
// 4. DESIGN DE DIÁLOGOS - Fluxos claros com início, meio e fim
// 5. PREVENÇÃO DE ERROS - Validação em tempo real
// 6. REVERSÃO FÁCIL - Ações podem ser canceladas
// 7. CONTROLE DO USUÁRIO - Usuário sempre no controle
// 8. REDUÇÃO DA CARGA COGNITIVA - Interface simples e intuitiva

let isExporting = false;
let exportController = null;

// Função para mostrar status com animações e cores
function showStatus(message, type = 'info', duration = 0) {
  const statusEl = document.getElementById('status');
  const progressBar = document.getElementById('progressBar');
  
  statusEl.textContent = message;
  statusEl.className = `show ${type}`;
  
  if (type === 'info' && message.includes('andamento')) {
    progressBar.classList.add('show');
  } else if (type === 'success' || type === 'error') {
    progressBar.classList.remove('show');
    if (duration > 0) {
      setTimeout(() => {
        statusEl.classList.remove('show');
      }, duration);
    }
  }
}

// Função para atualizar progresso
function updateProgress(percentage) {
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = `${percentage}%`;
}

// Validação em tempo real
function validateInput(inputId, errorId, min, max) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  const value = parseInt(input.value);
  
  if (isNaN(value) || value < min || value > max) {
    error.classList.add('show');
    input.style.borderColor = '#e74c3c';
    input.parentElement.classList.add('shake');
    setTimeout(() => input.parentElement.classList.remove('shake'), 500);
    return false;
  } else {
    error.classList.remove('show');
    input.style.borderColor = '#27ae60';
    return true;
  }
}

// Função para validar datas
function validateDateRange() {
  const startMonth = parseInt(document.getElementById('startMonth').value);
  const startDay = parseInt(document.getElementById('startDay').value);
  const endMonth = parseInt(document.getElementById('endMonth').value);
  const endDay = parseInt(document.getElementById('endDay').value);
  
  const startDate = new Date(2025, startMonth - 1, startDay);
  const endDate = new Date(2025, endMonth - 1, endDay);
  
  return startDate <= endDate;
}

// Event listeners para validação em tempo real
document.getElementById('startDay').addEventListener('input', function() {
  validateInput('startDay', 'startDayError', 1, 31);
});

document.getElementById('endDay').addEventListener('input', function() {
  validateInput('endDay', 'endDayError', 1, 31);
});

// Feedback visual para foco nos inputs
document.querySelectorAll('.form-group').forEach(group => {
  const input = group.querySelector('input, select');
  if (input) {
    input.addEventListener('focus', () => {
      group.classList.add('focus');
    });
    input.addEventListener('blur', () => {
      group.classList.remove('focus');
    });
  }
});

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
  // Enter para iniciar exportação
  if (e.key === 'Enter' && !isExporting) {
    e.preventDefault();
    document.getElementById('start').click();
  }
  
  // Esc para cancelar exportação
  if (e.key === 'Escape' && isExporting) {
    e.preventDefault();
    cancelExport();
  }
  
  // Tab para navegação aprimorada
  if (e.key === 'Tab') {
    // Adiciona feedback visual ao elemento focado
    setTimeout(() => {
      const focused = document.activeElement;
      if (focused && focused.tagName !== 'BODY') {
        focused.classList.add('pulse');
        setTimeout(() => focused.classList.remove('pulse'), 1000);
      }
    }, 10);
  }
});

// Função para cancelar exportação
function cancelExport() {
  if (exportController) {
    exportController.abort();
  }
  isExporting = false;
  const button = document.getElementById('start');
  const buttonText = document.getElementById('buttonText');
  
  button.disabled = false;
  buttonText.textContent = '🚀 Iniciar Exportação';
  showStatus('❌ Exportação cancelada pelo usuário', 'error', 3000);
  updateProgress(0);
}

// Mostra/esconde opção de formato quando "Todos" é selecionado
document.getElementById('area').addEventListener('change', function() {
  const formatGroup = document.getElementById('formatGroup');
  formatGroup.style.transition = 'all 0.3s ease';
  
  if (this.value === 'todos') {
    formatGroup.style.display = 'block';
    setTimeout(() => {
      formatGroup.style.opacity = '1';
      formatGroup.style.transform = 'translateY(0)';
    }, 10);
  } else {
    formatGroup.style.opacity = '0';
    formatGroup.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      formatGroup.style.display = 'none';
    }, 300);
  }
});

// Verifica na inicialização se "Todos" está selecionado
window.addEventListener('load', function() {
  const areaSelect = document.getElementById('area');
  const formatGroup = document.getElementById('formatGroup');
  
  if (areaSelect.value === 'todos') {
    formatGroup.style.display = 'block';
    formatGroup.style.opacity = '1';
  }
  
  // Configuração inicial dos campos de data
  const today = new Date();
  document.getElementById('startMonth').value = today.getMonth() + 1;
  document.getElementById('endMonth').value = today.getMonth() + 1;
  document.getElementById('startDay').value = 1;
  document.getElementById('endDay').value = today.getDate();
  
  showStatus('✅ Interface carregada com sucesso!', 'success', 2000);
});

// Função principal de exportação com feedback aprimorado
document.getElementById('start').addEventListener('click', async () => {
  // Validação completa antes de iniciar
  const startDayValid = validateInput('startDay', 'startDayError', 1, 31);
  const endDayValid = validateInput('endDay', 'endDayError', 1, 31);
  
  if (!startDayValid || !endDayValid) {
    showStatus('❌ Por favor, corrija os erros nos campos destacados', 'error', 4000);
    return;
  }
  
  if (!validateDateRange()) {
    showStatus('❌ A data inicial deve ser anterior ou igual à data final', 'error', 4000);
    return;
  }
  
  const startDay = parseInt(document.getElementById('startDay').value, 10);
  const startMonth = parseInt(document.getElementById('startMonth').value, 10);
  const endDay = parseInt(document.getElementById('endDay').value, 10);
  const endMonth = parseInt(document.getElementById('endMonth').value, 10);
  const providerId = document.getElementById('area').value;
  const format = document.getElementById('format').value;
  
  // Controle de estado da exportação
  isExporting = true;
  exportController = new AbortController();
  
  const button = document.getElementById('start');
  const buttonText = document.getElementById('buttonText');
  
  button.disabled = true;
  buttonText.textContent = '⏳ Exportando... (ESC para cancelar)';
  
  showStatus('🚀 Iniciando exportação...', 'info');
  updateProgress(10);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      showStatus('❌ Erro: Nenhuma aba ativa encontrada', 'error', 4000);
      isExporting = false;
      button.disabled = false;
      buttonText.textContent = '🚀 Iniciar Exportação';
      return;
    }

    const messageType = providerId === 'todos' ? 'START_EXPORT_ALL_AREAS' : 'START_EXPORT_RANGE';
    
    updateProgress(20);
    
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: messageType, startDay, startMonth, endDay, endMonth, providerId, format },
      (response) => {
        if (chrome.runtime.lastError) {
          showStatus('❌ Erro ao iniciar exportação', 'error', 4000);
          isExporting = false;
          button.disabled = false;
          buttonText.textContent = '🚀 Iniciar Exportação';
        } else {
          updateProgress(30);
          showStatus('⚙️ Exportação em andamento...', 'info');
        }
      }
    );
    
    // Listener para atualizações de status
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'EXPORT_STATUS') {
        let progressValue = 30;
        
        if (message.status.includes('Baixando')) {
          progressValue = 40 + Math.random() * 40; // 40-80%
        } else if (message.status.includes('Juntando') || message.status.includes('Criando')) {
          progressValue = 85;
        } else if (message.status.includes('concluída')) {
          progressValue = 100;
          isExporting = false;
          button.disabled = false;
          buttonText.textContent = '🚀 Iniciar Exportação';
          showStatus('🎉 ' + message.status, 'success', 5000);
        } else if (message.status.includes('Erro')) {
          progressValue = 0;
          isExporting = false;
          button.disabled = false;
          buttonText.textContent = '🚀 Iniciar Exportação';
          showStatus('❌ ' + message.status, 'error', 5000);
        } else {
          showStatus('ℹ️ ' + message.status, 'info');
        }
        
        updateProgress(Math.min(progressValue, 100));
      }
    });
  });
});