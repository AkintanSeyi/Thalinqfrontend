import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
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

export default function SignUp({ setIsLoggedIn }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmpassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const handleSignUp = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmpassword } = formData;

    if (!name || !email || !password || !confirmpassword) {
      alert("All fields are mandatory.");
      return;
    }

    if (password !== confirmpassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // FIX: Map lowercase state to Capitalized backend keys
      const dataToSend = {
        Name: name,
        Email: email.toLowerCase(),
        Password: password,
        typeofuser: "user" 
      };

      const response = await api.signup(dataToSend);
      
      if (response.status === 201) {
        navigate("/");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Check your internet connection.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0C1B] relative font-sans overflow-x-hidden">
      <AuthHeader />
      
      {/* Container mirrors the ScrollView behavior */}
      <main className="flex-1 flex flex-col justify-center px-6 pt-[140px] pb-10 max-w-[450px] mx-auto w-full">
        <h1 className="text-white text-[32px] font-bold mb-8 text-center">Create Account</h1>

        <form onSubmit={handleSignUp} className="flex flex-col">
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="bg-[#1A1B2D] text-white px-4 py-[14px] rounded-xl mb-4 border border-[#2A2B3D] outline-none focus:border-[#FF4A57] placeholder-[#999]"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="bg-[#1A1B2D] text-white px-4 py-[14px] rounded-xl mb-4 border border-[#2A2B3D] outline-none focus:border-[#FF4A57] placeholder-[#999]"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {/* Password */}
          <div className="flex items-center bg-[#1A1B2D] rounded-xl mb-4 border border-[#2A2B3D] overflow-hidden focus-within:border-[#FF4A57]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="flex-1 bg-transparent text-white px-4 py-[14px] outline-none placeholder-[#999]"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="px-[15px] text-[#999]"
            >
              {showPassword ? <IoEyeOutline size={24} /> : <IoEyeOffOutline size={24} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center bg-[#1A1B2D] rounded-xl mb-4 border border-[#2A2B3D] overflow-hidden focus-within:border-[#FF4A57]">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="flex-1 bg-transparent text-white px-4 py-[14px] outline-none placeholder-[#999]"
              onChange={(e) => setFormData({ ...formData, confirmpassword: e.target.value })}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="px-[15px] text-[#999]"
            >
              {showConfirmPassword ? <IoEyeOutline size={24} /> : <IoEyeOffOutline size={24} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#FF4A57] py-4 rounded-xl text-white font-bold text-lg mt-[10px] mb-4 flex items-center justify-center transition-all ${loading ? 'opacity-70' : 'hover:brightness-110 active:scale-[0.98]'}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <div className="flex justify-center mt-5 mb-8 text-base">
          <span className="text-white">Already have an account?</span>
          <Link to="/signin" className="text-[#FF4A57] font-bold ml-1 hover:brightness-110"> Sign In</Link>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center px-2 text-center text-[12px] text-[#777] leading-tight">
          <span>By signing up, you agree to our </span>
          <Link to="/terms&condition" className="text-[#FF4A57] font-semibold underline mx-1">Terms & Conditions</Link>
          <span> and </span>
          <Link to="/privatepolicy" className="text-[#FF4A57] font-semibold underline mx-1">Privacy Policy</Link>
        </div>
      </main>
    </div>
  );
}