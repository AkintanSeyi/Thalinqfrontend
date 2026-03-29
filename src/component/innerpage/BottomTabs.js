import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IoHome, IoHomeOutline, 
  IoChatbubbles, IoChatbubblesOutline, 
  IoPeople, IoPeopleOutline, 
  IoPerson, IoPersonOutline 
} from 'react-icons/io5';

const BottomTabs = ({ children }) => {
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/', activeIcon: <IoHome size={24} />, inactiveIcon: <IoHomeOutline size={24} /> },
    { name: 'Groups', path: '/group', activeIcon: <IoPeople size={24} />, inactiveIcon: <IoPeopleOutline size={24} /> },
    { name: 'Conversation', path: '/conversation', activeIcon: <IoChatbubbles size={24} />, inactiveIcon: <IoChatbubblesOutline size={24} /> },
    { name: 'Profile', path: '/profile', activeIcon: <IoPerson size={24} />, inactiveIcon: <IoPersonOutline size={24} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 pb-24">
        {children}
      </div>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0C1B] h-[85px] border-t border-slate-800 flex items-center justify-around px-4 pb-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link key={tab.path} to={tab.path} className="flex flex-col items-center justify-center">
              <div 
                className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-[#1E2035] text-white' : 'bg-transparent text-slate-500'
                }`}
              >
                {isActive ? tab.activeIcon : tab.inactiveIcon}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomTabs;