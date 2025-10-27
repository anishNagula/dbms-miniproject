import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './TeamChat.css'; // We'll create this next

const TeamChat = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // A ref to the message container for auto-scrolling
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when the component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/communication/${projectId}/messages`);
        setMessages(response.data);
      } catch (err) {
        setError('Failed to load messages. You may not be a team member.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [projectId]);

  // Scroll to bottom when new messages are loaded
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      // 1. Send the new message to the backend
      await api.post(`/communication/${projectId}/messages`, {
        message_text: newMessage,
      });

      // 2. Optimistic Update: Add the new message to our local state
      // This makes it appear instantly without a page refresh.
      const messageToAdd = {
        message_id: Date.now(), // A temporary key
        message_text: newMessage,
        timestamp: new Date().toISOString(),
        f_name: user.f_name, // Use the logged-in user's name
        l_name: user.l_name,
      };
      setMessages([...messages, messageToAdd]);
      
      // 3. Clear the input box
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="chat-container">
      <h3>Team Communication</h3>
      <div className="messages-box">
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.message_id} className="message">
              <strong className="message-sender">
                {msg.f_name} {msg.l_name}
              </strong>
              <p className="message-text">{msg.message_text}</p>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows="3"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default TeamChat;