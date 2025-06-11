import  { useState, useEffect } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(url: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    // Don't connect if no URL is provided
    if (!url) return;
    
    // Mock WebSocket for development 
    // This would be a real WebSocket connection in production
    const mockSocket = {
      onopen: null as any,
      onclose: null as any,
      onmessage: null as any,
      onerror: null as any,
      close: () => {
        if (mockSocket.onclose) mockSocket.onclose({});
        setIsConnected(false);
      },
      send: (data: string) => {
        console.log('WebSocket message sent:', data);
      }
    };
    
    // Simulate connection
    setTimeout(() => {
      if (mockSocket.onopen) mockSocket.onopen({});
      setIsConnected(true);
    }, 500);
    
    setSocket(mockSocket as any);
    
    return () => {
      mockSocket.close();
    };
  }, [url]);

  // Set up event handlers when socket changes
  useEffect(() => {
    if (!socket) return;
    
    const handleOpen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    const handleClose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onopen = handleOpen;
    socket.onclose = handleClose;
    socket.onmessage = handleMessage;
    socket.onerror = handleError;
    
    return () => {
      socket.onopen = null;
      socket.onclose = null;
      socket.onmessage = null;
      socket.onerror = null;
    };
  }, [socket]);

  return { socket, isConnected, lastMessage };
}

// Custom hooks for specific websocket connections
export function useLobbyWebSocket() {
  // For development, we'll just mock the WebSocket
  // In production, this would use the actual WebSocket URL
  const wsUrl = 'wss://api.reemteam.example.com/lobby/socket';
  
  return useWebSocket(wsUrl);
}

export function useGameWebSocket(gameId: string | null) {
  // Only connect if we have a gameId
  const wsUrl = gameId ? `wss://api.reemteam.example.com/game/${gameId}/socket` : null;
  
  return useWebSocket(wsUrl);
}
 