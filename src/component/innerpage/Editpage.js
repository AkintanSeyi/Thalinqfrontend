import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCamera, IoCheckmark } from 'react-icons/io5';
import { jwtDecode } from "jwt-decode"; // Added for consistency
import * as api from '../../api/index';

const ALL_CATEGORIES = [
  'Technology', 'Social', 'Fitness', 'Education', 'Gaming', 'Music', 'Travel',
  'Party', 'Nightlife', 'Food & Drink', 'Sports', 'Art & Design', 'Photography',
  'Business', 'Fashion', 'Movies', 'Outdoors', 'Wellness', 'Pets', 'Anime'
];

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState([]);
  const [profileImage, setProfileImage] = useState(null); 
  const [selectedFile, setSelectedFile] = useState(null); 

  useEffect(() => {
    loadUserData();
    // Cleanup preview URL when component unmounts
    return () => {
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        const userEmail = decoded.email;

        if (userEmail) {
          const response = await api.getUserProfile(userEmail);
          const user = response.data.user;
          // Ensure keys match lowercase backend/native logic
          setName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setBio(user.bio || "");
          setInterests(user.interests || []);
          setProfileImage(user.profileImage);
        }
      } else {
        navigate('/signin');
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up the old preview URL before creating a new one
      if (profileImage && profileImage.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file)); 
    }
  };

  const toggleInterest = (cat) => {
    setInterests(prev => 
      prev.includes(cat) ? prev.filter(i => i !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('email', email); // Use the email from state
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('bio', bio);
      formData.append('interests', JSON.stringify(interests));

      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await api.updateProfile(formData);
      if (response.data.success) {
        alert("Profile updated successfully!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
        <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <IoArrowBack size={24} className="text-slate-700 dark:text-white" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h1>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className={`font-bold px-2 ${saving ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}
        >
          {saving ? '...' : 'Done'}
        </button>
      </div>

      <div className="mx-auto max-w-xl px-4 pt-6">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative">
            <img 
              src={profileImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuQWVd2N57kwCTsg0z5wCIdvXX5DRKu6w1RA&s"} 
              alt="Profile" 
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md dark:border-slate-800"
            />
            <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-lg dark:border-slate-900 transition-transform hover:scale-110">
              <IoCamera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Change Profile Photo</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="ml-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Full Name</label>
            <input 
              className="mt-1 w-full rounded-2xl border border-slate-100 bg-white p-4 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="ml-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Phone Number</label>
            <input 
              type="tel"
              className="mt-1 w-full rounded-2xl border border-slate-100 bg-white p-4 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+234..."
            />
          </div>

          <div>
            <label className="ml-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Bio</label>
            <textarea 
              rows="3"
              className="mt-1 w-full rounded-2xl border border-slate-100 bg-white p-4 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white resize-none"
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell the community about yourself..."
            />
          </div>

          <div>
            <label className="ml-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Interests</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = interests.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInterest(cat)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    {cat}
                    {isSelected && <IoCheckmark size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="mt-10 w-full rounded-2xl bg-indigo-600 py-4 text-center font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 dark:shadow-none"
        >
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;