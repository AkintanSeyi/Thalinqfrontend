import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoPersonOutline, 
  IoMailOutline, 
  IoCallOutline, 
  IoDocumentTextOutline, 
  IoPricetagsOutline 
} from 'react-icons/io5';
import { jwtDecode } from "jwt-decode"; // Added for token decoding
import * as api from '../../api/index';

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // 1. Decode token to get user email
          const decoded = jwtDecode(token);
          const userEmail = decoded.email;

          if (userEmail) {
            // 2. Fetch full profile using email from token
            const response = await api.getUserProfile(userEmail);
            if (response.data.success) {
              setUserData(response.data.user);
            }
          }
        } else {
          // No token? Send them to sign in
          navigate('/signin');
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const DetailItem = ({ label, value, icon, isTags = false }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 ml-1">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </label>
      </div>
      <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all">
        {isTags ? (
          <div className="flex flex-wrap gap-2">
            {value && value.length > 0 ? (
              value.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-sm italic">No interests selected</span>
            )}
          </div>
        ) : (
          <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-relaxed">
            {value || 'Not provided'}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white dark:bg-slate-950">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-white"
        >
          <IoArrowBack size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Personal Details</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8 px-6">
          These details are verified and linked to your account.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          {/* Using lowercase keys: .name, .email, .phone, .bio */}
          <DetailItem 
            label="Full Name" 
            value={userData?.name} 
            icon={<IoPersonOutline size={18} />} 
          />
          <DetailItem 
            label="Email Address" 
            value={userData?.email} 
            icon={<IoMailOutline size={18} />} 
          />
          <DetailItem 
            label="Phone Number" 
            value={userData?.phone} 
            icon={<IoCallOutline size={18} />} 
          />
          <DetailItem 
            label="Bio" 
            value={userData?.bio} 
            icon={<IoDocumentTextOutline size={18} />} 
          />
          
          <DetailItem 
            label="Interests & Categories" 
            value={userData?.interests} 
            icon={<IoPricetagsOutline size={18} />} 
            isTags={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;