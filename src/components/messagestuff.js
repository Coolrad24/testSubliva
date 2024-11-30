import { useState, useEffect } from 'react';
import { doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseconfig';

export const useMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);
  const currentUser = auth.currentUser;

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
      }
    };

    fetchConversations();
  }, [currentUser]);

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    if (conversation) {
      const messagesRef = collection(db, 'conversations', conversation.id, 'messages');
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
          .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());

        setMessageHistory(messagesData);
      });

      return () => unsubscribe();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      senderId: currentUser.uid,
      message: newMessage.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'conversations', selectedConversation.id, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return {
    conversations,
    selectedConversation,
    newMessage,
    messageHistory,
    setNewMessage,
    selectConversation,
    sendMessage,
  };
};
