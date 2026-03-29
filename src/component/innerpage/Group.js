import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IoSearch, IoHeart, IoHeartOutline, IoChatbubbleOutline, 
  IoEllipsisVertical, IoClose, IoSend, IoAdd, IoChevronForward 
} from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import * as api from "../../api/index";
import BottomTabs from "./BottomTabs"; // Ensure this import path is correct

const CATEGORIES = [
  "All", "Technology", "Social", "Fitness", "Education", "Gaming", "Music", "Travel",
  "Party", "Nightlife", "Food & Drink", "Sports", "Art & Design", "Photography",
  "Business", "Fashion", "Movies", "Outdoors", "Wellness", "Pets", "Anime"
];

const Groups = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  
  // Comment Modal State
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [commentText, setCommentText] = useState("");

  // --- AUTH CHECK ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId || decoded.id || decoded.sub);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  // --- FETCH LOGIC ---
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getGroups(1, activeCategory, searchQuery, userId);
      if (response.data.success) {
        setGroups(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, userId]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGroups();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [fetchGroups]);

  // --- HANDLERS ---
  const handleLike = async (groupId) => {
    if (!userId) return navigate("/signin");
    try {
      const response = await api.likeGroup(groupId, userId);
      if (response.data.success) {
        setGroups(prev => prev.map(g => g._id === groupId ? { ...g, likes: response.data.likes } : g));
      }
    } catch (e) { console.log(e); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !userId) return;
    try {
      const res = await api.commentOnGroup({ postId: selectedGroup._id, userId: userId, text: commentText });
      if (res.data.success) {
        setGroups(prev => prev.map(g => g._id === selectedGroup._id ? res.data.post : g));
        setSelectedGroup(res.data.post);
        setCommentText("");
      }
    } catch (err) { alert("Could not post comment"); }
  };

  return (
    <BottomTabs>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
               <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Explore Groups</h1>
               <img 
                src="https://res.cloudinary.com/dvuq6vmiy/image/upload/v1767771541/1000002239-removebg-preview_mgilwd.png"
                className="h-7 object-contain opacity-50"
                alt="logo"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative w-full">
                <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  type="text"
                  placeholder="Search by name or topic..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Pill Scroller */}
              <div className="flex overflow-x-auto gap-2 no-scrollbar py-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      activeCategory === cat 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="max-w-6xl mx-auto px-4 mt-8">
          {loading && groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-400 font-medium">Finding communities...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((group) => {
                const isLiked = group.likes?.includes(userId);
                return (
                  <div key={group._id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
                    
                    {/* Card Header */}
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={group.profilePicture || `https://ui-avatars.com/api/?name=${group.name}`} 
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-50 dark:ring-slate-800" 
                          alt="" 
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{group.name}</h3>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{group.category}</span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-2"><IoEllipsisVertical /></button>
                    </div>

                    {/* Group Image Area */}
                    <div 
                      className="aspect-square w-full overflow-hidden cursor-pointer relative bg-slate-100 dark:bg-slate-800"
                      onClick={() => navigate(`/group/${group._id}`)}
                    >
                      <img 
                        src={group.profilePicture} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={group.name} 
                      />
                      <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <span className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                             Explore <IoChevronForward />
                          </span>
                      </div>
                    </div>

                    {/* Actions & Stats */}
                    <div className="p-6">
                      <div className="flex items-center gap-5 mb-4">
                        <button onClick={() => handleLike(group._id)} className="transition-transform active:scale-125">
                          {isLiked ? 
                            <IoHeart size={30} className="text-red-500" /> : 
                            <IoHeartOutline size={30} className="text-slate-800 dark:text-slate-200" />
                          }
                        </button>
                        <button onClick={() => { setSelectedGroup(group); setCommentModalVisible(true); }} className="transition-transform active:scale-110">
                          <IoChatbubbleOutline size={26} className="text-slate-800 dark:text-slate-200" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {group.likes?.length || 0} likes
                        </p>
                        <span className="text-slate-300">•</span>
                        <p className="text-sm font-bold text-slate-500">
                          {group.memberCount || 1} members
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!loading && groups.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
               <p className="text-slate-500 font-medium italic">No groups found in this category.</p>
            </div>
          )}
        </div>

        {/* Create Group FAB */}
        <button 
          onClick={() => navigate("/create-group")}
          className="fixed bottom-28 right-8 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all z-40"
        >
          <IoAdd size={36} />
        </button>

        {/* Comment Modal Overlay */}
        {commentModalVisible && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center px-0 md:p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setCommentModalVisible(false)} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-[40px] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[70vh] animate-in slide-in-from-bottom-full duration-300">
              
              <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="font-extrabold text-xl">Group Discussions</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedGroup?.comments?.length || 0} Comments</p>
                </div>
                <button onClick={() => setCommentModalVisible(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <IoClose size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {selectedGroup?.comments?.length > 0 ? (
                  selectedGroup.comments.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-indigo-600">
                        {c.user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl rounded-tl-none">
                        <span className="font-extrabold text-xs text-indigo-500 block mb-1">{c.user?.name}</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <p className="text-slate-400 font-medium italic">Quiet in here... Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-center">
                <input 
                  type="text" 
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none font-medium focus:ring-2 focus:ring-indigo-500"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button 
                  disabled={!commentText.trim()}
                  onClick={handleAddComment} 
                  className="bg-indigo-600 disabled:opacity-50 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all"
                >
                  <IoSend size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BottomTabs>
  );
};

export default Groups;