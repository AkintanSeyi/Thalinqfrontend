import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IoArrowBack, 
  IoCamera, 
  IoCheckmarkCircle, 
  IoInformationCircleOutline 
} from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import * as api from "../../api/index";

const CATEGORIES = [
  'Technology', 'Social', 'Fitness', 'Education', 'Gaming', 
  'Music', 'Travel', 'Party', 'Nightlife', 'Food & Drink', 
  'Sports', 'Art & Design', 'Photography', 'Business', 
  'Fashion', 'Movies', 'Outdoors', 'Wellness', 'Pets', 'Anime'
];

const PostGroup = () => {
  const navigate = useNavigate();

  // Form States
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Social');
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Store the actual file object
  
  // Logic States
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const extractedId = decoded.userId || decoded.id || decoded.sub;
        setUserId(String(extractedId));
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file)); // Preview URL
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || !description || !imageFile || !userId) {
      alert("Please fill in all fields and upload a cover image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("creator", userId);
      formData.append("price", "0"); 
      formData.append("isPrivate", "false");
      formData.append("profilePicture", imageFile);

      const response = await api.createGroup(formData);

      if (response.data.success) {
        alert("Group created successfully!");
        navigate("/groups");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Could not create group. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
          >
            <IoArrowBack size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Create New Community</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <form onSubmit={handleCreateGroup} className="space-y-8">
          
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Group Cover Photo
            </label>
            <label className="relative group cursor-pointer block">
              <div className={`aspect-video w-full rounded-3xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${
                image 
                ? "border-transparent" 
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500"
              }`}>
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center p-6">
                    <IoCamera size={48} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500 font-medium">Click to upload cover image</p>
                    <p className="text-xs text-slate-400 mt-1">Recommended size: 16:9 aspect ratio</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                    {image ? "Change Image" : "Select Image"}
                  </span>
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Group Name
            </label>
            <input 
              type="text"
              placeholder="e.g. Westside Runners Club"
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-semibold"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CATEGORIES.map((item) => {
                const isSelected = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected 
                      ? "bg-slate-950 text-white dark:bg-blue-600 shadow-md" 
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    {item}
                    {isSelected && <IoCheckmarkCircle size={18} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              About the Group
            </label>
            <textarea 
              rows="5"
              placeholder="What makes this group special? Describe the community and what members can expect."
              className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
            <IoInformationCircleOutline className="text-blue-500 shrink-0" size={24} />
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              New groups are created as <strong>Public & Free</strong> by default. You can manage privacy and membership settings later in your group management dashboard.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-950 dark:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Publish Community"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostGroup;