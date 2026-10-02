/**
 * Módulo de Notificações Web Push e Áudio/Vídeo Chamadas para o Node.GG
 */

// Converter chave VAPID base64 para Uint8Array (requisito do Browser)
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export class PushNotificationManager {
    constructor(wsClient, vapidPublicKey) {
        this.ws = wsClient; // Instância do seu WebSocket Client
        this.vapidPublicKey = vapidPublicKey;
        this.swRegistration = null;
    }

    /**
     * Inicializa o Service Worker e tenta registrar o Web Push
     */
    async init() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('[PUSH] Notificações Push não são suportadas neste navegador.');
            return false;
        }

        try {
            // Registra o Service Worker
            this.swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('[PUSH] Service Worker registrado com sucesso.');

            // Escuta mensagens vindas do Service Worker (Ações de clicar em Responder / Atender / Recusar)
            this.listenToSWControl();

            return true;
        } catch (error) {
            console.error('[PUSH] Erro ao registrar Service Worker:', error);
            return false;
        }
    }

    /**
     * Solcita permissão e inscreve o dispositivo no Push do servidor
     */
    async subscribe() {
        if (!this.swRegistration) {
            const ok = await this.init();
            if (!ok) return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('[PUSH] Permissão de notificação negada pelo usuário.');
                return false;
            }

            // Verifica se já existe uma assinatura ativa
            let subscription = await this.swRegistration.pushManager.getSubscription();

            // Se não existir, cria uma nova usando a chave VAPID
            if (!subscription) {
                const convertedKey = urlBase64ToUint8Array(this.vapidPublicKey);
                subscription = await this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedKey
                });
            }

            // Envia os dados de subscrição para o backend via WebSocket
            this.sendSubscriptionToServer(subscription);
            return true;
        } catch (error) {
            console.error('[PUSH] Erro ao inscrever no Push Notification:', error);
            return false;
        }
    }

    /**
     * Envia os dados da inscrição (endpoint, p256dh, auth) ao servidor Node
     */
    sendSubscriptionToServer(subscription) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const subData = subscription.toJSON();
        this.ws.send(JSON.stringify({
            type: 'subscribe_push',
            subscription: {
                endpoint: subData.endpoint,
                keys: {
                    p256dh: subData.keys.p256dh,
                    auth: subData.keys.auth
                }
            }
        }));
    }

    /**
     * Cancela as notificações neste navegador
     */
    async unsubscribe() {
        if (!this.swRegistration) return;

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            if (subscription) {
                const endpoint = subscription.endpoint;
                await subscription.unsubscribe();

                // Notifica o servidor para remover do banco
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({
                        type: 'unsubscribe_push',
                        endpoint: endpoint
                    }));
                }
            }
        } catch (error) {
            console.error('[PUSH] Erro ao desativar notificações:', error);
        }
    }

    /**
     * Ouve ações vindas das notificações do SO/Celular (Servidor -> ServiceWorker -> App Frontend)
     */
    listenToSWControl() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || !data.action) return;

            switch (data.action) {
                case 'ACCEPT_CALL':
                    console.log('[PUSH ACTION] Atender chamada de:', data.caller);
                    // Dispare o evento na sua UI para abrir a chamada e responder WebRTC
                    window.dispatchEvent(new CustomEvent('node_accept_call', { detail: data }));
                    break;

                case 'REJECT_CALL':
                    console.log('[PUSH ACTION] Recusar chamada de:', data.caller);
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({
                            type: 'call_reject',
                            caller: data.caller
                        }));
                    }
                    break;

                case 'QUICK_REPLY':
                    console.log('[PUSH ACTION] Resposta rápida enviada:', data.replyText);
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({
                            type: 'chat_message',
                            to: data.sender,
                            text: data.replyText,
                            msg_type: 'text'
                        }));
                    }
                    break;

                case 'MARK_READ':
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({
                            type: 'mark_as_read',
                            withUser: data.sender
                        }));
                    }
                    break;
            }
        });
    }
}
