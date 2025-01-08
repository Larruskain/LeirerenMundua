import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import './CountriesPage.css';

function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalData, setModalData] = useState(null); // Manages modal visibility and data
  const navigate = useNavigate(); // Initialize the navigation hook

  // Load countries from localStorage or fetch from countries.json
  useEffect(() => {
    console.log('Loading countries from localStorage...');
    const savedCountries = localStorage.getItem('countries');

    if (savedCountries) {
      try {
        const parsedCountries = JSON.parse(savedCountries);
        setCountries(parsedCountries);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        localStorage.removeItem('countries'); // Clear invalid data
      }
    } else {
      fetch('/countries.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const countriesWithPhotos = data.map((country) => ({
            ...country,
            photos: country.photos || [], // Default to empty array if not present
          }));
          setCountries(countriesWithPhotos);
          localStorage.setItem('countries', JSON.stringify(countriesWithPhotos));
        })
        .catch((error) => console.error('Error fetching countries:', error));
    }
  }, []);

  // Update localStorage whenever countries state changes
  useEffect(() => {
    if (countries.length > 0) {
      localStorage.setItem('countries', JSON.stringify(countries));
    }
  }, [countries]);

  // Handle search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle status change for a specific country
  const handleStatusChange = (countryName, newState) => {
    const updatedCountries = countries.map((country) => {
      if (country.name === countryName) {
        return { ...country, status: newState };
      }
      return country;
    });
    setCountries(updatedCountries); // Triggers the useEffect to update localStorage
  };

  // Handle date change for a specific country
  const handleDateChange = (countryName, newDate) => {
    const updatedCountries = countries.map((country) => {
      if (country.name === countryName) {
        return { ...country, date: newDate };
      }
      return country;
    });
    setCountries(updatedCountries);
  };

  // Handle adding photos for visited countries
  const handleAddPhoto = (countryName, newPhotoFile) => {
    if (!(newPhotoFile instanceof File)) {
      console.error("Invalid file passed to handleAddPhoto:", newPhotoFile);
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        // Resize the image
        const MAX_WIDTH = 800; // Set a max width for compression
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
  
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        // Convert the resized image to Base64
        const compressedImage = canvas.toDataURL("image/jpeg", 0.5); // Adjust compression quality (0.7 = 70%)
  
        // Save compressed image in state instead of directly in localStorage
        const updatedCountries = countries.map((country) => {
          if (country.name === countryName) {
            const updatedPhotos = [...country.photos, compressedImage].slice(
              0,
              5
            ); // Ensure max 5 photos
            return { ...country, photos: updatedPhotos };
          }
          return country;
        });
        setCountries(updatedCountries);
      };
    };
  
    reader.readAsDataURL(newPhotoFile); // Properly pass the File object here
  };
  
  // Open modal to view photos
  const openModal = (country) => {
    setModalData(country);
  };

  // Close the modal
  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="CountriesPage">
      <h1>Herrialdeen Lista</h1>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#9a2e3b",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Itzuli hasierara
      </button>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a country..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <ul className="countries-list">
        {countries
          .filter((country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((country) => (
            <li key={country.name} className="country-item">
              <div className="country-info">
                <span className="country-name">{country.name}</span>
              </div>

              <div className="actions">
                {/* Dropdown to select status */}
                <select
                  value={country.status}
                  onChange={(e) =>
                    handleStatusChange(country.name, e.target.value)
                  }
                  className="status-dropdown"
                >
                  <option value="visited">Visited</option>
                  <option value="planned">Planned</option>
                  <option value="not visited">Not Visited</option>
                </select>
              </div>

              {/* Show date input if status is "visited" or "planned" */}
              {(country.status === "visited" || country.status === "planned") && (
                <ul className="sub-info">
                  <li>
                    <label>
                      Date:
                      <input
                        type="date"
                        value={country.date || ""}
                        onChange={(e) =>
                          handleDateChange(country.name, e.target.value)
                        }
                        className="date-input"
                      />
                    </label>
                  </li>
                </ul>
              )}

              {/* Photo upload for visited countries */}
              {country.status === "visited" && (
                <div className="photos-section">
                  <label>Photos (max 3):</label>
                  <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (file) {
      handleAddPhoto(country.name, file);
    }
  }}
  className="photo-upload"
/>
                  {/* Link to view photos */}
                  {country.photos.length > 0 && (
                    <button
                      className="view-photos-button"
                      onClick={() => openModal(country)}
                    >
                      View Photos
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
      </ul>

      {/* Modal for viewing photos */}
      {modalData && (
        <div className="photo-modal">
          <div className="modal-content">
            <h2>{modalData.name}</h2>
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
            <div className="photo-gallery">
              {modalData.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="photo-thumbnail"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountriesPage;
