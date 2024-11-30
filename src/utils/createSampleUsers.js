import { auth, db } from '../firebaseconfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

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

export const createSampleUsers = async () => {
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
    console.log('All sample users created successfully');
  } catch (error) {
    console.error('Error creating sample users:', error);
  }
}; 