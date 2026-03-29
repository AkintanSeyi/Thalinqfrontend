import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import * as api from "../../api/index";

const VerifyFPotpADChnagepw = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state (similar to route.params)
  const email = location.state?.email || "";

  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputs = useRef([]);

  useEffect(() => {
    if (email) {
      autoSendOTP();
    } else {
      alert("No email found. Redirecting...");
      navigate("/signin");
    }
  }, [email]);

  const autoSendOTP = async () => {
    try {
      const response = await api.sendOTP(email);
      if (response.data.success) console.log("OTP sent!");
    } catch (error) {
      console.error("Auto-send OTP error:", error.response?.data?.message);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      alert("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyOTP(email, code);
      if (response.data.success) {
        setIsVerified(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwords.new || !passwords.confirm) {
      alert("Please fill in all fields.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    if (passwords.new.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const code = otp.join('');
      await api.resetPassword(email, code, passwords.new);
      alert("Password updated successfully!");
      navigate("/signin");
    } catch (error) {
      alert(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1); // Keep only the last char
    setOtp(newOtp);

    // Auto focus next
    if (val && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <main className="flex-1 flex flex-col justify-center px-6 max-w-[450px] mx-auto w-full">
        
        {!isVerified ? (
          <div className="w-full animate-fadeIn">
            <h1 className="text-[26px] font-bold text-[#1A1A1A] mb-2">Verify Code</h1>
            <p className="text-[15px] text-[#666] mb-8">Enter the code sent to <span className="font-semibold text-black">{email}</span></p>
            
            <form onSubmit={verifyOtp}>
              <div className="flex justify-between mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`w-[45px] h-[55px] border-2 rounded-xl text-center text-xl font-bold bg-[#F9F9F9] outline-none transition-colors ${otp[index] ? 'border-black' : 'border-[#E1E8ED] focus:border-black'}`}
                  />
                ))}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-[55px] bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Verify Code"}
              </button>
            </form>
            
            <button onClick={autoSendOTP} className="w-full mt-6 text-center text-[#666]">
              Didn't get code? <span className="font-bold text-black hover:underline cursor-pointer">Resend</span>
            </button>
          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            <h1 className="text-[26px] font-bold text-[#1A1A1A] mb-2">New Password</h1>
            <p className="text-[15px] text-[#666] mb-8">Set a strong new password for your account.</p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-[#333]">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full h-[55px] bg-[#F5F7FA] rounded-xl px-4 border border-[#E1E8ED] outline-none focus:border-black placeholder-[#999]"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-xs font-bold text-black uppercase"
                  >
                    {showPassword ? <IoEyeOffOutline size={22} /> : <IoEyeOutline size={22} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2 text-[#333]">Confirm Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full h-[55px] bg-[#F5F7FA] rounded-xl px-4 border border-[#E1E8ED] outline-none focus:border-black placeholder-[#999]"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-xs font-bold text-black uppercase"
                  >
                    {showConfirmPassword ? <IoEyeOffOutline size={22} /> : <IoEyeOutline size={22} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-[55px] bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70 mt-4"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyFPotpADChnagepw;