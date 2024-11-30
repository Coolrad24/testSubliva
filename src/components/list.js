import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from './firebaseconfig';
import { doc, setDoc, collection, addDoc,serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
const ListProp = () => {
  const navigate = useNavigate();
  const [propertyDetails, setPropertyDetails] = useState({
    property_name: '',
    address: '',
    city: '',
    zip_code: '',
    featured_image: null,
    gallery_image: [],
    description: '',
    price: '',
    area_size: '',
    bedroom: '',
    bathroom: '',
    garage: '',
    youtube_link: '',
    owner: '',
    status: '',
    city_lower: '',
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPropertyDetails((prevDetails) => ({
      ...prevDetails,
      [name]: (['price', 'area_size', 'bedroom', 'bathroom', 'garage'].includes(name))
        ? parseInt(value) || ''
        : value,
    }));
  };

  // Validate file type and handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const validTypes = ['image/png', 'image/jpeg'];
    
    const validFiles = Array.from(files).filter((file) =>
      validTypes.includes(file.type)
    );

    if (validFiles.length !== files.length) {
      setError('Only .png and .jpg files are allowed');
      return;
    }

    if (name === 'featured_image') {
      setPropertyDetails((prevDetails) => ({
        ...prevDetails,
        featured_image: validFiles[0],
      }));
    } else if (name === 'gallery_image') {
      setPropertyDetails((prevDetails) => ({
        ...prevDetails,
        gallery_image: validFiles,
      }));
    }
  };

  // Compress image function
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 600,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated. Please log in.");
    }

    // Upload and get URL for Featured Image
    let featuredImageUrl = '';
    if (propertyDetails.featured_image) {
      const compressedFeaturedImage = await compressImage(propertyDetails.featured_image);
      const featuredImageRef = ref(storage, `properties/${propertyDetails.property_name}/featured/${compressedFeaturedImage.name}`);
      const featuredUploadTask = uploadBytesResumable(featuredImageRef, compressedFeaturedImage);

      featuredImageUrl = await new Promise((resolve, reject) => {
        featuredUploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.error("Error uploading featured image:", error);
            setError("Failed to upload featured image. Please try again.");
            setLoading(false);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(featuredUploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    }

    // Upload and get URLs for Gallery Images
    const galleryImageUrls = [];
    if (propertyDetails.gallery_image && propertyDetails.gallery_image.length > 0) {
      for (const file of propertyDetails.gallery_image) {
        const compressedFile = await compressImage(file);
        const galleryImageRef = ref(storage, `properties/${propertyDetails.property_name}/gallery/${compressedFile.name}`);
        const galleryUploadTask = uploadBytesResumable(galleryImageRef, compressedFile);

        await new Promise((resolve, reject) => {
          galleryUploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error("Error uploading gallery image:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(galleryUploadTask.snapshot.ref);
              galleryImageUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }
    }

    // Exclude File objects from propertyDetails
    const { featured_image, gallery_image, ...propertyData } = propertyDetails;

    // Create Firestore Document with Image URLs
    
    const pendingCollectionRef = collection(db, 'pending');
    const propertyDocRef = await addDoc(pendingCollectionRef, {
      ...propertyData,
      featured_image: featuredImageUrl,
      gallery_images: galleryImageUrls,
      owner: user.uid,
      ownerEmail: user.email, // Include owner's email
      status: 'pending',
      createdAt: serverTimestamp(),
      city_lower: propertyData.city.toLowerCase(),
    });
    setPropertyId(propertyDocRef.id);
    setSuccess("Property listed successfully!");
    setShowPopup(true);
    setLoading(false);
  } catch (error) {
    console.error("Error listing property:", error);
    setError(error.message);
    setLoading(false);
  }
};

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/verify', { state: { propertyId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-28">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">List Your Property</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
            <input
              type="text"
              name="property_name"
              value={propertyDetails.property_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={propertyDetails.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={propertyDetails.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input
                type="text"
                name="zip_code"
                value={propertyDetails.zip_code}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              name="state"
              value={propertyDetails.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="" disabled>
                Select a state
              </option>
              <option value="AL">Alabama (AL)</option>
              <option value="AK">Alaska (AK)</option>
              <option value="AZ">Arizona (AZ)</option>
              <option value="AR">Arkansas (AR)</option>
              <option value="CA">California (CA)</option>
              <option value="CO">Colorado (CO)</option>
              <option value="CT">Connecticut (CT)</option>
              <option value="DE">Delaware (DE)</option>
              <option value="FL">Florida (FL)</option>
              <option value="GA">Georgia (GA)</option>
              <option value="HI">Hawaii (HI)</option>
              <option value="ID">Idaho (ID)</option>
              <option value="IL">Illinois (IL)</option>
              <option value="IN">Indiana (IN)</option>
              <option value="IA">Iowa (IA)</option>
              <option value="KS">Kansas (KS)</option>
              <option value="KY">Kentucky (KY)</option>
              <option value="LA">Louisiana (LA)</option>
              <option value="ME">Maine (ME)</option>
              <option value="MD">Maryland (MD)</option>
              <option value="MA">Massachusetts (MA)</option>
              <option value="MI">Michigan (MI)</option>
              <option value="MN">Minnesota (MN)</option>
              <option value="MS">Mississippi (MS)</option>
              <option value="MO">Missouri (MO)</option>
              <option value="MT">Montana (MT)</option>
              <option value="NE">Nebraska (NE)</option>
              <option value="NV">Nevada (NV)</option>
              <option value="NH">New Hampshire (NH)</option>
              <option value="NJ">New Jersey (NJ)</option>
              <option value="NM">New Mexico (NM)</option>
              <option value="NY">New York (NY)</option>
              <option value="NC">North Carolina (NC)</option>
              <option value="ND">North Dakota (ND)</option>
              <option value="OH">Ohio (OH)</option>
              <option value="OK">Oklahoma (OK)</option>
              <option value="OR">Oregon (OR)</option>
              <option value="PA">Pennsylvania (PA)</option>
              <option value="RI">Rhode Island (RI)</option>
              <option value="SC">South Carolina (SC)</option>
              <option value="SD">South Dakota (SD)</option>
              <option value="TN">Tennessee (TN)</option>
              <option value="TX">Texas (TX)</option>
              <option value="UT">Utah (UT)</option>
              <option value="VT">Vermont (VT)</option>
              <option value="VA">Virginia (VA)</option>
              <option value="WA">Washington (WA)</option>
              <option value="WV">West Virginia (WV)</option>
              <option value="WI">Wisconsin (WI)</option>
              <option value="WY">Wyoming (WY)</option>
            </select>
          </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <input
                type="file"
                name="featured_image"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none"
              />
            </div>

          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
            <input
              type="file"
              name="gallery_image"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={propertyDetails.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <input
                type="number"
                name="bedroom"
                value={propertyDetails.bedroom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <input
                type="number"
                name="bathroom"
                value={propertyDetails.bathroom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={propertyDetails.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          {loading && (
            <div className="progress-bar bg-blue-500 rounded-full h-2 mt-3" style={{ width: `${progress}%` }}></div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 text-white font-medium rounded-lg shadow-md focus:ring-2 focus:ring-blue-400 ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Listing..." : "List Property"}
          </button>
        </form>
  
        {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center mt-3">{success}</p>}
  
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <p className="text-gray-800 mb-4">Oh wait! We need to verify your info.</p>
              <button
                onClick={handlePopupClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
              >
                Let's Go!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default ListProp;
