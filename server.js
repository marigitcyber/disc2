// Servidor de sinalização: serve o site e ajuda os navegadores a se encontrarem.
// O áudio e o vídeo NÃO passam por aqui, vão direto entre vocês (WebRTC).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const MAX_PEOPLE = 8; // limite por sala (conexão direta pesa acima disso)
const PUBLIC = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const file = path.normalize(path.join(PUBLIC, url === '/' ? 'index.html' : url));
  if (!file.startsWith(PUBLIC)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Não encontrado');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });
const rooms = new Map(); // código da sala -> Map(id -> ws)
const bans = new Map();  // código da sala -> Set(tokens removidos pelo anfitrião)
let nextId = 1;

const send = (ws, msg) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg));
};

// O anfitrião é quem entrou primeiro. Se ele sair, o próximo da fila assume.
const hostOf = (members) => (members.size ? members.keys().next().value : null);
const announceHost = (members) => {
  const id = hostOf(members);
  for (const p of members.values()) send(p, { type: 'host', id });
};

wss.on('connection', (ws) => {
  ws.id = String(nextId++);
  ws.room = null;
  ws.alive = true;
  ws.on('pong', () => (ws.alive = true));

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === 'join' && !ws.room) {
      const room = String(msg.room || '').trim().toLowerCase().slice(0, 40);
      if (!room) return;
      const token = String(msg.token || '').slice(0, 80);
      if (token && bans.get(room) && bans.get(room).has(token)) {
        return send(ws, { type: 'banned' });
      }
      const members = rooms.get(room) || new Map();
      if (members.size >= MAX_PEOPLE) return send(ws, { type: 'full' });

      ws.room = room;
      ws.token = token;
      ws.name = String(msg.name || '').trim().slice(0, 24) || 'Alguém';
      rooms.set(room, members);

      send(ws, {
        type: 'joined',
        id: ws.id,
        hostId: members.size ? hostOf(members) : ws.id,
        peers: [...members.values()].map((p) => ({ id: p.id, name: p.name })),
      });
      members.set(ws.id, ws);
      for (const p of members.values()) {
        if (p !== ws) send(p, { type: 'peer-joined', id: ws.id, name: ws.name });
      }
    } else if (msg.type === 'signal' && ws.room) {
      const members = rooms.get(ws.room);
      const out = { type: 'signal', from: ws.id, name: ws.name, data: msg.data };
      if (msg.to) {
        const target = members.get(msg.to);
        if (target) send(target, out);
      } else {
        for (const p of members.values()) if (p !== ws) send(p, out);
      }
    } else if (msg.type === 'kick' && ws.room) {
      const members = rooms.get(ws.room);
      if (!members || hostOf(members) !== ws.id) return; // só o anfitrião remove
      const target = members.get(String(msg.id));
      if (!target || target === ws) return;
      if (target.token) {
        if (!bans.has(ws.room)) bans.set(ws.room, new Set());
        bans.get(ws.room).add(target.token); // impede de voltar enquanto a sala existir
      }
      send(target, { type: 'kicked' });
      target.close();
    }
  });

  ws.on('close', () => {
    if (!ws.room) return;
    const members = rooms.get(ws.room);
    if (!members) return;
    const eraHost = hostOf(members) === ws.id;
    members.delete(ws.id);
    if (!members.size) {
      rooms.delete(ws.room);
      bans.delete(ws.room);
      return;
    }
    for (const p of members.values()) send(p, { type: 'peer-left', id: ws.id });
    if (eraHost) announceHost(members);
  });
});

// Mantém as conexões vivas em hospedagens que derrubam conexões ociosas
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) {
      ws.terminate();
      continue;
    }
    ws.alive = false;
    ws.ping();
  }
}, 30000);

server.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));
