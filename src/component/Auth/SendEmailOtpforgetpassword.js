import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from "../../api/index";



const SendEmailOtpforgetpassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const response = await api.generateResetCode(trimmedEmail);
      
      if (response.status === 200) {
        alert("Reset code has been sent to your email.");
        
        // Navigate to the Verify screen and pass the email via state
        navigate("/Verify", { state: { email: trimmedEmail } });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to send reset code. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <main className="flex-1 flex flex-col justify-center px-6 max-w-[450px] mx-auto w-full">
        
        <div className="w-full">
          <h1 className="text-[28px] font-[800] text-[#1A1A1A] mb-3">Forgot Password?</h1>
          <p className="text-[16px] text-[#666] leading-6 mb-10">
            Enter your email address below. We will send you a 6-digit code to reset your password.
          </p>

          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#1A1A1A] mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. name@example.com"
                className={`w-full h-[55px] bg-[#F5F7FA] rounded-xl px-4 text-base text-black border border-[#E1E8ED] outline-none focus:border-black transition-colors placeholder-[#999] ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full h-[55px] bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-md active:scale-[0.98] ${
                loading ? 'opacity-70' : 'hover:bg-[#333]'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send Code"
              )}
            </button>
          </form>

          <div className="mt-[25px] flex justify-center">
            <Link 
              to="/signin" 
              className={`text-[#666] text-[15px] font-medium hover:text-black transition-colors ${
                loading ? 'pointer-events-none' : ''
              }`}
            >
              Back to Login
            </Link>
          </div>
        </div>
        
      </main>
    </div>
  );
};

export default SendEmailOtpforgetpassword;