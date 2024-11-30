import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatButton = ({ conversations, isLoggedIn }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  if (!isLoggedIn) return null; // Hide button if the user is not logged in

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <i className="fas fa-comments text-xl"></i>
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-5 w-72 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
          <div className="p-4 bg-blue-500 text-white font-bold flex items-center justify-between">
            <span>Your Messages</span>
            <button
              onClick={toggleChat}
              className="text-white focus:outline-none"
            >
              ✕
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
                  onClick={() => navigate(`/messages/${conv.id}`)}
                >
                  <h4 className="text-sm font-medium">{conv.propertyName}</h4>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No conversations yet.</p>
            )}
          </div>
          <div className="p-2 border-t">
            <button
              onClick={() => navigate("/messages")}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go to Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
