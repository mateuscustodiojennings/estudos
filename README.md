# Sistema Web de Acompanhamento de Estudos

Aplicação web completa, moderna, minimalista e responsiva para acompanhamento e gerenciamento de estudos, desenvolvida com base rigorosa no catálogo de Ciências da Natureza e Matemática do Professor Ferretto (`Mapa Ferretto CN e Matematica.pdf`).

---

## 1. Objetivo do Projeto

Permitir o acompanhamento visual, objetivo e estruturado da evolução dos estudos em **Química**, **Física**, **Matemática** e **Biologia**, oferecendo:
- Visualização hierárquica fiel: Matéria &rarr; Módulos &rarr; Aulas/Tópicos.
- Conclusão individual de módulos e de aulas/subdivisões com recálculo automático de progresso.
- Cálculo de percentual de conclusão por matéria e geral baseado na regra estrita: `(módulos concluídos / total de módulos) * 100`.
- Filtros em tempo real por pendências, módulos concluídos, módulos pendentes e busca textual completa.
- Persistência permanente na nuvem através do **MongoDB Atlas**.
- Autenticação com senhas protegidas por hash (`bcryptjs`) e sessões seguras em cookies HttpOnly para sincronização entre computador, tablet e celular.
- Preparação completa para hospedagem no **Render**.

---

## 2. Tecnologias Utilizadas

- **Frontend:**
  - Next.js 16 (App Router)
  - React 18
  - TypeScript
  - Bootstrap 5 & Bootstrap Icons
  - Identidade visual minimalista em tons de branco, cinza neutro e realces em azul-bebê (`#38bdf8` / `#0284c7`).
- **Backend & API:**
  - Node.js com Route Handlers do Next.js (`app/api/`)
  - Autenticação com JWT em cookies HttpOnly e `bcryptjs`
  - Validação estrita de parâmetros e tratamento de erros
- **Banco de Dados:**
  - MongoDB Atlas com driver oficial `mongodb`
  - Gerenciamento de pool de conexões singleton (`lib/mongodb.ts`)
  - Índices otimizados para busca e ordenação
- **Hospedagem:**
  - Render (Web Service com porta dinâmica via `process.env.PORT`)
  - `render.yaml` pronto para deploy automatizado
- **Testes & Qualidade:**
  - Test runner nativo do Node.js (`node --test`)
  - Testes com banco real em memória via `mongodb-memory-server`

---

## 3. Estrutura das Pastas

```text
monitoramento_estudos/
├── app/                           # Páginas e Rotas do Next.js (App Router)
│   ├── api/                       # API Route Handlers
│   │   ├── auth/                  # Endpoints de autenticação (register, login, logout, me)
│   │   ├── health/                # Endpoint de verificação de integridade (Render)
│   │   ├── progress/              # Consulta e persistência de conclusão
│   │   ├── stats/                 # Estatísticas gerais e por matéria
│   │   └── subjects/              # Consulta da árvore de matérias e módulos
│   ├── login/                     # Página de acesso e cadastro de usuário
│   ├── globals.css                # Estilização minimalista e variáveis de cores
│   ├── layout.tsx                 # Layout raiz com Bootstrap e metadados
│   └── page.tsx                   # Dashboard principal e lista de estudos
├── data/                          # Dados estruturados
│   └── study_structure.json       # Estrutura JSON extraída fielmente do PDF
├── lib/                           # Módulos reutilizáveis
│   ├── auth.ts                    # Criptografia de senhas e tokens JWT
│   ├── data-store.ts              # Regras de negócio, cálculos e persistência
│   ├── mongodb.ts                 # Conexão e pooling do MongoDB Atlas
│   └── session.ts                 # Resolução de sessões e cookies de convidado
├── scripts/                       # Scripts operacionais
│   ├── extract_pdf.py             # Script de extração fiel do PDF original
│   └── import_data.mjs            # Importação idempotente para o MongoDB Atlas
├── tests/                         # Suítes de testes automatizados
│   ├── data_integrity.test.mjs    # Teste de fidelidade dos dados extraídos
│   ├── mongodb_integration.test.mjs # Teste de operações reais no MongoDB
│   └── progress_calculations.test.mjs # Teste das fórmulas de percentual
├── types/                         # Interfaces TypeScript
│   └── index.ts                   # Definições de Matérias, Módulos, Itens e Estatísticas
├── Mapa Ferretto CN e Matematica.pdf # Arquivo PDF fonte original
├── relatorio_extracao.md          # Relatório analítico detalhado da extração
├── render.yaml                    # Especificação de implantação no Render
├── .env.example                   # Modelo de variáveis de ambiente
├── package.json                   # Dependências e comandos de execução
└── tsconfig.json                  # Configuração do TypeScript
```

---

## 4. Como Instalar as Dependências

Certifique-se de possuir o **Node.js** (versão 18 ou superior) instalado em seu sistema:

```bash
npm install
```

---

## 5. Como Executar Localmente

### Modo Desenvolvimento:
```bash
npm run dev
```
Acesse a aplicação no navegador em: `http://localhost:3000`

### Modo Produção Local:
```bash
npm run build
npm start
```

---

## 6. Como Configurar o MongoDB Atlas

1. Crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crie um cluster gratuito (M0 Sandbox).
3. Na seção **Security -> Database Access**, crie um usuário e uma senha (ex: `admin_estudos`).
4. Na seção **Security -> Network Access**, adicione uma regra de IP permitindo acesso (`0.0.0.0/0` para conexões via Render e desenvolvimento).
5. Na aba **Database -> Connect -> Drivers -> Node.js**, copie a string de conexão:
   ```text
   mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Substitua `<usuario>` e `<senha>` pelas credenciais criadas.

---

## 7. Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):

```bash
cp .env.example .env
```

Preencha os valores:

| Variável | Descrição | Exemplo |
|---|---|---|
| `MONGODB_URI` | String de conexão do cluster MongoDB Atlas | `mongodb+srv://admin:senha123@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB` | Nome do banco de dados no Atlas | `monitoramento_estudos` |
| `JWT_SECRET` | Chave de criptografia para sessões (mínimo 32 caracteres) | `chave_aleatoria_longa_e_super_segura_2026` |
| `NODE_ENV` | Ambiente de execução (`development` ou `production`) | `production` |
| `PORT` | Porta HTTP (definida automaticamente pelo Render) | `3000` |

---

## 8. Como Importar os Dados do PDF

O projeto possui um fluxo em duas etapas totalmente reprodutível:

### Etapa 1: Extração direta do PDF
Lê o arquivo `Mapa Ferretto CN e Matematica.pdf` e gera `data/study_structure.json` e `relatorio_extracao.md`:
```bash
npm run extract:pdf
```

### Etapa 2: Importação para o MongoDB Atlas
Conecta ao banco configurado em `MONGODB_URI` e insere/atualiza as matérias e índices de forma **idempotente** (sem apagar o progresso do usuário):
```bash
npm run import:pdf
```

---

## 9. Como Conferir a Estrutura Importada

Consulte o arquivo [`relatorio_extracao.md`](relatorio_extracao.md) gerado na raiz do projeto. Ele detalha:
- Todas as 4 matérias.
- Todos os 76 módulos catalogados.
- As quantidades de aulas declaradas vs tópicos extraídos.
- As notas originais do catálogo (ex: as duas seções de Ecologia e os 6 módulos em tópicos com marcadores).
- Os identificadores únicos estáveis atribuídos a cada módulo e item.

---

## 10. Como Executar os Testes

Execute a suíte completa de testes automatizados com o comando:

```bash
npm test
```

Os testes executam:
- Verificação de fidelidade de todos os 76 módulos e 1.525 tópicos contra o PDF.
- Validação da integridade de IDs estáveis sem duplicações.
- Testes com banco de dados real em memória via `mongodb-memory-server` (conexão, índices, criação de usuário com hash bcrypt, persistência de conclusão e idempotência de importação).
- Cálculo das fórmulas de percentual geral e por matéria.

---

## 11. Como Gerar o Build de Produção

Para testar a compilação otimizada para produção:

```bash
npm run build
```

---

## 12. Como Publicar no Render

1. Envie o repositório para o seu GitHub / GitLab:
   ```bash
   git init
   git add .
   git commit -m "feat: Sistema de Acompanhamento de Estudos"
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
2. Acesse o painel do [Render](https://render.com) e clique em **New + &rarr; Web Service**.
3. Selecione seu repositório Git.
4. O Render detectará automaticamente o arquivo [`render.yaml`](render.yaml) incluído no projeto. Caso prefira configurar manualmente:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
5. Na aba **Environment Variables**, adicione:
   - `MONGODB_URI`: Sua string de conexão do MongoDB Atlas.
   - `MONGODB_DB`: `monitoramento_estudos`
   - `JWT_SECRET`: Uma string aleatória longa.
   - `NODE_ENV`: `production`
6. Após a primeira implantação, você pode popular o MongoDB Atlas rodando a importação no terminal do Render (Shell) ou localmente apontando o `.env` para o mesmo cluster:
   ```bash
   npm run import:pdf
   ```

---

## 13. Como Verificar Logs e Diagnosticar Erros

1. **Endpoint de Diagnóstico:**
   Acesse a rota de saúde `/api/health` em seu navegador ou via curl:
   ```bash
   curl https://seu-app.onrender.com/api/health
   ```
   Retorno esperado:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-10-20T...",
     "uptimeSeconds": 120,
     "database": {
       "configured": true,
       "status": "connected"
     },
     "nodeEnv": "production"
   }
   ```
2. **Logs no Render:**
   No painel do serviço no Render, clique na aba **Logs** para inspecionar em tempo real erros de inicialização, requisições HTTP e falhas de conexão com o banco.
3. **Falhas comuns:**
   - `MONGODB_URI não está configurada`: Verifique se adicionou a variável no painel de Environment do Render.
   - `MongoServerSelectionError`: O IP do Render não foi liberado no MongoDB Atlas. Acesse o Atlas e adicione a regra `0.0.0.0/0` em *Network Access*.

---

## 14. Como Atualizar os Módulos no Futuro sem Perder o Progresso

Caso um novo PDF seja fornecido no futuro com atualizações de conteúdo:

1. Substitua o arquivo PDF na pasta raiz.
2. Execute a extração:
   ```bash
   npm run extract:pdf
   ```
3. Execute o script de importação:
   ```bash
   npm run import:pdf
   ```

O script utiliza operações `$set` com `upsert` baseadas nos identificadores estáveis (`id`). Ele atualiza os nomes e conteúdos das matérias e módulos **sem apagar ou redefinir a coleção `progress`**, preservando o histórico de conclusão já conquistado.
