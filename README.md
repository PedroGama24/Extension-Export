# Exportação Automática de CSV

Extensão para Google Chrome que automatiza a exportação de arquivos CSV de múltiplos dias a partir do Oracle Cloud (Alloha).

## Funcionalidades

- Permite selecionar um intervalo de datas (mês e dia inicial/final).
- Faz o download automático dos arquivos CSV de cada dia do intervalo.
- Junta todos os arquivos em um único CSV final.
- Interface simples e intuitiva.

## Como usar

1. **Instale a extensão no Chrome:**
   - Baixe ou clone este repositório.
   - No Chrome, acesse `chrome://extensions/`.
   - Ative o modo de desenvolvedor.
   - Clique em "Carregar sem compactação" e selecione a pasta `chrome-extension`.

2. **Acesse o Oracle Cloud (Alloha):**
   - Entre normalmente no sistema.

3. **Abra a extensão:**
   - Clique no ícone da extensão no Chrome.

4. **Preencha os campos:**
   - Selecione o **Mês inicial** e **Dia inicial**.
   - Selecione o **Mês final** e **Dia final**.
   - Clique em **Iniciar Exportação**.

5. **Aguarde o download:**
   - O status será exibido na tela.
   - O arquivo CSV final será baixado automaticamente.

## Estrutura do Projeto

```
chrome-extension/
├── background.js
├── content.js
├── manifest.json
├── popup.html
├── popup.js
```

- `manifest.json`: Configuração da extensão.
- `popup.html`: Interface do usuário.
- `popup.js`: Lógica do popup e comunicação com o content script.
- `content.js`: Realiza as requisições e gera o CSV.
- `background.js`: Inicialização da extensão.

## Permissões

- `activeTab`, `downloads`, `scripting`: Necessárias para interagir com a página e baixar arquivos.
- `host_permissions`: Permite acesso ao domínio do Oracle Cloud.

## Observações

- A extensão só funciona em páginas do domínio `alloha.fs.ocs.oraclecloud.com`.
- É necessário estar autenticado no sistema para que o download funcione.

## Licença

MIT

Copyright (c) 2025 Pedro Gama

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EV
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Desenvolvido com ❤️ para facilitar sua rotina!