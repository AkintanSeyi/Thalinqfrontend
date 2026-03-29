import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoChatbubblesOutline, IoSearch, IoEllipsisVertical, IoCreateOutline } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import * as api from "../../api/index";
import BottomTabs from "./BottomTabs";

const Conversation = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadInbox = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (token) {
        setIsGuest(false);
        const decoded = jwtDecode(token);
        const myId = decoded.userId || decoded.id;
        setCurrentUserId(myId);

        const response = await api.getConversations(myId);
        setConversations(response.data);
      } else {
        setIsGuest(true);
      }
    } catch (error) {
      console.error("Inbox Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.participants?.find((m) => m._id !== currentUserId);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isGuest) {
    return (
      <BottomTabs>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-slate-50 dark:bg-slate-950">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-[32px] flex items-center justify-center mb-6 text-indigo-600 rotate-12">
            <IoChatbubblesOutline size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Stay Connected</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8 text-sm font-medium">
            Log in to send messages and coordinate with your community members.
          </p>
          <button
            onClick={() => navigate("/signin")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </BottomTabs>
    );
  }

  return (
    <BottomTabs>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="max-w-xl mx-auto px-4 pt-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inbox</h1>
              <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
                <IoCreateOutline size={22} />
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative mb-2">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 mt-6">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Updating Inbox</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((item) => {
                  const otherUser = item.participants?.find((m) => m._id !== currentUserId);
                  const isUnread = item.unreadCount > 0;

                  return (
                    <div
                      key={item._id}
                      onClick={() => navigate(`/messages/${item._id}`, { state: { name: otherUser?.name } })}
                      className="flex items-center p-4 bg-white dark:bg-slate-900 rounded-[24px] cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border border-transparent hover:border-indigo-100 dark:hover:border-slate-800 group"
                    >
                      <div className="relative">
                        <img
                          src={otherUser?.profileImage || `https://ui-avatars.com/api/?name=${otherUser?.name || 'User'}`}
                          alt={otherUser?.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-50 dark:ring-slate-800"
                        />
                        {/* Status Dot */}
                        <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-[3px] border-white dark:border-slate-900 rounded-full"></div>
                      </div>

                      <div className="flex-1 ml-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className={`text-sm tracking-tight truncate ${isUnread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                            {otherUser?.name || "Unknown User"}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{formatTime(item.updatedAt)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className={`text-xs truncate pr-6 ${isUnread ? 'font-bold text-indigo-600' : 'text-slate-500'}`}>
                            {item.lastMessage?.text || "New message sequence..."}
                          </p>
                          
                          {isUnread && (
                            <div className="h-2.5 w-2.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200" />
                          )}
                        </div>
                      </div>

                      <button className="ml-2 p-2 opacity-0 group-hover:opacity-100 text-slate-300 transition-opacity">
                        <IoEllipsisVertical size={18} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 text-sm font-medium italic">No conversations found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BottomTabs>
  );
};

export default Conversation;