import React, { useState, useEffect } from 'react';
import { Timer, Users, MessageSquare, X, CheckCircle, PlusCircle } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';
import VideoStream from './VideoStream';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { Message, Task, Participant } from '../types';
import { createRoom } from '../utils/daily';

interface WorkspaceRoomProps {
  isOpen: boolean;
  onClose: () => void;
  sessionDuration?: number;
}

export default function WorkspaceRoom({ isOpen, onClose, sessionDuration = 45 }: WorkspaceRoomProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(sessionDuration * 60);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowEndMessage(true);
            setTimeout(() => {
              onClose();
            }, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, timeLeft, onClose]);

  useEffect(() => {
    async function initializeRoom() {
      if (isOpen && !roomUrl && user) {
        try {
          const url = await createRoom();
          setRoomUrl(url);
          
          setParticipants([{ 
            id: user.id, 
            name: user.name, 
            avatar: user.avatar 
          }]);
        } catch (error) {
          console.error('Failed to initialize room:', error);
        }
      }
    }

    initializeRoom();
  }, [isOpen, user, roomUrl]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    
    const task: Task = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text: newTask,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      text: newMessage,
      timestamp: Date.now()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="min-h-[90vh] w-[90vw] bg-white rounded-xl overflow-hidden shadow-xl relative">
        {showEndMessage && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center animate-fade-in">
              <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
              <p className="text-gray-600">Great work! Your session has ended.</p>
            </div>
          </div>
        )}

        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Timer className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span>{participants.length}/6 participants</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat</span>
              </button>
              <button 
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 flex gap-4 h-[calc(90vh-64px)] bg-gray-50">
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
            <VideoStream
              roomUrl={roomUrl || ''}
              onLeave={onClose}
            />
          </div>

          <div className="w-80 bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Room Tasks</h2>
            
            <form onSubmit={handleAddTask} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg"
                >
                  <button
                    onClick={() => task.userId === user?.id && toggleTask(task.id)}
                    className={`flex-shrink-0 mt-1 ${
                      task.completed ? 'text-green-500' : 'text-gray-300'
                    } ${task.userId !== user?.id ? 'cursor-default' : ''}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <p className={task.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                      {task.text}
                    </p>
                    <p className="text-xs text-gray-500">{task.userName}</p>
                  </div>
                  {task.userId === user?.id && (
                    <button
                      onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isChatOpen && (
            <div className="w-80 bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-900">Chat</h2>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[calc(100vh-200px)] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.userId === user?.id ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.userId === user?.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {message.userName} • {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="mt-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}