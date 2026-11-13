const HTTP = "https://node-server-9sza.onrender.com";

export const CONFIG = Object.freeze({
  HTTP,
  WS: HTTP.replace(/^http/, "ws"),
  TOKEN: "nodegg.session",
  USER: "nodegg.user",
  PUSH_KEY: "/api/push/public-key"
});
