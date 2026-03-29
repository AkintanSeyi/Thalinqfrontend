import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoImageOutline, 
  IoSend, 
  IoCloseCircle,
  IoEllipsisVertical 
} from 'react-icons/io5';
import { io } from 'socket.io-client';
import * as api from '../../api/index';

const SOCKET_URL = "https://tlbackend.onrender.com";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserId, name } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const socket = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
useEffect(() => {
    // 1. Move the function inside so it's fresh on every render
    const fetchMessageHistory = async () => {
      if (!conversationId || conversationId === 'undefined') {
        setLoading(false);
        return;
      }
      try {
        console.log("Fetching history for:", conversationId); // Debugging
        const response = await api.getMessages(conversationId);
        setMessages(response.data.reverse());
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!conversationId || conversationId === 'undefined') {
      setLoading(false);
      return;
    }

    // 2. Initialize Socket
    socket.current = io(SOCKET_URL);
    socket.current.emit("join_room", conversationId);
    
    fetchMessageHistory();

    // 3. Socket Listener
    socket.current.on("receive_message", (newMessage) => {
      // Use local variable to ensure we have an ID even on refresh
      const myId = currentUserId || localStorage.getItem('userId'); 
      if (newMessage.sender._id !== myId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [conversationId, currentUserId]); // Add currentUserId back to track changes

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !imageFile) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('senderId', currentUserId);
    formData.append('text', inputText || "");
    formData.append('messageType', imageFile ? 'image' : 'text');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    // Optimistic UI
    const tempMsg = {
      _id: Date.now().toString(),
      text: inputText,
      fileUrl: imagePreview,
      sender: { _id: currentUserId },
      createdAt: new Date(),
      messageType: imageFile ? 'image' : 'text'
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputText('');
    setImageFile(null);
    setImagePreview(null);

    try {
      await api.sendMessage(formData);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <IoArrowBack size={22} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
              {name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{name || 'Chat'}</h2>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600">
          <IoEllipsisVertical size={20} />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === currentUserId || msg.sender === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] group`}>
                  <div className={`p-3 rounded-2xl shadow-sm ${
                    isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    {msg.messageType === 'image' && (
                      <img 
                        src={msg.fileUrl} 
                        alt="Shared" 
                        className="rounded-lg mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.fileUrl, '_blank')}
                      />
                    )}
                    {msg.text && <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>}
                  </div>
                  <p className={`text-[10px] mt-1 text-slate-400 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
        {imagePreview && (
          <div className="relative inline-block mb-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
            <button 
              onClick={() => { setImagePreview(null); setImageFile(null); }}
              className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full shadow-md"
            >
              <IoCloseCircle size={24} />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-3 max-w-5xl mx-auto">
          <label className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors">
            <IoImageOutline size={24} />
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
          
          <div className="flex-1 relative">
            <textarea
              rows="1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={(!inputText.trim() && !imageFile) || isSending}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <IoSend size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;