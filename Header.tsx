import React from 'react';
import { GraduationCap, BookOpen, PenTool } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-gray-950/80 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 hidden md:flex">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg shadow-lg">
            <GraduationCap className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-100 text-lg leading-tight tracking-tight">Explain It My Way</h1>
          </div>
        </div>

        {/* Mobile Logo (Simplified) */}
        <div className="md:hidden flex items-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
                <GraduationCap className="text-white h-5 w-5" />
            </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
            <button
                onClick={() => onViewChange('homework')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'homework'
                    ? 'bg-gray-800 text-white shadow-sm border border-gray-700'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                <BookOpen size={16} />
                Homework Helper
            </button>
            <button
                onClick={() => onViewChange('essay')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'essay'
                    ? 'bg-purple-900/30 text-purple-100 shadow-sm border border-purple-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                <PenTool size={16} />
                Essay Mimic
            </button>
        </div>
      </div>
    </header>
  );
};