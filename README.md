# Node.GG — Client

Frontend web do Node.GG, desenvolvido em HTML, CSS e JavaScript nativo. A mesma camada de interface foi pensada para ser reutilizada futuramente nos clientes desktop e Android.

## Desenvolvimento

O frontend é estático e não precisa de um servidor Node próprio para executar:

- Abra o projeto com qualquer servidor HTTP local (por exemplo, Live Server).
- A entrada da aplicação é `index.html`.
- O código da aplicação fica em `src/`.
- Os estilos ficam em `styles/`.

## Backend

A URL de produção é centralizada em `src/config.js`:

- HTTP: `https://node-server-9sza.onrender.com`
- WebSocket: `wss://node-server-9sza.onrender.com`

Não coloque segredos do backend no frontend. O token LiveKit é temporário e emitido pelo servidor; chaves privadas e credenciais de serviço nunca devem ser adicionadas a este repositório.

## Publicação no Render

O arquivo `render.yaml` descreve um Static Site:

1. No Render, crie um novo Blueprint ou Static Site conectado a este repositório.
2. Use a raiz do repositório como diretório publicado.
3. Não é necessário comando de build.
4. Publique em HTTPS para que WebSocket seguro, câmera, microfone, compartilhamento de tela e Service Worker possam funcionar.

## Módulos

- `src/config.js`: configuração HTTP/WebSocket.
- `src/realtime.js`: transporte WebSocket, correlação de respostas e reconexão de sessão.
- `src/app.js`: autenticação, shell da aplicação, amigos, mensagens, grupos, notificações, presença, sessões e chamadas.
- `styles/app.css`: design system e layout responsivo.
- `sw.js`: notificações push e cache básico do shell.

## Integrações externas

- Chamadas individuais dependem de permissões do navegador, WebRTC e conectividade STUN/TURN adequada.
- Chamadas em grupo dependem de LiveKit configurado no backend e do SDK cliente carregado pelo navegador.
- Notificações push dependem de VAPID configurado no backend e permissão concedida pelo usuário.
- Amigos dependem das rotas HTTP autenticadas do backend.

## Limites conhecidos da implantação atual

A interface web ainda precisa passar por validação ponta a ponta com contas reais, Turso, Render, navegadores e uma instância LiveKit configurada. O backend mantém algumas filas e estados de sinalização em memória e foi projetado para uma única instância Node por enquanto. Recursos de mídia e reconexão precisam ser testados em dispositivos e redes reais antes de serem considerados prontos para produção.
