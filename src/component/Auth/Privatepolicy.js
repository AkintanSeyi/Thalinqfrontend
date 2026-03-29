import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";

const PrivatePolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 1,
      heading: "1. Age Requirement",
      body: (
        <>
          Thalinq is strictly for individuals aged <span className="font-bold text-black">18 and older</span>. We do not knowingly collect data from anyone under 18. If we discover a minor is using the app, we will terminate the account immediately.
        </>
      )
    },
    {
      id: 2,
      heading: "2. Information We Collect",
      body: (
        <ul className="list-disc ml-5 space-y-2">
          <li><span className="font-bold text-black">Account Information:</span> Name, email, and date of birth.</li>
          <li><span className="font-bold text-black">Group Activity:</span> Content, photos, and messages shared in the party hub.</li>
          <li><span className="font-bold text-black">Connections:</span> Data regarding the groups you create or join.</li>
        </ul>
      )
    },
    {
      id: 3,
      heading: "3. How We Use Data",
      body: "We use your information to facilitate group interactions, ensure user safety, and provide notifications about your \"party hub\" activities."
    },
    {
      id: 4,
      heading: "4. Data Sharing",
      body: "Your profile and group contributions are visible to other members of the groups you join. We do not sell your personal data to third parties."
    },
    {
      id: 5,
      heading: "5. Contact Us",
      body: "If you have questions regarding your privacy, please contact our support team at support@thalinq.com."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#444]">
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Go back"
        >
          <IoArrowBack size={24} color="#000" />
        </button>
        <h2 className="text-lg font-bold text-black">Privacy</h2>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-[24px] font-bold text-black mb-1">Privacy Policy for Thalinq</h1>
        <p className="text-sm text-[#666] mb-8">Last Updated: October 2023</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.id} className="border-b border-gray-50 pb-6 last:border-0">
              <h2 className="text-[18px] font-bold text-[#333] mb-3">{section.heading}</h2>
              <div className="text-[15px] leading-[22px] text-[#444]">
                {section.body}
              </div>
            </section>
          ))}
        </div>
        
        <footer className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-[#999]">
            © 2026 Thalinq. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PrivatePolicy;