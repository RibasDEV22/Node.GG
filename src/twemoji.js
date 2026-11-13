(() => {
    "use strict";

    const ASSET_BASE = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/";

    function parse(root) {
        if (!root || !window.twemoji || root.nodeType !== Node.ELEMENT_NODE) return;
        if (root.closest?.(".twemoji")) return;

        window.twemoji.parse(root, {
            base: ASSET_BASE,
            folder: "svg",
            ext: ".svg",
            className: "twemoji"
        });
    }

    function start() {
        if (!window.twemoji) {
            console.warn("[Node.GG] Twemoji não foi carregado.");
            return;
        }

        // Renderiza o conteúdo inicial sem alterar valores de inputs/textarea.
        parse(document.body);

        // O Node.GG recria partes da interface com innerHTML.
        // Observamos novos elementos para aplicar os emojis também nas mensagens
        // recebidas em tempo real, notificações, modais e outras áreas dinâmicas.
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== "childList") continue;

                const target = mutation.target;
                if (target.nodeType !== Node.ELEMENT_NODE) continue;
                if (target.closest?.(".twemoji")) continue;
                if (target.matches?.("script,style,textarea,input,option")) continue;

                // Só reprocessa a região que recebeu conteúdo novo.
                parse(target);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        window.NodeTwemoji = {
            render: parse,
            renderAll: () => parse(document.body)
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
