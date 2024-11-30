import React, { useState } from 'react';
import { auth, db } from './firebaseconfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const TestUsers = () => {
  const [status, setStatus] = useState('');

  const sampleUsers = [
    {
      email: 'john@example.com',
      password: 'password123',
      name: 'John Doe',
      role: 'tenant'
    },
    {
      email: 'jane@example.com',
      password: 'password123',
      name: 'Jane Smith',
      role: 'landlord'
    },
    {
      email: 'bob@example.com',
      password: 'password123',
      name: 'Bob Johnson',
      role: 'tenant'
    },
    {
      email: 'alice@example.com',
      password: 'password123',
      name: 'Alice Brown',
      role: 'landlord'
    }
  ];

  const createSampleUsers = async () => {
    setStatus('Creating users...');
    try {
      for (const user of sampleUsers) {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        // Add additional user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: new Date()
        });

        console.log(`Created user: ${user.email}`);
      }
      setStatus('All sample users created successfully!');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Error creating sample users:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Test Users</h2>
      <button onClick={createSampleUsers}>Create Sample Users</button>
      <p>{status}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Sample Users:</h3>
        <ul>
          {sampleUsers.map((user, index) => (
            <li key={index}>
              Email: {user.email} / Password: {user.password} ({user.role})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TestUsers; 