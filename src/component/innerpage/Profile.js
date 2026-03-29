import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoPersonOutline, 
  IoLogOutOutline, 
  IoChevronForward,
  IoCameraOutline
} from 'react-icons/io5';
import * as api from '../../api/index';
import BottomTabs from "./BottomTabs";
import { jwtDecode } from "jwt-decode";

const Profile = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      
      if (token) {
        // 1. Decode the token to get the email
        const decoded = jwtDecode(token);
        const userEmail = decoded.email; // Ensure your backend includes 'email' in the JWT payload

        if (userEmail) {
          // 2. Use the email from the token to fetch the full profile
          const response = await api.getUserProfile(userEmail);
          
          if (response.data.success) {
            const userData = response.data.user;
            setUser({
              // Use lowercase to match your backend/Native logic
              name: userData.name, 
              email: userData.email,
              profileImage: userData.profileImage,
            });
          }
        }
      } else {
        // Handle guest/logged out state
        console.warn("No token found");
        navigate('/signin');
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      if (setIsLoggedIn) setIsLoggedIn(false);
      navigate('/signin');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BottomTabs>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-8 rounded-b-[30px] shadow-sm flex flex-col items-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Profile</h1>
          
          <div className="relative group">
            <img 
              src={user.profileImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuQWVd2N57kwCTsg0z5wCIdvXX5DRKu6w1RA&s"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-2 border-white dark:border-slate-900 text-white shadow-lg transition-transform hover:scale-110">
              <IoCameraOutline size={16} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
            {user.name || "User Name"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {user.email || "email@example.com"}
          </p>

          <button 
            onClick={() => navigate('/edit-profile')}
            className="mt-5 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-full transition-opacity hover:opacity-80"
          >
            Edit Profile
          </button>
        </div>

        {/* Settings Sections */}
        <div className="max-w-md mx-auto px-4 mt-8 space-y-6">
          
          {/* Account Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3">Account</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => navigate('/personal-info')}
                className="w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 mr-4">
                  <IoPersonOutline size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white text-[15px]">Personal Info</p>
                  <p className="text-xs text-slate-500">Manage your account data</p>
                </div>
                <IoChevronForward className="text-slate-300" />
              </button>
            </div>
          </div>

          {/* Support/Log Out Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2 mb-3">Support</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mr-4">
                  <IoLogOutOutline size={22} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-red-500 text-[15px]">Sign Out</p>
                </div>
                <IoChevronForward className="text-red-200" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </BottomTabs>
  );
};

export default Profile;