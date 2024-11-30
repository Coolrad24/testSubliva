import React, { useState } from 'react';
import { useMessages } from './messagestuff';
import {auth} from './firebaseconfig';
import './Messages.css';

const MessagesToggle = () => {
  const {
    conversations,
    selectedConversation,
    newMessage,
    messageHistory,
    setNewMessage,
    selectConversation,
    sendMessage,
  } = useMessages();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700"
      >
        💬
      </button>

      {/* Messaging Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg w-80 h-96">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="text-lg font-semibold">
              {selectedConversation ? 'Conversation' : 'Messages'}
            </h3>
            <button
              onClick={() => {
                if (selectedConversation) {
                  selectConversation(null); // Go back to the conversation list
                } else {
                  setIsOpen(false); // Close the panel
                }
              }}
              className="text-xl font-bold"
            >
              {selectedConversation ? '←' : '×'}
            </button>
          </div>

          {/* Conversation List */}
          {!selectedConversation && (
            <div className="p-3 overflow-y-auto h-80">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <h4 className="text-sm font-semibold">{conv.propertyName}</h4>
                  <p className="text-xs text-gray-500">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  No conversations found.
                </p>
              )}
            </div>
          )}

          {/* Message View */}
          {selectedConversation && (
            <div className="flex flex-col h-80">
              <div className="flex-1 overflow-y-auto p-3">
                {messageHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg mb-2 ${
                      msg.senderId === auth.currentUser.uid
                        ? 'bg-blue-100 text-right'
                        : 'bg-gray-100 text-left'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp?.toDate().toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="p-2 border-t flex items-center"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesToggle;
