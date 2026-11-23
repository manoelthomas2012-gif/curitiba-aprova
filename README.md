# CURITIBA APROVA — Preparatório Inteligente (Agente Administrativo 2026)

Plataforma web pessoal de estudos para o concurso da **Prefeitura Municipal de Curitiba 2026** (Edital nº 4/2026, cargo **Agente Administrativo**, banca **Fundação FAFIPA**).

Projetada para uma rotina realista de **90 minutos por dia (segunda a sexta-feira)**, com foco em Active Recall, revisão espaçada (D+1, D+3, D+7, D+14, D+30), caderno de erros inteligente, banco de questões com origem transparente, simulados cronometrados e analytics 100% baseados em dados reais.

---

## 1. Arquitetura do Projeto

```text
curitiba-aprova/
├── .github/workflows/deploy.yml   # Deploy automático no GitHub Pages
├── public/
│   ├── icon.svg                   # Ícone PWA
│   ├── manifest.webmanifest       # Manifesto PWA instalável
│   └── sw.js                      # Service Worker básico offline
├── src/
│   ├── components/                # Layout, Sidebar, ConfirmModal, Toast
│   ├── data/                      # seedData.ts (histórico real, 26 tópicos, aulas, questões, flashcards)
│   ├── hooks/                     # useAppState.ts (estado reativo + timer + persistência)
│   ├── pages/                     # As 12 telas principais da plataforma
│   ├── styles/                    # index.css (Tailwind + variáveis)
│   ├── types/                     # Tipagem TypeScript completa
│   ├── utils/                     # storage.ts (LocalStorage + JSON backup) e priorityEngine.ts
│   ├── App.tsx                    # Roteamento por hash/estado compatível com GitHub Pages
│   └── main.tsx                   # Bootstrap React + registro do Service Worker
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts                 # Configurado com base: './' para evitar tela branca no GitHub Pages
```

## 2. Pré-requisitos e Instalação Local

1. Instale o **Node.js 18 ou superior** (`https://nodejs.org`).
2. Extraia o projeto e abra o terminal na pasta `curitiba-aprova`:
   ```bash
   npm install
   ```
3. Inicie em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse o endereço exibido no terminal (normalmente `http://localhost:5173`).

Para gerar o build de produção local e testar:
```bash
npm run build
npm run preview
```

## 3. Como Criar o Repositório e Publicar no GitHub Pages

1. Crie um repositório no GitHub chamado `curitiba-aprova` (público ou privado com Pages habilitado).
2. No terminal, dentro da pasta do projeto, execute:
   ```bash
   git init
   git add .
   git commit -m "feat: primeira versão da plataforma CURITIBA APROVA"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/curitiba-aprova.git
   git push -u origin main
   ```
3. No GitHub, acesse **Settings → Pages**:
   - Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. O workflow `.github/workflows/deploy.yml` será executado automaticamente a cada `push` na branch `main`.
5. Após ~1 minuto, sua plataforma estará online em:
   `https://SEU-USUARIO.github.io/curitiba-aprova/`

## 4. Como Atualizar Futuramente

Sempre que quiser adicionar novas aulas, questões ou ajustes no código:
```bash
git add .
git commit -m "chore: atualização de conteúdos e questões"
git push
```
O GitHub Actions fará o build e publicará a nova versão automaticamente.

## 5. Segurança dos Dados e Backup (Importante)

- Todos os seus dados ficam salvos **localmente no navegador** (`localStorage`), sem backend pago, sem Firebase/Supabase e sem envio de dados para servidores externos.
- **Atenção:** dados locais **não sincronizam automaticamente** entre computador e celular.
- Para transferir seu progresso entre dispositivos ou manter cópia de segurança:
  1. Acesse **Configurações → Backup e Restauração**.
  2. Clique em **EXPORTAR MEUS ESTUDOS** para baixar um arquivo `.json`.
  3. No outro dispositivo, clique em **IMPORTAR BACKUP** e selecione o arquivo `.json`.
