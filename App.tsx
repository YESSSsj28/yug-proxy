import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomeworkChat } from './components/HomeworkChat';
import { EssayMimic } from './components/EssayMimic';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('homework');

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-hidden relative">
        {/* Render View Based on State */}
        {currentView === 'homework' ? (
           <HomeworkChat />
        ) : (
           <EssayMimic />
        )}
      </main>
    </div>
  );
};

export default App;