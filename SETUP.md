Guia rápido de setup e execução (Frontend + Backend)

Resumo
- Frontend: app Expo/React Native (pasta: frontend)
- Backend: FastAPI + SQLAlchemy (pasta: backend)

1) Pré-requisitos
- Node.js (>=16) e npm/yarn
- Python 3.10+ e virtualenv (opcional, recomendado)
- Git

2) Variáveis de ambiente recomendadas
Crie um arquivo .env na raiz da pasta backend com pelo menos:
- SECRET_KEY=uma-string-secreta
- ALGORITHM=HS256
- ACCESS_TOKEN_EXPIRE_MINUTES=1440
- DATABASE_URL (opcional; se não definido usa sqlite em backend/app.db)
- CORS_ORIGINS (opcional; exemplo: http://localhost:8081)

3) Backend — instalação e execução local
a) Instalar dependências
- Criar virtualenv (opcional):
  python3 -m venv backend/venv
  source backend/venv/bin/activate

- Instalar pacotes (se existir requirements.txt):
  pip install -r backend/requirements.txt

- Se não houver requirements.txt, instale ao menos:
  pip install fastapi uvicorn sqlalchemy python-dotenv pydantic passlib[bcrypt] python-jose python-multipart

b) Inicializar banco
- O projeto já chama Base.metadata.create_all() em backend/main.py — ao iniciar o servidor o arquivo SQLite (backend/app.db) será criado automaticamente se DATABASE_URL não for fornecido.

c) Rodar em modo dev
  cd backend
  source ../backend/venv/bin/activate  # se usar virtualenv
  uvicorn backend.main:app --reload --host 0.0.0.0 --port 5050

- Endpoints públicos: http://localhost:5050
- Uploads estáticos servidos em /media (pasta backend/media)

4) Frontend — instalação e execução local
a) Instalar dependências
  cd frontend
  npm install
  # ou yarn install

b) Rodar em modo dev (Expo)
  cd frontend
  npm run dev
  # Este comando executa: EXPO_NO_TELEMETRY=1 expo start

- O Metro Bundler normalmente escuta em http://localhost:8081
- Se ocorrer erro similar a "Cannot determine the project's Expo SDK version because the module `expo` is not installed", execute npm install na pasta frontend (ver passo 4a)

5) Integração Frontend ↔ Backend
- Frontend espera o backend em: http://localhost:5050 por padrão. Se usar outro host/porta, ajuste a variável EXPO_PUBLIC_API_URL no ambiente do Expo (ou no código que monta a BASE_URL em frontend).
- Rotas úteis:
  GET /users/me — retorna usuário atual (Bearer token)
  GET /users/me/profile — retorna perfil (novo endpoint implementado)
  PUT /users/me/profile — atualiza perfil (Bearer token)

6) Execução no ambiente da plataforma (DevServerControl)
Se estiver usando o ambiente do Builder (onde há DevServerControl):
- Setup: configure o comando de setup para instalar deps (ex.: cd frontend && npm install)
- Dev server: use `cd frontend && npm run dev` (frontend) e, em outro processo/agent, rode o backend com uvicorn
- O DevServerControl fornece logs e permite reiniciar o dev server se necessário.

7) Problemas comuns e troubleshooting
- Erro: "expo not installed" → executar npm install dentro de frontend
- Erro: Porta em uso → verifique se outro processo usa 8081 (frontend) ou 5050 (backend)
- Erro 401 em endpoints protegidos → verifique header Authorization: Bearer <token>
- Arquivos de mídia não aparecem → verifique backend/media e permissões

8) Próximos passos recomendados
- Criar backend/requirements.txt com as dependências fixas (recomendado para reprodutibilidade)
- Adicionar scripts no package.json root para iniciar backend (por ex.: "backend:dev": "uvicorn backend.main:app --reload --port 5050")
- Documentar variáveis de ambiente sensíveis e usar segredos em produção

Se quiser, eu adiciono um requirements.txt, scripts npm, ou implemento o formulário de edição do perfil no frontend e conecto ao endpoint PUT /users/me/profile.
