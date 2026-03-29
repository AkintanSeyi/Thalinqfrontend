import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Dashboard from "./component/innerpage/Dashboard";
import Group from "./component/innerpage/Group";

import Conversation from "./component/innerpage/Conversation";
import Profile from "./component/innerpage/Profile";
import Signin from "./component/Auth/Signin";
import Signup from "./component/Auth/Signup";
import VerifyFPotpADChnagepw from "./component/Auth/VerifyFPotpADChnagepw";
import TermsCondition from "./component/Auth/TermsCondition";
import SendEmailOtpforgetpassword from "./component/Auth/SendEmailOtpforgetpassword";
import Privatepolicy from "./component/Auth/Privatepolicy";
import OTP from "./component/Auth/OTP";
import CompleteProfileScreen from "./component/Auth/CompleteProfileScreen";

import GroupDetail from "./component/innerpage/GroupDetail";
import Postingroup from "./component/innerpage/Postinggroup";
import PostGroup from "./component/innerpage/PostGroup";

import Messages from "./component/innerpage/Message";

import PersonalInfo from "./component/innerpage/Personalinfo";
import EditProfile from "./component/innerpage/Editpage";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Logic: Check Login Status (Web version of your mobile useEffect) ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // --- Component: Scroll to top on page change ---
  function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    return null;
  }

  

  // --- Component: Protected Route Wrapper ---
  const ProtectedRoute = ({ children }) => {
    if (isLoading) return null; // Or a spinner
    return isLoggedIn ? children : <Navigate to="/signin" />;
  };

  if (isLoading) return null; // Global loading state 

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Public Routes (Always accessible) */}
        <Route
          path="/signin"
          element={
            <Signin setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
          }
        />
        <Route path="/terms&condition" element={<TermsCondition />} />
        <Route path="/privatepolicy" element={<Privatepolicy />} />
        <Route path="/SendEmail" element={<SendEmailOtpforgetpassword />} />
        <Route path="/Verify" element={<VerifyFPotpADChnagepw />} />
        <Route path="/OTP" element={<OTP setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/Completeprofile" element={<CompleteProfileScreen />} />
        <Route path="/group/:id" element={<GroupDetail />} />
        <Route path="/groups/:id/post" element={<Postingroup />} />
        <Route path="/create-group" element={<PostGroup />} />
        <Route path="/messages/:id" element={<Messages />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
             <Route path="/edit-profile" element={<EditProfile />} />

        {/* Protected Routes (User must be logged in) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group"
          element={
            <ProtectedRoute>
              <Group />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversation"
          element={
            <ProtectedRoute>
              <Conversation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/signin"} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
