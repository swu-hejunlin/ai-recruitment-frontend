import { ref, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

let globalWs: WebSocket | null = null
let reconnectTimer: number | null = null
const MAX_RECONNECT_DELAY = 30000

export function useWebSocket() {
  const connected = ref(false)
  const userStore = useUserStore()

  function connect() {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) return
    if (!userStore.token) return

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws/notifications?token=${userStore.token}`

    try {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        connected.value = true
        globalWs = ws
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'notification') {
            userStore.unreadNotificationCount = data.unreadCount || 0
          }
        } catch {
          // 非JSON消息忽略
        }
      }

      ws.onclose = () => {
        connected.value = false
        globalWs = null
        scheduleReconnect()
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      scheduleReconnect()
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return
    const delay = Math.min(5000, MAX_RECONNECT_DELAY)
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      if (userStore.isLogin) {
        connect()
      }
    }, delay)
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (globalWs) {
      globalWs.close()
      globalWs = null
    }
    connected.value = false
  }

  return { connected, connect, disconnect }
}
