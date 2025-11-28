import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, Send, Bot, User, TrendingUp, ListCheck, Shield, Loader } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { chatbotAsk, chatbotQuick } from '../services/analytics';
import './Chatbot.css'; // Importando el archivo de estilos

export function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de seguridad. Puedo ayudarte con información sobre delitos en Santander.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotAsk({ 
        pregunta: text,
        municipio: 'BUCARAMANGA',
        delito: ''
      });

      let responseText = 'Lo siento, no pude obtener una respuesta.';
      if (response?.respuesta) responseText = response.respuesta;
      else if (response?.answer) responseText = response.answer;
      else if (response?.response) responseText = response.response;
      else if (typeof response === 'string') responseText = response;

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Disculpa, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (tipo) => {
    if (isLoading) return;

    const labels = {
      tendencias: 'Mostrar tendencias de delitos',
      recomendaciones: 'Obtener recomendaciones de seguridad',
      resumen: 'Ver resumen de datos'
    };

    const userMessage = {
      id: Date.now().toString(),
      text: labels[tipo] || tipo,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatbotQuick(tipo, 'BUCARAMANGA');

      let responseText = 'No encontré información disponible.';
      if (response?.respuesta) responseText = response.respuesta;
      else if (response?.answer) responseText = response.answer;
      else if (response?.response) responseText = response.response;
      else if (typeof response === 'string') responseText = response;

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Disculpa, hubo un error al consultar los datos. Por favor, intenta de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="chatbot-container">
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-icon">
          <MessageCircle className="icon" />
        </div>
        <div>
          <h2 className="chat-title">Asistente Comunitario IA</h2>
          <p className="chat-subtitle">Seguridad Ciudadana de Santander</p>
        </div>
      </div>

      {/* CHAT AREA */}
      <ScrollArea ref={scrollRef} className="chat-area">
        <div className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
            >
              {message.sender === 'bot' && (
                <div className="avatar bot-avatar">
                  <Bot className="avatar-icon" />
                </div>
              )}

              <div className={`message-text ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {message.sender === 'user' && (
                <div className="avatar user-avatar">
                  <User className="avatar-icon" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="loading-message">
              <div className="avatar bot-avatar">
                <Bot className="avatar-icon" />
              </div>
              <div className="loading-spinner">
                <Loader className="loading-icon" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* FOOTER */}
      <div className="chat-footer">
        <div className="quick-buttons">
        </div>

        <div className="input-container">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
            <Send className="send-icon" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
