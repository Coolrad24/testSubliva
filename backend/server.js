// Import required modules
const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,query,where } = require('firebase/firestore');

// Firebase config object (from Firebase console)
const axios = require("axios");
const nodemailer = require('nodemailer'); 
const multer = require('multer');
const firebaseConfig = {
  apiKey: "AIzaSyAa2RF5LCzVy72eUxpTJuaKb4Rs3EmVsgA",
  authDomain: "subliva-d49ad.firebaseapp.com",
  projectId: "subliva-d49ad",
  storageBucket: "subliva-d49ad.firebasestorage.app",
  messagingSenderId: "492294811440",
  appId: "1:492294811440:web:0f88286dba701708b822f5",
  measurementId: "G-L63LBYBP9T"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const admin = require('firebase-admin');
const stripe = require('stripe')('sk_test_51QPUHdIz5iHsStSgNgcb2wlYy7tUonuii31q1Qwr64LjRrUgs2h9aQdpJXKTCutQZ1vOmLiP94NBNpbriSDi3IM800BFYFwwSk');
// Initialize Express app
const expressApp = express();
const PORT = process.env.PORT || 5001;

// Use CORS middleware to allow cross-origin requests (especially for frontend access)
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use((req, res, next) => {
    //console.log(`Request: ${req.method} ${req.url}`);
    next();
    
  });
// Multer setup for handling file uploads
const upload = multer();

// Email transporter configuration (use environment variables for security)
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with your email service provider
  auth: {
    user: "support@subliva.com", // Your email address
    pass: "orkx pevw cyqa ehte", // Your email password or app-specific password
  },
});

// Route to handle sending emails
expressApp.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  
  // If you're using `multer` for file uploads, check if the file is attached in the request
  const file = req.file;

  // Create the base mailOptions object without the attachment
  const mailOptions = {
    from: "support@subliva.com", // From the email configured in .env
    to,
    subject,
    text,
  };

  // If there's a file, add it as an attachment
  if (file) {
    mailOptions.attachments = [
      {
        filename: file.originalname,
        content: file.buffer,
      },
    ];
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});
//payment for featured sublistings
expressApp.post('/api/process-payment', async (req, res) => {
  const { listingId, collectionName, amount } = req.body;

  if (!listingId || !collectionName || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Endpoint for updating listing status
expressApp.post('/api/mark-featured', async (req, res) => {
  const { listingId, collectionName } = req.body;

  if (!listingId || !collectionName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Update the Firestore document
    const docRef = doc(db, collectionName, listingId);
    await updateDoc(docRef, {
      status: 'featured',
      updatedAt: serverTimestamp(),
    });

    res.status(200).json({ message: 'Listing marked as featured successfully' });
  } catch (error) {
    console.error('Error updating Firestore document:', error);
    res.status(500).json({ error: 'Failed to mark listing as featured' });
  }
});


// API routes
expressApp.get('/api/banner/:id', async (req, res) => {
    try {
      const bannerId = req.params.id;
      const bannerDoc = await getDoc(doc(db, 'banner', bannerId));
  
      if (!bannerDoc.exists()) {
        return res.status(404).json({ error: 'banner not found' });
      }
  
      res.status(200).json({ id: bannerDoc.id, ...bannerDoc.data() });
    } catch (error) {
      console.error("Failed to fetch banner:", error);
      res.status(500).json({ error: 'Failed to fetch banner' });
    }
  });
  // Fetch visited property IDs for a specific user
  expressApp.get('/api/userActivity/:userId', async (req, res) => {
    const userId = req.params.userId;
  
    try {
      // Access the document in the 'userActivity' collection for the given userId
      const userActivityRef = doc(db, 'userActivity', userId);
      const userActivityDoc = await getDoc(userActivityRef);
  
      if (!userActivityDoc.exists()) {
        return res.status(404).json({ error: 'User activity not found' });
      }
  
      // Retrieve the 'visitedProperties' array from the document data
      const visitedProperties = userActivityDoc.data().visitedProperties || [];
  
      if (visitedProperties.length === 0) {
        return res.status(200).json({ visitedProperties: [] });
      }
  
      // Filter the properties by status (verified or sold)
      const filteredProperties = await Promise.all(
        visitedProperties.map(async (propertyId) => {
          const propertyRef = doc(db, 'properties', propertyId); // Assuming properties are stored in a collection 'properties'
          const propertyDoc = await getDoc(propertyRef);
          
          if (propertyDoc.exists()) {
            const propertyData = propertyDoc.data();
  
            // Check the status field and only return properties that are 'verified' or 'sold'
            if (propertyData.status === 'verified' || propertyData.status === 'sold') {
              return { id: propertyDoc.id, ...propertyData }; // Return the full property details
            }
          }
          return null;  // If the property doesn't meet the criteria, return null
        })
      );
  
      // Filter out any null results (properties that don't match the criteria)
      const validProperties = filteredProperties.filter(property => property !== null);

      console.log("Fetched filtered properties:", validProperties);
      res.status(200).json({ visitedProperties: validProperties });
    } catch (error) {
      console.error("Failed to fetch user activity:", error);
      res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  });
  
  

// Fetch all properties
expressApp.get('/api/properties', async (req, res) => {
  try {
    const propertiesSnapshot = await getDocs(collection(db, 'properties'));
    const properties = propertiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(properties);
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Fetch a specific property by ID
expressApp.get('/api/properties/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log(propertyId);
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));

    if (!propertyDoc.exists()) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json({ id: propertyDoc.id, ...propertyDoc.data() });
  } catch (error) {
    console.error("Failed to fetch property:", error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Add a new property

expressApp.post('/api/properties', async (req, res) => {
  try {
    const newProperty = {
      property_name: req.body.property_name || '', // Make sure these fields exist
      address: req.body.address || '',
      city: req.body.city || '',
      zip_code: req.body.zip_code || '',
      featured_image: req.body.featured_image || '',
      gallery_image: Array.isArray(req.body.gallery_image) ? req.body.gallery_image : [], // Ensure it's an array
      description: req.body.description || '',
      price: req.body.price || 0, // Ensure numeric values are handled
      area_size: req.body.area_size || 0,
      bedroom: req.body.bedroom || 0,
      bathroom: req.body.bathroom || 0,
      garage: req.body.garage || 0,
      youtube_link: req.body.youtube_link || '',
    };

    const propertyRef = await addDoc(collection(db, 'properties'), newProperty);

    // Get the Firestore document ID as the property_id
    const propertyId = propertyRef.id;

    // Update the document with property_id
    await updateDoc(propertyRef, { property_id: propertyId });

    // Respond with the created property's ID and data
    res.status(201).json({ id: propertyRef.id, ...newProperty });
  } catch (error) {
    console.error('Failed to add property:', error);
    res.status(500).json({ error: 'Failed to add property' });
  }
});

// Update an existing property
expressApp.put('/api/properties/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    const updatedData = req.body;

    await updateDoc(doc(db, 'properties', propertyId), updatedData);
    res.status(200).json({ message: 'Property updated successfully' });
  } catch (error) {
    console.error("Failed to update property:", error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Delete a property
expressApp.delete('/api/properties/:id', async (req, res) => {
  try {
    const propertyId = req.params.id;
    await deleteDoc(doc(db, 'properties', propertyId));
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error("Failed to delete property:", error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});
// for city
// Fetch properties filtered by city, with optional bedroom, bathroom, and availability filters
expressApp.get('/api/property', async (req, res) => {
  const city = req.query.city ? req.query.city.trim().toLowerCase() : null;
  const state = req.query.state ? req.query.state.trim().toUpperCase() : null;
  const bedrooms = req.query.bedrooms ? parseInt(req.query.bedrooms) : null;
  const bathrooms = req.query.bathrooms ? parseInt(req.query.bathrooms) : null;
  const availabilityDate = req.query.availableFrom ? new Date(req.query.availableFrom) : null;
  const availabilityDateEnd = req.query.availableTo ? new Date(req.query.availableTo) : null;
  const page = req.query.page ? parseInt(req.query.page) : 1; // Default to page 1
  const limit = req.query.limit ? parseInt(req.query.limit) : 10; // Default to 10 results per page

  try {
    let properties = [];
    let q = collection(db, 'properties');
    const conditions = [];

    // Add Firestore query filters
    if (city) {
      console.log(`Filtering properties by city: ${city}`);
      conditions.push(where("city_lower", "==", city));
    }

    if (state) {
      console.log(`Filtering properties by state: ${state}`);
      conditions.push(where("state", "==", state)); // Assume `state` is stored as a two-letter abbreviation
    }

    if (availabilityDate) {
      console.log(`Filtering properties available from: ${availabilityDate}`);
      conditions.push(where('available_from', '<=', availabilityDate));
    }

    if (availabilityDateEnd) {
      console.log(`Filtering properties available to: ${availabilityDateEnd}`);
      conditions.push(where('available_to', '>=', availabilityDateEnd));
    }

    // Apply Firestore query with conditions if any
    if (conditions.length > 0) {
      q = query(q, ...conditions);
      console.log("Query conditions applied:", conditions);
    }

    const querySnapshot = await getDocs(q);
    console.log("Properties fetched:", querySnapshot.docs.length);

    // Map the documents to property objects
    properties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply additional filters client-side for bedrooms and bathrooms
    if (bedrooms) {
      console.log(`Filtering by bedrooms: ${bedrooms}`);
      properties = properties.filter(prop => prop.bedroom === bedrooms);
    }

    if (bathrooms) {
      console.log(`Filtering by bathrooms: ${bathrooms}`);
      properties = properties.filter(prop => prop.bathroom === bathrooms);
    }

    // Pagination logic
    const totalProperties = properties.length;
    const totalPages = Math.ceil(totalProperties / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Slice properties for current page
    const paginatedProperties = properties.slice(startIndex, endIndex);

    res.status(200).json({
      properties: paginatedProperties,
      currentPage: page,
      totalPages,
      totalProperties,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

expressApp.get("/api/places", async (req, res) => {
  try {
    const { input } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input,
          key: "AIzaSyArKRQigCdh2Wkrp-Cb8SMAYNMQau5GAxA",
          types: "(cities)",
          components: "country:us",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching Google Places API:", error.message);
    res.status(500).send("Error fetching Google Places API");
  }
});
// Get conversations for a user with property owner info
expressApp.get('/api/messages/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    // Fetch each conversation and include owner info
    for (const docSnapshot of querySnapshot.docs) {
      const conversation = { id: docSnapshot.id, ...docSnapshot.data() };
      
      // Fetch the property owner based on the propertyId in the conversation
      const propertyDoc = await getDoc(doc(db, 'properties', conversation.propertyId));
      if (propertyDoc.exists()) {
        conversation.propertyOwner = propertyDoc.data().ownerId;
        conversation.propertyPrice = propertyDoc.data().price || 0; // Optional: Include property price if available
      }

      conversations.push(conversation);
    }

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


// Send a new message
expressApp.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, message, propertyId } = req.body;
    
    // Create or get existing conversation
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants: [senderId, receiverId],
      propertyId,
      lastMessage: message,
      lastMessageTime: new Date(),
      messages: [{
        senderId,
        message,
        timestamp: new Date()
      }]
    });
    
    res.status(201).json({ conversationId: conversationRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});
expressApp.post('/api/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;
  const { visitedIds } = req.body; // Array of visited property details

  if (!visitedIds || !Array.isArray(visitedIds)) {
    return res.status(400).json({ message: 'Invalid visitedIds format' });
  }

  try {
    // Step 1: Extract visited cities and property IDs
    const visitedCities = new Set(
      visitedIds
        .filter((property) => property.city)
        .map((property) => property.city.toLowerCase())
    );

    const visitedPropertyIds = new Set(
      visitedIds
        .filter((property) => property.property_id)
        .map((property) => property.property_id)
    );

    // Step 2: Query all properties using modular syntax
    const propertiesRef = collection(db, 'properties');
    const allPropertiesSnapshot = await getDocs(propertiesRef);

    // Step 3: Filter recommendations
    const recommendations = allPropertiesSnapshot.docs
      .filter((doc) => {
        const propertyData = doc.data();
        const propertyCity = propertyData.city?.toLowerCase();
        return (
          propertyData.city && // Ensure the property has a city
          !visitedPropertyIds.has(doc.id) && // Exclude already visited properties
          (visitedCities.has(propertyCity) || visitedCities.size === 0) // Match city or suggest others
        );
      })
      .map((doc) => ({
        property_id: doc.id,
        ...doc.data(),
      }));

    // Step 4: Limit to 5 recommendations
    const limitedRecommendations = recommendations.slice(0, 5);

    return res.json(limitedRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




expressApp.get('/api/contracts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Get user's document from Firestore
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();
    console.log(userData);
    const userContracts = userData.contracts || []; // Array of contract IDs

    if (userContracts.length === 0) {
      return res.json({ contracts: [], totalBalance: 0 });
    }

    // Step 2: Fetch all contracts based on the IDs
    const contractsCollectionRef = collection(db, 'contracts');
    const fetchedContracts = [];
    let totalBalance = 0;

    // Using `Promise.all` for parallel fetching
    const contractPromises = userContracts.map(async (contractId) => {
      const contractRef = doc(contractsCollectionRef, contractId);
      const contractSnap = await getDoc(contractRef);

      if (contractSnap.exists()) {
        const contractData = contractSnap.data();
        fetchedContracts.push({ id: contractSnap.id, ...contractData });

        // Accumulate balance if the user is the buyer
        if (contractData.buyerId === userId) {
          totalBalance += contractData.buyerBalance || 0;
        }
      }
    });

    // Wait for all contract fetches to complete
    await Promise.all(contractPromises);
    console.log(contractPromises);
    // Step 3: Respond with the fetched contracts and total balance
    res.json({ contracts: fetchedContracts, totalBalance });
  } catch (error) {
    console.error('Error fetching user contracts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
// Listen for requests
expressApp.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
