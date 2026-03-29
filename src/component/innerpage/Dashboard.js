import React, { useState, useEffect } from 'react';
import { 
  IoHeart, 
  IoHeartOutline, 
  IoChatbubbleOutline, 
  IoPaperPlaneOutline, 
  IoCloseOutline,
  IoCopyOutline,
  IoLogoFacebook,
  IoLogoInstagram,
  IoAdd
} from 'react-icons/io5';
import { FaTiktok } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import * as api from "../../api/index"; 
import BottomTabs from "./BottomTabs"; // Ensure this path is correct

const DUMMY_ADS = [
  {
    _id: 'ad-1',
    isAd: true,
    title: 'Upgrade Your Gear',
    description: 'Get 20% off on pro audio equipment!',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    cta: 'Shop Now'
  },
  {
    _id: 'ad-2',
    isAd: true,
    title: 'Join Creators Hub',
    description: 'Connect with creators worldwide.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    cta: 'Join Now'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Modals & Interaction States
  const [showShare, setShowShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const init = async () => {
      let currentId = null;
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          currentId = decoded.id || decoded.userId || decoded._id;
          setUserId(currentId);
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
      await fetchData(currentId);
    };
    init();
  }, []);

  const fetchData = async (currentId) => {
    try {
      setLoading(true);
      const res = await api.getLatestGroups(currentId);
      let fetchedGroups = [];

      if (res.data?.success) {
        fetchedGroups = res.data.groups;
      } else if (Array.isArray(res.data)) {  
        fetchedGroups = res.data;
      }

      let dataWithAds = [];
      fetchedGroups.forEach((group, index) => {
        dataWithAds.push(group);
        if ((index + 1) % 4 === 0) {
          const randomAd = DUMMY_ADS[Math.floor(Math.random() * DUMMY_ADS.length)];
          dataWithAds.push({
            ...randomAd,
            _id: `ad-${index}-${Math.random()}`
          });
        }
      });

      setGroups(dataWithAds);
    } catch (err) {
      console.error("Fetch error:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (groupId) => {
    if (!userId) return alert("Please login to like posts");
    try {
      const res = await api.likeGroup(groupId, userId);
      if (res.data?.success) {
        setGroups(prev => prev.map(g => 
          g._id === groupId ? { ...g, likes: res.data.likes } : g
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openComments = (post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.commentOnGroup({
        postId: selectedPost._id,
        userId,
        text: commentText
      });

      if (res.data.success) {
        setGroups(prev => prev.map(g => 
          g._id === selectedPost._id ? res.data.post : g
        ));
        setSelectedPost(res.data.post);
        setCommentText("");
      }
    } catch (err) {
      alert("Failed to post comment");
    }
  };

  const handleSharePlatform = (platform, post) => {
    const shareUrl = `https://thalinq.com/group/${post._id}`;
    let url = "";

    switch (platform) {
      case "Facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "Instagram":
        url = "https://www.instagram.com/";
        break;
      case "TikTok":
        url = "https://www.tiktok.com/";
        break;
      case "Copy":
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
        setShowShare(false);
        return;
      default:
        return;
    }
    window.open(url, "_blank");
    setShowShare(false);
  };

  return (
    <BottomTabs>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
            <img 
              src="https://res.cloudinary.com/dvuq6vmiy/image/upload/v1767771541/1000002239-removebg-preview_mgilwd.png"
              className="h-8 object-contain"
              alt="ThaLinq Logo"
            />
            <div className="flex items-center gap-3">
             
            </div>
          </div>
        </header>

        {/* FEED */}
        <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium">Loading your feed...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">No posts found. Start by following some groups!</p>
            </div>
          ) : (
            groups.map(item => {
              // --- AD RENDER ---
              if (item.isAd) {
                return (
                  <div key={item._id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 p-4">
                    <div className="relative">
                      <img src={item.image} className="w-full h-48 object-cover rounded-2xl mb-4" alt="Ad"/>
                      <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-md font-bold uppercase tracking-widest">Sponsored</span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{item.description}</p>
                    <button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-transform active:scale-95">
                      {item.cta}
                    </button>
                  </div>
                );
              }

              // --- POST RENDER ---
              return (
                <div key={item._id} className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.profilePicture || "https://ui-avatars.com/api/?name=" + item.name} 
                        className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 object-cover"
                        alt={item.name}
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1">{item.name}</h4>
                        <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Image */}
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={item.profilePicture} // In your RN code, you used profilePicture for the post image too
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => navigate(`/group/${item._id}`)}
                      alt="Post content"
                    />
                  </div>

                  {/* Interaction Area */}
                  <div className="p-5">
                    <div className="flex items-center gap-6 mb-4">
                      <button 
                        onClick={() => handleLike(item._id)}
                        className="transition-transform active:scale-125"
                      >
                        {item.likes?.includes(userId) ? 
                          <IoHeart size={28} className="text-red-500 animate-pulse"/> :
                          <IoHeartOutline size={28} className="text-slate-700 dark:text-slate-300"/>
                        }
                      </button>

                      <button onClick={() => openComments(item)} className="text-slate-700 dark:text-slate-300">
                        <IoChatbubbleOutline size={26}/>
                      </button>

                      <button 
                        onClick={() => {
                          setSelectedPost(item);
                          setShowShare(true);
                        }}
                        className="text-slate-700 dark:text-slate-300"
                      >
                        <IoPaperPlaneOutline size={26}/>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {item.likes?.length || 0} likes
                      </p>
                      <span className="text-slate-300">•</span>
                      <button onClick={() => openComments(item)} className="text-sm font-bold text-slate-500 hover:text-indigo-500 transition-colors">
                        View all {item.comments?.length || 0} comments
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* --- MODALS (SHARE) --- */}
        {showShare && selectedPost && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowShare(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Share with friends</h3>
                <button onClick={() => setShowShare(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <IoCloseOutline size={24} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 pb-2">
                <ShareIcon icon={<IoLogoFacebook size={24}/>} label="Facebook" color="bg-blue-600" onClick={() => handleSharePlatform("Facebook", selectedPost)} />
                <ShareIcon icon={<IoLogoInstagram size={24}/>} label="Instagram" color="bg-pink-600" onClick={() => handleSharePlatform("Instagram", selectedPost)} />
                <ShareIcon icon={<FaTiktok size={20}/>} label="TikTok" color="bg-black" onClick={() => handleSharePlatform("TikTok", selectedPost)} />
                <ShareIcon icon={<IoCopyOutline size={24}/>} label="Link" color="bg-slate-500" onClick={() => handleSharePlatform("Copy", selectedPost)} />
              </div>
            </div>
      
          </div>
        )}

              {/* Create Group FAB */}
<button 
  onClick={() => navigate("/create-group")}
  className="fixed bottom-28 right-8 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all z-50"
>
  <IoAdd size={36} />
</button>

        {/* --- MODALS (COMMENTS) --- */}
        {showComments && selectedPost && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowComments(false)} />
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-[40px] p-6 h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-xl">Comments</h3>
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                  {selectedPost.comments?.length || 0}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-hide">
                {selectedPost.comments?.length > 0 ? (
                  selectedPost.comments.map(c => (
                    <div key={c._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center font-bold text-xs text-indigo-600">
                        {c.user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl rounded-tl-none">
                        <b className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1">{c.user?.name || "Anonymous"}</b>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 italic">No comments yet. Be the first to say something!</div>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center">
                <input
                  value={commentText}
                  placeholder="Write a comment..."
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none px-5 py-4 rounded-[20px] text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
                <button 
                  disabled={!commentText.trim()}
                  onClick={handleAddComment} 
                  className="bg-indigo-600 disabled:opacity-50 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-90"
                >
                  <IoPaperPlaneOutline size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BottomTabs>
  );
};

// Internal helper for share icons
const ShareIcon = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-active:scale-90`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
  </button>
);

export default Dashboard;