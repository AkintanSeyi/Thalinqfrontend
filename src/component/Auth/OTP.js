import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from "../../api/index";

const OTP = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve email from location state (passed from CompleteProfile)
  const email = location.state?.email || 'user@example.com';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  // Auto-send OTP when the page opens (matching your mobile logic)
  useEffect(() => {
    if (!location.state?.email) {
      alert("Session expired. Please start again.");
      navigate("/signup");
    } else {
      handleSendOTP();
    }
  }, []);

  const handleSendOTP = async () => {
    try {
      setResending(true);
      const response = await api.sendOTP(email);
      if (response.data.success) {
        console.log("OTP Sent to:", email);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send code");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOTP = async (finalOtp) => {
    const otpString = finalOtp || otp.join('');
    
    if (otpString.length < 6) {
      alert("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyOTP(email, otpString);
      
      if (response.data.token) {
        const { token } = response.data;
        
        // 1. Save token to localStorage (Web equivalent of AsyncStorage)
        localStorage.setItem('token', token);
        
        // 2. Update global auth state
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
          navigate("/"); // Redirect to Dashboard
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    // Take only the last character (handles overwrite)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }

    // Auto-submit when last digit is entered
    if (newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 font-sans">
      <div className="max-w-[400px] w-full text-center">
        <h1 className="text-2xl font-bold text-[#1A1A1B] mb-2">Verification Code</h1>
        <p className="text-[15px] text-[#666] mb-8 leading-relaxed">
          We have sent a 6-digit verification code to your email{' '}
          <span className="font-semibold text-[#1A1A1B]">{email}</span>
        </p>

        {/* OTP Input Group */}
        <div className="flex justify-between gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => (inputs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold transition-all outline-none bg-[#F9F9F9] ${
                digit ? 'border-[#007AFF] bg-white' : 'border-[#E0E0E0]'
              } focus:border-[#007AFF]`}
            />
          ))}
        </div>

        <button
          onClick={() => handleVerifyOTP()}
          disabled={loading}
          className={`w-full h-14 bg-black text-white rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center mb-5 ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#333]'
          }`}
        >
          {loading ? (
             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verify & Proceed"
          )}
        </button>

        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-[#666]">Didn't receive the code?</span>
          <button 
            onClick={handleSendOTP} 
            disabled={resending}
            className="text-[#007AFF] font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTP;