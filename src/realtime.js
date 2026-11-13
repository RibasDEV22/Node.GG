import { CONFIG } from "./config.js";

export class Realtime extends EventTarget {
  constructor() {
    super();

    this.ws = null;
    this.connectPromise = null;
    this.pending = new Map();
    this.seq = 0;
    this.retry = 0;
    this.timer = 0;
    this.manual = false;
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect() {
    if (this.connected) return Promise.resolve();
    if (this.connectPromise) return this.connectPromise;

    this.manual = false;

    const opening = new Promise((resolve, reject) => {
      let ws;

      try {
        ws = new WebSocket(CONFIG.WS);
      } catch (error) {
        reject(new Error("Não foi possível abrir o WebSocket: " + error.message));
        return;
      }

      this.ws = ws;
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;

        settled = true;
        reject(new Error("O servidor demorou para responder ao WebSocket."));
        try {
          ws.close(4000, "Connection timeout");
        } catch {}
      }, 15000);

      ws.onopen = () => {
        if (settled) return;

        settled = true;
        clearTimeout(timeout);
        this.retry = 0;
        resolve();
        this.dispatchEvent(new Event("open"));
      };

      ws.onerror = () => {
        if (settled) return;

        settled = true;
        clearTimeout(timeout);
        reject(new Error("Não foi possível conectar ao servidor. Verifique o endereço e a origem liberada no CORS."));
      };

      ws.onmessage = event => this.receive(event.data);

      ws.onclose = event => {
        clearTimeout(timeout);

        const reason = event.reason
          ? ` (código ${event.code}: ${event.reason})`
          : ` (código ${event.code})`;
        const error = new Error("Conexão interrompida" + reason);

        if (!settled) {
          settled = true;
          reject(error);
        }

        if (this.ws === ws) this.ws = null;

        this.rejectPending(error);
        this.dispatchEvent(new CustomEvent("close", {
          detail: {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          }
        }));

        if (!this.manual) this.reconnect();
      };
    });

    let tracked;
    tracked = opening.finally(() => {
      if (this.connectPromise === tracked) this.connectPromise = null;
    });

    this.connectPromise = tracked;
    return tracked;
  }

  reconnect() {
    if (this.manual) return;

    clearTimeout(this.timer);

    const delay = Math.min(15000, 800 * Math.pow(1.7, this.retry++));
    this.timer = setTimeout(async () => {
      if (this.manual) return;

      try {
        await this.connect();

        const token =
          localStorage.getItem(CONFIG.TOKEN) ||
          sessionStorage.getItem(CONFIG.TOKEN);

        if (token) {
          this.send({
            type: "reconnect_session",
            sessionToken: token
          });
        }
      } catch {
        // A próxima tentativa é agendada pelo evento de fechamento do socket.
      }
    }, delay);
  }

  rejectPending(error) {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }

  receive(raw) {
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const match = [...this.pending.entries()].find(([, pending]) =>
      pending.types.includes(data.type)
    );

    if (match) {
      const [id, pending] = match;
      clearTimeout(pending.timer);
      this.pending.delete(id);
      pending.resolve(data);
    }

    this.dispatchEvent(new CustomEvent("message", { detail: data }));
  }

  send(data) {
    if (!this.connected) {
      throw new Error("Você está desconectado.");
    }

    this.ws.send(JSON.stringify(data));
  }

  request(data, types, timeoutMs = 10000) {
    const expectedTypes = Array.isArray(types) ? types : [types];

    if (!expectedTypes.length || expectedTypes.some(type => typeof type !== "string")) {
      return Promise.reject(new Error("Tipos de resposta inválidos para a requisição."));
    }

    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("O servidor não respondeu a tempo."));
      }, timeoutMs);

      this.pending.set(id, {
        types: expectedTypes,
        resolve,
        reject,
        timer
      });

      try {
        this.send(data);
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  close() {
    this.manual = true;
    clearTimeout(this.timer);

    const ws = this.ws;
    this.ws = null;

    this.rejectPending(new Error("Conexão encerrada pelo aplicativo."));

    if (ws && ws.readyState < WebSocket.CLOSING) {
      try {
        ws.close(1000, "Client closed");
      } catch {}
    }
  }
}
