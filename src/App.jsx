import React, { useState } from 'react';
import VideoRecorder from './components/VideoRecorder';
import VideoList from './components/VideoList';
import { Video, ListVideo } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'library'
  const [listPulse, setListPulse] = useState(0); // Trigger to reload list

  const handleRecordingComplete = () => {
    setListPulse(p => p + 1);
    // Optionally switch to library to show it saved
    setActiveTab('library');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden min-w-0">
      {/* max-w-md centers it like a mobile app on desktop */}

      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
            P
          </div>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight">POC Recorder</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
        {activeTab === 'record' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <VideoRecorder onRecordingComplete={handleRecordingComplete} />

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
              <p className="font-semibold mb-1">Instructions:</p>
              <ul className="list-disc pl-4 space-y-1 opacity-90">
                <li>Grant Camera Permissions.</li>
                <li>Record a short video.</li>
                <li>It automatically saves to IndexedDB.</li>
                <li>Go to <b>Library</b> to view and retry upload.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <VideoList pulse={listPulse} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-100 grid grid-cols-2 shrink-0 safe-area-bottom">
        <button
          onClick={() => setActiveTab('record')}
          className={cn(
            "flex flex-col items-center justify-center py-3 gap-1 transition-colors",
            activeTab === 'record' ? "text-red-500 bg-red-50/50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          )}
        >
          <Video className="w-6 h-6" />
          <span className="text-xs font-medium">Record</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            "flex flex-col items-center justify-center py-3 gap-1 transition-colors",
            activeTab === 'library' ? "text-red-500 bg-red-50/50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          )}
        >
          <ListVideo className="w-6 h-6" />
          <span className="text-xs font-medium">Library</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
