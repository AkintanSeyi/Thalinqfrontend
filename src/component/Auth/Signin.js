import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"; // Ionicons for React Icons
import * as api from "../../api/index";

const AuthHeader = () => (
  <header className="absolute top-0 left-[-20px] pt-[10px] pb-[10px] px-0 z-10 flex justify-start">
    <img 
      src="https://res.cloudinary.com/dvuq6vmiy/image/upload/v1767771541/1000002239-removebg-preview_mgilwd.png" 
      alt="Logo"
      className="w-[180px] h-[100px] object-contain"
    />
  </header>
);

export default function SignIn({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const handleSignIn = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  setLoading(true);
  try {
    // 1. Send the exact same object structure as mobile
    const response = await api.login({ 
      email: email.toLowerCase().trim(), 
      password: password 
    });
    
    // 2. Mobile uses response.data.token, so we do the same here
    if (response.data && response.data.token) {
      const { token } = response.data;
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      navigate('/'); 
    }
  } catch (error) {
    // 3. Catch the specific error message from your backend
    const errorMessage = error.response?.data?.error || "Login Failed";
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col min-screen bg-[#0B0C1B] relative font-sans min-h-screen">
      <AuthHeader />
      
      <main className="flex-1 flex flex-col justify-center px-6 pt-[140px] max-w-[450px] mx-auto w-full">
        <h1 className="text-[#fff] text-[32px] font-bold mb-8 text-center">Sign In</h1>

        <form onSubmit={handleSignIn} className="flex flex-col">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            className="bg-[#1A1B2D] text-white px-4 py-[14px] rounded-xl mb-4 border border-[#2A2B3D] outline-none focus:border-[#FF4A57] placeholder-[#999]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Input Wrapper */}
          <div className="flex items-center bg-[#1A1B2D] rounded-xl mb-4 border border-[#2A2B3D] overflow-hidden focus-within:border-[#FF4A57]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="flex-1 bg-transparent text-white px-4 py-[14px] outline-none placeholder-[#999]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="px-[15px] text-[#999] flex items-center justify-center"
            >
              {showPassword ? <IoEyeOutline size={24} /> : <IoEyeOffOutline size={24} />}
            </button>
          </div>

          <div className="self-end mb-6">
            <Link to="/SendEmail" className="text-[#9333EA] text-sm font-semibold hover:opacity-80 transition-opacity">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#FF4A57] py-4 rounded-xl text-white font-bold text-lg mb-4 flex items-center justify-center transition-all ${loading ? 'opacity-70' : 'hover:brightness-110 active:scale-[0.98]'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="flex justify-center mt-5 text-base">
          <span className="text-white">Don't have an account?</span>
          <Link to="/signup" className="text-[#FF4A57] font-bold ml-1 hover:brightness-110 transition-all">
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}