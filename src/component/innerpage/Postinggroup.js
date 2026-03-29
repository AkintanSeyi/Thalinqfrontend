import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoCreateOutline, IoClose } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import * as api from "../../api/index";

const Postingroup = () => {
  const { id: groupId } = useParams(); 
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.userId || decoded.id || decoded.sub);
    } else {
      navigate('/signin'); 
    }
  }, [navigate]);

  const handlePost = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Please write something before posting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createPost({
        groupId,
        author: currentUserId,
        content
      });

      if (res.data.success) {
        alert("Your post is live!");
        navigate(-1); 
      }
    } catch (err) {
      alert("Post Failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      
      {/* --- WHITE POST BOX --- */}
      <div className="w-full max-w-xl bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-xl shadow-slate-200/50 transition-all">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="bg-[#FFF1F2] p-2 rounded-lg">
            <IoCreateOutline className="text-[#FF4A57] text-2xl" />
          </div>
          <div className="ml-3">
            <h2 className="text-[#1E293B] text-xl font-bold">Create Post</h2>
            <p className="text-[#64748B] text-sm">Share something with the community</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="ml-auto text-[#94A3B8] hover:text-[#1E293B] bg-[#F1F5F9] p-2 rounded-full transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Input Area */}
        <textarea
          className="w-full bg-transparent text-[#1E293B] text-lg outline-none resize-none placeholder-[#94A3B8] leading-relaxed min-h-[200px] py-2"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />

        {/* Divider */}
        <div className="h-[1px] bg-[#F1F5F9] my-6" />

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${content.length > 200 ? 'text-[#FF4A57]' : 'text-[#94A3B8]'}`}>
              {content.length} characters
            </span>
          </div>

          <button
            onClick={handlePost}
            disabled={isSubmitting || !content.trim()}
            className={`px-10 py-3.5 rounded-[16px] font-bold text-white transition-all transform active:scale-95 shadow-lg ${
              content.trim() 
                ? 'bg-[#FF4A57] hover:bg-[#E13D49] shadow-[#FF4A57]/20' 
                : 'bg-[#CBD5E1] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Publish Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Postingroup;