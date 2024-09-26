import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface Place {
  name: string;
  address: string;
  rating?: number;
  photos?: string;
}

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 8.8464, // Center the map over a location in Keffi
  lng: 7.8736,
};

const MyMapComponent: React.FC = () => {
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLng | null>(null); // Marker state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null); // Info state
  const [map, setMap] = useState<google.maps.Map | null>(null); // Map instance
  const [address, setAddress] = useState<string>(''); // Address state

  // Function to handle click on the map and add marker
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    console.log(event);
    
    if (event.latLng) {
      const latLng = event.latLng;
      setMarkerPosition(latLng); // Set marker position on map click
      reverseGeocode(latLng); // Reverse geocode the clicked location to get address
    }
  };

  // Reverse geocoding to convert latLng into a human-readable address
  const reverseGeocode = (latLng: google.maps.LatLng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        setAddress(results[0].formatted_address); // Update address state
        getPlaceDetails(latLng); // Get detailed info of the place
      } else {
        setAddress('No address found');
        setSelectedPlace({
          name: 'Unknown Place',
          address: 'No address found',
        });
      }
    });
  };

  // Function to load place details using Google Places API
  const getPlaceDetails = (latLng: google.maps.LatLng) => {
    if (!map) return; // Ensure map instance is available

    const service = new window.google.maps.places.PlacesService(map);

    const request: google.maps.places.PlaceSearchRequest = {
      location: latLng,
      radius: 10, // Search within a small radius around the clicked location
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && (results as any).length > 0) {
        const place = (results as any)[0];
        const placeRequest: google.maps.places.PlaceDetailsRequest = {
          placeId: place.place_id
        };

        // Fetch full place details using place_id
        service.getDetails(placeRequest, (placeDetails, placeStatus) => {
          if (placeStatus === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
            setSelectedPlace({
              name: placeDetails.name || 'Unknown Place',
              address: placeDetails.formatted_address || 'No address available',
              rating: placeDetails.rating,
              photos: placeDetails.photos ? placeDetails.photos[0].getUrl({ maxWidth: 200 }) : undefined,
            });
          } else {
            setSelectedPlace({
              name: 'Unknown Place',
              address: address || 'No details available',
            });
          }
        });
      } else {
        // Fallback to reverse-geocoded address if no nearby place is found
        setSelectedPlace({
          name: 'Unknown Place',
          address: address || 'No details available',
        });
      }
    });
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Google Map */}
      <LoadScript googleMapsApiKey="AIzaSyAsaOKt24vvQ93WWJqOqIQalC5q3Mw-Ej8" libraries={['places']}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          
          onLoad={(mapInstance) => setMap(mapInstance)} // Capture the map instance
          onClick={handleMapClick} // Listen for map clicks to dynamically add marker
        >
          {/* Show marker dynamically where the user clicks */}
          {markerPosition && (
            <Marker
              position={markerPosition}
              onClick={() => setSelectedPlace(selectedPlace)} // Clicking the marker opens the info window
            />
          )}

          {/* Show InfoWindow if a place is selected */}
          {selectedPlace && markerPosition && (
            <InfoWindow position={markerPosition} onCloseClick={() => setSelectedPlace(null)}>
              <div>
                <h3>{selectedPlace.name}</h3>
                <p>Address: {selectedPlace.address}</p>
                {selectedPlace.rating && <p>Rating: {selectedPlace.rating}</p>}
                {selectedPlace.photos && <img src={selectedPlace.photos} alt={selectedPlace.name} />}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Sidebar for displaying selected place info */}
      {selectedPlace && (
        <div style={{ padding: '20px', width: '250px', backgroundColor: '#f8f9fa', height: '500px' }}>
          <h3>{selectedPlace.name}</h3>
          <p>Address: {selectedPlace.address}</p>
          {selectedPlace.rating && <p>Rating: {selectedPlace.rating}</p>}
          {selectedPlace.photos && <img src={selectedPlace.photos} alt={selectedPlace.name} style={{ width: '100%' }} />}
        </div>
      )}
    </div>
  );
};

export default MyMapComponent;
