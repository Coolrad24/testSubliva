import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseconfig';
import './Messages.css';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
  arrayUnion
} from 'firebase/firestore';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const [offerPopupVisible, setOfferPopupVisible] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherParticipantName, setOtherParticipantName] = useState('');
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Fetch conversations based on the user's message IDs in their document
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error('User document not found');
          return;
        }

        const messageIds = userDoc.data().messages || [];
        const conversationPromises = messageIds.map((messageId) => {
          const conversationRef = doc(db, 'conversations', messageId);
          return getDoc(conversationRef);
        });

        const conversationDocs = await Promise.all(conversationPromises);
        const fetchedConversations = conversationDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.lastMessageTime?.toDate() - a.lastMessageTime?.toDate());

        setConversations(fetchedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  // Fetch message history and participant's name when a conversation is selected
  useEffect(() => {
    const fetchOtherParticipantName = async (otherParticipantId) => {
      try {
        const userDocRef = doc(db, 'users', otherParticipantId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setOtherParticipantName(userDoc.data().firstName || 'User');
        }
      } catch (error) {
        console.error('Error fetching participant name:', error);
      }
    };

    if (selectedConversation) {
      const otherParticipantId = selectedConversation.participants.find(
        (participantId) => participantId !== currentUser.uid
      );

      if (otherParticipantId) {
        fetchOtherParticipantName(otherParticipantId);
      }

      const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate()); // Sort messages by timestamp ascending

        setMessageHistory(messagesData);
      });

      return () => unsubscribe();
    }
  }, [selectedConversation, currentUser]);

  // Mark conversation as read
  const markConversationAsRead = async (convId) => {
    if (currentUser) {
      const conversationRef = doc(db, 'conversations', convId);
      await updateDoc(conversationRef, {
        [`unread.${currentUser.uid}`]: false,
      });
    }
  };

  // Select conversation and set the offer price
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setMessageHistory([]);
    setOfferPrice(conv.propertyPrice || '');
    markConversationAsRead(conv.id);
  };

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUser.uid,
      message: newMessage.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'conversations', selectedConversation.id, 'messages'), messageData);
      setNewMessage('');
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        [`unread.${selectedConversation.participants.find(p => p !== currentUser.uid)}`]: true,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Toggle offer popup
  const toggleOfferPopup = () => {
    if (selectedConversation.propertyOwner === currentUser.uid) {
      setOfferPopupVisible(!offerPopupVisible);
    }
  };

  // Handle Extend Offer button
  const handleExtendOffer = async () => {
    try {
      if (selectedConversation.propertyOwner === currentUser.uid) {
        const newContractRef = doc(collection(db, 'contracts'));
        const contractId = newContractRef.id;
  
        // Fetch owner and buyer email addresses from the 'users' collection
        const ownerRef = doc(db, 'users', selectedConversation.participants[1]);
        const buyerRef = doc(db, 'users',  selectedConversation.participants[0]);
        const propertyRef = doc(db, 'properties',selectedConversation.propertyId);
        const propertySnap = await getDoc(propertyRef);
        const ownerSnap = await getDoc(ownerRef);
        const buyerSnap = await getDoc(buyerRef);
  
        if (!ownerSnap.exists() || !buyerSnap.exists()) {
          throw new Error('User data not found');
        }
  
        const ownerEmail = ownerSnap.data().email;
        const buyerEmail = buyerSnap.data().email;
        console.log(ownerEmail);
        console.log(buyerEmail);
        // Create a new contract document
        const contractData = {
          ownerId: currentUser.uid,
          ownerEmail,
          buyerId: selectedConversation.participants[0],
          buyerEmail,
          propertyId: selectedConversation.propertyId,
          offerPrice,
          startDate,
          endDate,
          status: 'unsigned',
          createdAt: new Date(),
        };
  
        await setDoc(newContractRef, contractData);
  
        // Update the property with contract reference for both users
        await updateDoc(ownerRef, {
          contracts: arrayUnion(contractId),
        });
  
        await updateDoc(buyerRef, {
          contracts: arrayUnion(contractId),
        });
        await updateDoc(propertyRef, { status: "sold"});
        // Navigate to the contract page with pre-filled data
        navigate('/contract', { state: { offerPrice, propertyId: selectedConversation.propertyId, contractId,startDate,endDate } });
      }
    } catch (error) {
      console.error('Error extending offer:', error);
      alert('Failed to create contract.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
          onClick={() => navigate('/new-conversation')}
        >
          Start New Conversation
        </button>
      </div>
  
      <div className="flex max-w-6xl mx-auto mt-6 gap-4">
        {/* Conversations List */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Your Conversations</h3>
          {loading ? (
            <div className="text-gray-500 mt-4">Loading conversations...</div>
          ) : conversations.length > 0 ? (
            <div className="space-y-3 mt-4">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedConversation?.id === conv.id
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <h4 className="text-sm font-semibold text-gray-800">
                    {conv.propertyName} - {otherParticipantName || 'User'}
                  </h4>
                  <p className="text-xs text-gray-600 flex items-center justify-between">
                    {conv.lastMessage || 'No messages yet'}
                    {conv.unread && conv.unread[currentUser.uid] && (
                      <span className="w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">
              No conversations yet. Start one by messaging a property owner!
            </p>
          )}
        </div>
  
        {/* Message View */}
        <div className="w-2/3 bg-white rounded-lg shadow p-4">
          {selectedConversation ? (
            <>
              <div className="border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Chat with {otherParticipantName}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedConversation.propertyOwner === currentUser.uid
                    ? 'You are the owner of this property'
                    : `Property Price: $${selectedConversation.propertyPrice}`}
                </p>
              </div>
              <div className="messages-list h-64 overflow-y-auto space-y-4">
                {messageHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.senderId === currentUser.uid
                        ? 'bg-blue-100 text-right'
                        : 'bg-gray-100 text-left'
                    }`}
                  >
                    <p className="text-sm text-gray-800">{msg.message}</p>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp?.toDate().toLocaleString() || ''}
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center mt-4 space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </form>
              {(selectedConversation.propertyOwner === currentUser.uid && selectedConversation.propertyStatus === "verified") && (
                <button
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  onClick={toggleOfferPopup}
                >
                  Extend Offer
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">Select a conversation to view messages</p>
          )}
        </div>
      </div>
  
      {/* Offer Popup */}
      {offerPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Extend Offer</h3>
          <input
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            placeholder="Enter offer price"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
          />
          <div className="mb-4">
            <label htmlFor="start-date" className="block text-left text-gray-700 font-medium mb-1">
              Sublease Start Date:
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="end-date" className="block text-left text-gray-700 font-medium mb-1">
              Sublease End Date:
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleOfferPopup}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleExtendOffer}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Extend Offer
            </button>
          </div>
        </div>
      </div>
      
      )}
    </div>
  );
  
};

export default Messages;