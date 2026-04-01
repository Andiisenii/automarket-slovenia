import { createContext, useContext, useState, useEffect } from 'react'
import { messageDB, userDB } from './database'

const MessagesContext = createContext(null)

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Load messages when user changes
  useEffect(() => {
    const user = userDB.getCurrentUser()
    if (user) {
      setMessages(messageDB.getMyMessages())
      setUnreadCount(messageDB.getUnreadCount())
    } else {
      setMessages([])
      setUnreadCount(0)
    }
  }, [])
  
  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const user = userDB.getCurrentUser()
      if (user) {
        setMessages(messageDB.getMyMessages())
        setUnreadCount(messageDB.getUnreadCount())
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const sendMessage = (messageData) => {
    return messageDB.sendMessage(messageData)
  }
  
  const markAsRead = (messageId) => {
    messageDB.markAsRead(messageId)
    setMessages(messageDB.getMyMessages())
    setUnreadCount(messageDB.getUnreadCount())
  }
  
  const deleteMessage = (messageId) => {
    messageDB.deleteMessage(messageId)
    setMessages(messageDB.getMyMessages())
    setUnreadCount(messageDB.getUnreadCount())
  }
  
  const refreshMessages = () => {
    setMessages(messageDB.getMyMessages())
    setUnreadCount(messageDB.getUnreadCount())
  }
  
  return (
    <MessagesContext.Provider value={{
      messages,
      unreadCount,
      sendMessage,
      markAsRead,
      deleteMessage,
      refreshMessages,
    }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
