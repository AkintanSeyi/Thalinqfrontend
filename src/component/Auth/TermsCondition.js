import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5"; // To allow users to go back to Signup/Signin

const TermsCondition = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 1,
      heading: "1. Eligibility",
      body: "By using Thalinq, you represent and warrant that you are at least 18 years of age. If you are under 18, you are not authorized to use this app under any circumstances."
    },
    {
      id: 2,
      heading: "2. User-Generated Content & Zero Tolerance",
      body: (
        <>
          Thalinq allows users to create groups and post content. There is <span className="font-bold">zero tolerance for objectionable content or abusive users</span>. You agree not to:
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Harass, bully, or threaten other members.</li>
            <li>Post defamatory, obscene, or sexually explicit material.</li>
            <li>Post content that promotes violence or illegal activities.</li>
          </ul>
          Any user found violating these terms will be ejected and banned immediately.
        </>
      )
    },
    {
      id: 3,
      heading: "3. Reporting & Moderation",
      body: (
        <>
          Users can flag any content they find objectionable. Thalinq moderators will review all reports and <span className="font-bold">act on objectionable content reports within 24 hours</span> by removing the content and/or ejecting the user who provided the offending content.
        </>
      )
    },
    {
      id: 4,
      heading: "4. Blocking Users",
      body: "Thalinq provides a mechanism for users to block abusive users. Blocking a user will instantly remove that user's content from your feed and prevent them from contacting you."
    },
    {
      id: 5,
      heading: "5. Safety & Disclaimer",
      body: "Thalinq is not liable for interactions between users. Please exercise caution when meeting group members in person."
    },
    {
      id: 6,
      heading: "6. Account Termination",
      body: "We reserve the right to terminate or suspend your account at any time, without prior notice, for any violation of these terms."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#444]">
      {/* Simple Header with Back Button */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IoArrowBack size={24} color="#000" />
        </button>
        <h2 className="text-lg font-bold text-black">Legal</h2>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-[26px] font-bold text-black mb-1">Terms & Conditions (EULA)</h1>
        <p className="text-[18px] text-[#6200ee] font-semibold mb-1">Thalinq: Party Hub</p>
        <p className="text-sm text-[#888] mb-8">Effective Date: January 2026</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.id} className="border-b border-gray-50 pb-6 last:border-0">
              <h2 className="text-[18px] font-bold text-[#222] mb-3">{section.heading}</h2>
              <div className="text-[15px] leading-[22px] text-[#444]">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-[#888]">
            Questions about our Terms? Contact support@thalinq.com
          </p>
        </footer>
      </main>
    </div>
  );
};

export default TermsCondition;