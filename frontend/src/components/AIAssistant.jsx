import { useState, useRef, useEffect } from 'react'
import './AIAssistant.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your EasyReads AI assistant. I can help you find books, answer questions about our library, or assist with any EasyReads-related queries. How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`ai-assistant-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
          <path d="M7 9H17V11H7V9ZM7 12H15V14H7V12Z" fill="currentColor"/>
        </svg>
        <span className="ai-assistant-button-text">AI Assistant</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-assistant-container">
          <div className="ai-assistant-header">
            <div className="ai-assistant-header-content">
              <div className="ai-assistant-avatar">🤖</div>
              <div>
                <h3 className="ai-assistant-title">EasyReads AI Assistant</h3>
                <p className="ai-assistant-subtitle">Ask me anything about books!</p>
              </div>
            </div>
            <button
              className="ai-assistant-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
            >
              ✕
            </button>
          </div>

          <div className="ai-assistant-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-assistant-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="ai-assistant-message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-assistant-message assistant-message">
                <div className="ai-assistant-message-content">
                  <div className="ai-assistant-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-assistant-input-form" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about books, e-books, audiobooks..."
              className="ai-assistant-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="ai-assistant-send"
              disabled={loading || !input.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10L17 12 2 14Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default AIAssistant

