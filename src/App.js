import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import FooterComponent from './footer';
import FooterDashboard from './footerdash';
import Banner from './components/banner';
import AboutUs from './components/about';
import SearchResults from './components/search';
import PropertyDetails from './components/property';
import Navbar from './components/Navbar';
import ListProp from './components/list';
import SignIn from './components/signin';
import SignUp from './components/signup';
import Messages from './components/Messages';
import TestUsers from './components/TestUsers';
import MyListings from './components/MyListings';
import Settings from './components/Settings';
import Home from './components/Home';
import Verify from './components/verify';
import AdminPage from './components/Admin';
import Contract from './components/contract';
import CompleteContract from './components/completecontract';
import Dashboard from './components/dashboard';
import Footer from './components/footer';
import History from './components/history';
import MessagesToggle from './components/messagesToggle';
import Saved from './components/saved';
const firebaseConfig = {
  apiKey: "AIzaSyAa2RF5LCzVy72eUxpTJuaKb4Rs3EmVsgA",
  authDomain: "subliva-d49ad.firebaseapp.com",
  projectId: "subliva-d49ad",
  storageBucket: "subliva-d49ad.appspot.com",
  messagingSenderId: "492294811440",
  appId: "1:492294811440:web:0f88286dba701708b822f5",
  measurementId: "G-L63LBYBP9T"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Main App Component
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Banner />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/list" element={<ListProp />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/test-users" element={<TestUsers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/properties" element={<MyListings />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/complete-contract/:contractId" element={<CompleteContract />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/history" element={<History />}/>
        <Route path="/saved" element={<Saved />}/>
      </Routes>
      <MessagesToggle />
      <Footer /> {/* Add Footer here */}
    </Router>
  );
}

export default App;
