# Chamada com os amigos

Voz, câmera e compartilhamento de tela com som, direto no navegador (WebRTC).
Funciona no computador e no celular.

## Colocar no ar (GitHub + Render, grátis)

### 1. Enviar para o GitHub

1. Descompacte o zip no seu computador.
2. Crie uma conta em github.com e clique em **New repository**. Dê um nome
   (ex.: chamada-amigos) e crie.
3. Na página do repositório, clique em **uploading an existing file**.
4. Abra a pasta descompactada e arraste o CONTEÚDO dela (server.js,
   package.json, render.yaml, .gitignore, README.md e a pasta public) para a página.
   Importante: o server.js precisa ficar na raiz do repositório, não dentro
   de uma subpasta.
5. Clique em **Commit changes**.

### 2. Publicar no Render

1. Crie uma conta em render.com (pode entrar com o GitHub).
2. Clique em **New → Blueprint** e selecione o repositório.
3. Confirme. O Render lê o render.yaml e configura tudo sozinho.
4. Em alguns minutos aparece o endereço do site, algo como
   https://chamada-amigos.onrender.com (já com HTTPS).
5. Abra no celular ou no computador, escolha um código de sala e envie o link
   para os amigos.

Se o Blueprint não aparecer, use **New → Web Service**, escolha o repositório e
preencha: Runtime Node, Build Command `npm install`, Start Command `npm start`,
plano Free.

## Transmitir o jogo com som (computador)

1. Use o **Chrome** ou o **Edge** no Windows (no Mac, só o Chrome 141 ou mais novo com macOS 14.2+).
2. Entre na sala e clique em **Compartilhar tela**.
3. Na janela que abrir, escolha **Tela inteira**, selecione o monitor do jogo e marque
   **Compartilhar áudio do sistema**. Clique em Compartilhar.
4. Os amigos ouvem o som do jogo. A voz deles NÃO volta para a transmissão, porque o
   site tira o próprio som da captura. Por isso, deixe a chamada aberta no navegador
   (não use outro programa de voz ao mesmo tempo).
5. Jogos em tela cheia exclusiva podem não aparecer. Se a tela ficar preta, troque o
   jogo para "tela cheia sem bordas" (borderless/janela).

Qualidade: até 1080p e 60 fps, limitado a cerca de 4 Mbps por amigo. Como a conexão
é direta, cada amigo extra consome mais da sua internet de envio.

## Anfitrião e remover pessoas

- Quem entra primeiro na sala é o **anfitrião**. Se ele sair, o próximo da fila assume.
- O anfitrião vê o botão **Remover da chamada** em cima do vídeo de cada pessoa.
- Quem foi removido não consegue voltar na mesma sala enquanto ela estiver aberta.
  Isso vale para o aparelho/navegador dele. Se a sala esvaziar, o bloqueio some.
- Para uma sala mais fechada, use um código difícil de adivinhar.

## Microfone: o que cada pessoa vê

Na tela de entrada há um quadro "Microfone" com o estado atual (Não liberado, Liberado,
Bloqueado, Não encontrado, Em uso) e um botão **Permitir microfone**. Ao tocar, o
navegador abre a janela de permissão: é só tocar em **Permitir**. Depois, uma barra
mostra o som da voz, então dá para confirmar que está funcionando antes de entrar.

Se alguém não consegue liberar:

- **Aviso "Abra no navegador":** o link foi aberto dentro do Instagram, Facebook, TikTok
  etc. Esses apps bloqueiam o microfone. A pessoa deve abrir no Chrome (Android) ou
  no Safari (iPhone). Há um botão para copiar o link.
- **Estado "Bloqueado":** a pessoa tocou em "Bloquear" antes. O quadro mostra os passos
  certos para o aparelho dela (iPhone, Android ou computador) para liberar de novo.
- **Estado "Endereço inseguro":** o site precisa abrir com https://.
- **Dentro da sala:** quem entrou sem microfone vê um aviso e o botão **Liberar
  microfone**, sem precisar sair e entrar de novo.

## Dicas

- No plano grátis o Render "dorme" quando ninguém usa. O primeiro acesso do dia
  pode levar cerca de um minuto.
- Microfone, câmera e tela só funcionam em HTTPS. O Render já entrega isso.
- Compartilhar tela só funciona no computador (Chrome ou Edge). Na janela de
  escolha, marque "Compartilhar áudio".
- Celular: use o Chrome (Android) ou o Safari (iPhone) e toque em "Permitir"
  quando pedir o microfone. Evite abrir o link dentro do Instagram ou do WhatsApp.
- Limite de 8 pessoas por sala (MAX_PEOPLE no server.js).
- Se alguém não conseguir conectar (rede muito restrita), adicione um servidor
  TURN na lista ICE do public/index.html.

## Testar no seu computador antes

    npm install
    npm start

Abra http://localhost:3000 em duas abas.
