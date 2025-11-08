export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'kindred';
  message: string;
  createdAt: Date;
}

export interface ChatDay {
  date: string;
  messages: ChatMessage[];
}

const STORAGE_KEY_PREFIX = 'kindred_chat_messages_';

export const saveChatMessage = async (
  userId: string,
  sender: 'user' | 'kindred',
  message: string
): Promise<void> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existingData = localStorage.getItem(storageKey);
    const messages: ChatMessage[] = existingData ? JSON.parse(existingData) : [];
    
    const newMessage: ChatMessage = {
      id: `${sender}-${Date.now()}-${Math.random()}`,
      userId,
      sender,
      message,
      createdAt: new Date(),
    };
    
    messages.push(newMessage);
    
    localStorage.setItem(storageKey, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

export const getChatHistory = async (
  userId: string,
  days: number = 30
): Promise<ChatDay[]> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      return [];
    }
    
    const messages: ChatMessage[] = JSON.parse(existingData);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMessages = messages
      .filter(msg => new Date(msg.createdAt) >= cutoffDate)
      .map(msg => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));
    
    const groupedByDay: Map<string, ChatMessage[]> = new Map();
    
    recentMessages.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toISOString().split('T')[0];
      if (!groupedByDay.has(dateKey)) {
        groupedByDay.set(dateKey, []);
      }
      groupedByDay.get(dateKey)!.push(msg);
    });
    
    const chatDays: ChatDay[] = Array.from(groupedByDay.entries())
      .map(([date, msgs]) => ({
        date,
        messages: msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    
    return chatDays;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

export const deleteChatHistory = async (userId: string): Promise<void> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error deleting chat history:', error);
  }
};
