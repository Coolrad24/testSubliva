import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from './firebaseconfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error messages

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to the home page or dashboard after successful login
    } catch (err) {
      setError('Failed to sign in. Please check your email and password.');
      console.error(err);
    }
  };

  const handleForgotPassword = async () => {
    setError(''); // Clear any previous error messages
    setSuccess(''); // Clear any previous success messages

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
        <form onSubmit={handleSignIn} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-500 text-center">{success}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium px-4 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">
            Don’t have an account yet?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up!
            </Link>
          </p>
          <p
            className="text-sm text-blue-500 mt-2 cursor-pointer hover:underline"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
  
};

export default SignIn;
