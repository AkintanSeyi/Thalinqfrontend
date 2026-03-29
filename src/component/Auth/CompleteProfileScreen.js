import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from "../../api/index";

const interestOptions = [
  'Technology', 'Social', 'Fitness', 'Education', 'Gaming', 'Music', 'Travel',
  'Party', 'Nightlife', 'Food & Drink', 'Sports', 'Art & Design', 'Photography',
  'Business', 'Fashion', 'Movies', 'Outdoors', 'Wellness', 'Pets', 'Anime'
];

export default function CompleteProfileScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [profileImage, setProfileImage] = useState(null); // File object for upload
  const [imagePreview, setImagePreview] = useState(null); // URL for display
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      alert("Session expired. Please sign up again.");
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleFinish = async (e) => {
    e.preventDefault();

    if (!profileImage) return alert("Please upload a profile photo.");
    if (!phone.trim()) return alert("Please enter your phone number.");
    if (!bio.trim()) return alert("Please write a short bio.");
    if (interests.length === 0) return alert("Please select at least one interest.");
    if (!isAgreed) return alert("Please accept the terms to continue.");

    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('bio', bio);
    formData.append('isAgreed', isAgreed);
    formData.append('interests', JSON.stringify(interests));
    formData.append('profileImage', profileImage); // Browser sends File object directly

    try {
      const response = await api.completeProfile(formData);
      if (response.data.success) {
        alert("Profile updated successfully!");
        navigate("/otp", { state: { email } });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update profile";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans p-5 flex flex-col items-center">
      <div className="max-w-[500px] w-full pb-10">
        <h1 className="text-2xl font-bold mb-6 mt-10 text-center">Complete Your Profile</h1>

        <form onSubmit={handleFinish} className="flex flex-col">
          {/* Profile Image Picker */}
          <div className="self-center mb-6">
            <label className="cursor-pointer group relative">
              <div className="w-[110px] h-[110px] rounded-full bg-[#f0f0f0] border border-[#ddd] flex items-center justify-center overflow-hidden transition-all group-hover:border-black">
                {imagePreview ? (
                  <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[12px] text-[#888]">Upload Photo</span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
            </label>
          </div>

          <label className="text-base font-semibold mb-2 text-[#333]">Phone Number</label>
          <input
            type="tel"
            className="border border-[#ddd] rounded-lg p-3 text-base mb-5 focus:border-black outline-none transition-colors"
            placeholder="+1 234 567 890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="text-base font-semibold mb-2 text-[#333]">Bio</label>
          <textarea
            className="border border-[#ddd] rounded-lg p-3 text-base mb-5 h-20 resize-none focus:border-black outline-none transition-colors"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <label className="text-base font-semibold mb-2 text-[#333]">Interests</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {interestOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  interests.includes(item) 
                  ? 'bg-black border-black text-white' 
                  : 'bg-transparent border-black text-black hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Terms Checkbox */}
          <div 
            className="flex items-center mb-8 cursor-pointer select-none"
            onClick={() => setIsAgreed(!isAgreed)}
          >
            <div className={`w-[22px] h-[22px] border-2 rounded flex items-center justify-center mr-3 transition-colors ${
              isAgreed ? 'bg-black border-black' : 'border-black'
            }`}>
              {isAgreed && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-sm text-[#666]">I agree to the Terms and Conditions</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}