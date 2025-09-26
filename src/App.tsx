import { useState } from 'react'
import { NavigationBar } from './components/layout/NavigationBar'
import { ConversationPanel } from './components/chat/ConversationPanel'
import { QueryInputPanel } from './components/input/QueryInputPanel'
import { LanguageProvider } from './providers/LanguageProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ChatProvider } from './providers/ChatProvider'

function AppContent() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavigationBar />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversation History */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ConversationPanel />
        </div>

        {/* Right Panel - Query Input */}
        <div className="w-96 xl:w-[28rem] border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <QueryInputPanel />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App