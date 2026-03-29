import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Using react-icons as the web replacement for @expo/vector-icons
import { 
  IoArrowBack, IoEllipsisVertical, IoEllipsisHorizontal, 
  IoHeart, IoHeartOutline, IoChatbubbleOutline, 
  IoPaperPlaneOutline, IoNotifications, IoNotificationsOffOutline,
  IoExitOutline, IoPersonAddOutline, IoCreateOutline,
  IoSearch, IoCloseCircle, IoClose, IoSend,
  IoLockClosed, IoPeopleOutline, IoShieldCheckmark, IoVideocam, IoPulse,
  IoLogoFacebook, IoLogoInstagram, IoLogoTwitter, IoLogoLinkedin, IoLinkOutline
} from "react-icons/io5";

import { jwtDecode } from "jwt-decode";
import * as api from "../../api/index";

const GroupDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Web uses useParams for URL segments

  // Mocking the 'colors' and 'dark' theme object from React Navigation for web compatibility
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const colors = {
    primary: "#3B82F6",
    background: dark ? "#0F172A" : "#FFFFFF",
    card: dark ? "#1E293B" : "#F8FAFC",
    text: dark ? "#F1F5F9" : "#1E293B",
    border: dark ? "#334155" : "#E2E8F0",
  };

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState("Feed");

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (id) initialize();
  }, [id]);

  const initialize = async () => {
    if (!group) setLoading(true);
    await fetchGroupDetails();
    setLoading(false);
  };

  useEffect(() => {
    if (isMember || (group && !group.isPrivate)) {
      fetchPosts();
    }
  }, [isMember, group?.isPrivate, currentUserId]);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('post');
  
  if (postId && posts.length > 0) {
    const element = document.getElementById(postId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optional: highlight the post
      element.style.ring = "2px solid #FF4A57"; 
    }
  }
}, [posts]);


 const fetchGroupDetails = async () => {
    try {
      // WEB CHANGE: Use localStorage instead of AsyncStorage
      const token = localStorage.getItem("token"); 
      if (!token) return;

      const decoded = jwtDecode(token);
      // Ensure we have a clean string ID
      const userId = String(decoded.userId || decoded.id || decoded.sub);
      setCurrentUserId(userId);
      setCurrentUserEmail(decoded.email);

      const response = await api.getGroupDetails(id);
      if (response.data.success) {
        const groupData = response.data.group;
        setGroup(groupData);

        // WEB FIX: Robust comparison using String() to avoid [object Object] mismatches
        const memberFound = groupData.members.some((m) => {
          const mId = m.user?._id || m.user?.id || m.user;
          return String(mId) === userId;
        });

        setIsMember(memberFound);

        // Set notification status
        const memberData = groupData.members.find((m) => {
          const mId = m.user?._id || m.user?.id || m.user;
          return String(mId) === userId;
        });
        setNotificationsEnabled(memberData?.notificationsEnabled ?? false);
      }
    } catch (error) {
      console.error("Error group details", error);
    }
  };

  const fetchPosts = async () => {
    if (!id || !currentUserId) return;
    try {
      const response = await api.getGroupPosts(id, currentUserId);
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) { console.error("Error fetching posts:", error); }
  };

  // --- LOGIC HANDLERS ---
  const handleBlockUser = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to block this user?")) return;
    try {
      const res = await api.blockUser({ currentUserId, blockUserId: targetUserId });
      if (res.data.success) {
        setPosts(prev => prev.filter(p => String(p.author?._id || p.author) !== String(targetUserId)));
        alert("User blocked.");
      }
    } catch (error) { alert("Could not block user."); }
  };
const handleSocialShare = (platform) => {
  const shareName = selectedPost ? `Post by ${selectedPost.author?.name}` : group?.name;
  const shareMessage = `Check out ${shareName} on ThaLinq!`;
  
  // LOGIC: If a post is selected, append its ID to the URL
  let shareUrl = window.location.origin + window.location.pathname;
  if (selectedPost) {
    shareUrl += `?post=${selectedPost._id}`; 
  }

  let url = '';
  switch(platform) {
    case 'Facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
    case 'X': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`; break;
    case 'LinkedIn': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`; break;
    case 'Copy Link':
      navigator.clipboard.writeText(shareUrl);
      alert("Individual post link copied!"); // Feedback for user
      setShareModalVisible(false);
      return;
    default: return;
  }
  window.open(url, '_blank');
  setShareModalVisible(false);
};

  const handleLike = async (postId) => {
    try {
      const res = await api.toggleLikePost(postId, currentUserId);
      if (res.data.success) {
        setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
      }
    } catch (err) { console.log("Like error", err); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.addComment({ postId: selectedPost._id, userId: currentUserId, text: commentText });
      if (res.data.success) { 
        fetchPosts(); 
        setCommentText(""); 
        setCommentModalVisible(false); 
      }
    } catch (err) { alert("Could not post comment"); }
  };

  const handleJoinAndPay = async () => {
    try {
      setProcessingPayment(true);
      if (!group?.isPrivate || group?.price <= 0) {
        const res = await api.toggleMembership({ groupId: id, userEmail: currentUserEmail });
        if (res.data.success) {
          setIsMember(res.data.isMember);
          fetchGroupDetails();
        }
      } else {
        // Stripe web logic would usually redirect here
        alert("Redirecting to checkout...");
      }
    } catch (error) { alert("Action failed"); }
    finally { setProcessingPayment(false); }
  };

  const handleToggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    await api.toggleGroupNotifications(id, currentUserId);
  };

  const handleStartLive = async () => {
    try {
      const response = await api.startGroupLive(id, currentUserId);
      if (response.data.success) {
        navigate(`/live/${id}`, { state: { ...response.data, role: 'broadcaster' } });
      }
    } catch (error) { alert("Could not start live."); }
  };

  // --- RENDER HELPERS ---
  const filteredMembers = group?.members?.filter(m => 
    m.user?.name?.toLowerCase().includes(memberSearch.toLowerCase())
  ) || [];

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const isCreator = group?.creator?._id === currentUserId || group?.creator === currentUserId;

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header Section */}
      <div className="relative h-64 w-full">
        <img src={group?.profilePicture} className="w-full h-full object-cover" alt="Cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white">
          <IoArrowBack size={24} />
        </button>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{group?.name}</h1>
            <p className="text-blue-500 font-medium">{group?.category} • {group?.memberCount} members</p>
          </div>
          <div className="flex gap-3">
            {isCreator && (
              <button onClick={handleStartLive} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full">
                <IoVideocam /> Start Live
              </button>
            )}
            {isMember && (
              <button onClick={handleToggleNotifications} className="p-2 border rounded-full">
                {notificationsEnabled ? <IoNotifications className="text-blue-500" /> : <IoNotificationsOffOutline />}
              </button>
            )}
            {!isCreator && (
              <button 
                onClick={handleJoinAndPay} 
                className={`px-6 py-2 rounded-full font-bold ${isMember ? 'border' : 'bg-blue-600 text-white'}`}
              >
                {isMember ? 'Leave Group' : 'Join Group'}
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">{group?.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-inherit z-10">
        {["Feed", "Members"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center font-bold ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="p-4">
        {activeTab === "Feed" ? (
          <div className="space-y-4">
            {(isMember || !group?.isPrivate) ? (
              posts.map(post => (
                <div  id={post._id} key={post._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={post.author?.profileImage || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full" alt="avatar" />
                    <div className="flex-1">
                      <h4 className="font-bold">{post.author?.name}</h4>
                      <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="mb-4">{post.content}</p>
                  <div className="flex items-center gap-6 text-slate-400 border-t pt-4">
                    <button onClick={() => handleLike(post._id)} className="flex items-center gap-2">
                      {post.likes?.includes(currentUserId) ? <IoHeart className="text-red-500" /> : <IoHeartOutline />}
                      {post.likes?.length}
                    </button>
                    <button onClick={() => { setSelectedPost(post); setCommentModalVisible(true); }} className="flex items-center gap-2">
                      <IoChatbubbleOutline /> {post.comments?.length} Comments
                    </button>
                    <button onClick={() => { setSelectedPost(post); setShareModalVisible(true); }} className="ml-auto flex items-center gap-2">
                      <IoPaperPlaneOutline /> Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <IoLockClosed size={60} className="mx-auto text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold">Private Feed</h2>
                <p className="text-slate-500">Join this group to see its posts.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative mb-4">
              <IoSearch className="absolute left-3 top-3 text-slate-400" />
              <input 
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none"
              />
            </div>
            {filteredMembers.map(member => (
              <div key={member.user._id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={member.user.profileImage} className="w-12 h-12 rounded-full" alt="user" />
                  <div>
                    <p className="font-bold">{member.user.name}</p>
                    <p className="text-sm text-blue-500">Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons (Fixed Position) */}
      {isMember && (
        <button 
          onClick={() => navigate(`/groups/${id}/post`)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <IoCreateOutline size={28} />
        </button>
      )}

      {/* Modals (Implemented as overlays) */}
      {commentModalVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl h-3/4 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Comments</h3>
              <button onClick={() => setCommentModalVisible(false)}><IoClose size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedPost?.comments.map(c => (
                <div key={c._id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="font-bold text-sm">{c.user?.name}</p>
                  <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg outline-none" 
                placeholder="Write a comment..." 
              />
              <button onClick={handleAddComment} className="text-blue-500"><IoSend size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {shareModalVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-bold">Share to Socials</span>
              <button onClick={() => setShareModalVisible(false)}><IoClose size={20} /></button>
            </div>
            <div className="flex flex-col">
              {['Facebook', 'X', 'LinkedIn', 'Copy Link'].map(p => (
                <button 
                  key={p} 
                  onClick={() => handleSocialShare(p)}
                  className="flex items-center gap-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                >
                  {p === 'Facebook' && <IoLogoFacebook className="text-blue-600" />}
                  {p === 'X' && <IoLogoTwitter className="text-black dark:text-white" />}
                  {p === 'LinkedIn' && <IoLogoLinkedin className="text-blue-700" />}
                  {p === 'Copy Link' && <IoLinkOutline />}
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;