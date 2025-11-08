import React, { useState, useEffect } from 'react';
import { getChatHistory, ChatDay } from '../../services/chatHistory';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ChatHistoryProps {
  userId: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ userId }) => {
  const [chatDays, setChatDays] = useState<ChatDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    loadChatHistory();
  }, [userId]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      const history = await getChatHistory(userId, 30);
      setChatDays(history);
      if (history.length > 0 && !selectedDay) {
        setSelectedDay(history[0].date);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="text-purple-300 mt-4">Loading your chat history...</p>
      </div>
    );
  }

  if (chatDays.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <div className="text-xl text-purple-300 mb-2">No chat history yet</div>
        <div className="text-gray-400">Start chatting with Kindred to build your history</div>
      </div>
    );
  }

  const selectedDayData = chatDays.find((day) => day.date === selectedDay);

  return (
    <div className="flex gap-6 h-[600px]">
      {/* Day List Sidebar */}
      <div className="w-64 bg-black/30 border border-purple-500/30 rounded-lg p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Past 30 Days</h3>
        <div className="space-y-2">
          {chatDays.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day.date)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedDay === day.date
                  ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                  : 'bg-black/20 border border-purple-500/20 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/30'
              }`}
            >
              <div className="font-semibold">{formatDate(day.date)}</div>
              <div className="text-xs text-gray-400 mt-1">
                {day.messages.length} message{day.messages.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-1 bg-black/30 border border-purple-500/30 rounded-lg p-6 overflow-y-auto">
        {selectedDayData ? (
          <>
            <div className="mb-6 pb-4 border-b border-purple-500/30">
              <h3 className="text-2xl font-bold text-white">{formatDate(selectedDayData.date)}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {selectedDayData.messages.length} message{selectedDayData.messages.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-4">
              {selectedDayData.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                        : 'bg-black/40 border border-purple-500/30 text-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold opacity-70">
                        {msg.sender === 'user' ? 'You' : 'Kindred'}
                      </span>
                      <span className="text-xs opacity-50">{formatTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Select a day to view conversations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
