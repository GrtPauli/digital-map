import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Carousel, ConfigProvider, Image, Rate, Tabs } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // Replace with your actual API key

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: 8.847976057577018,
  lng: 7.877444171327348,
};

interface ILocation {
  address: string;
  institutionType: string;
  latitude: string;
  longitude: string;
  placeId: string;
  title: string;
  _id: string;
}

function Map({ locations }: { locations: ILocation[] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [placeId, setPlaceId] = useState<string>();
  // const [placePhotos, setPlacePhotos] = useState<string[]>([]);
  const [markerPosition, setMarkerPosition] = useState<any>(null); // Marker state
  const [placeDetails, setPlaceDetails] = useState<any>();
  const [current, setCurrent] = useState<"overview" | "review">("overview");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<ILocation | null>(null); // State to store place details
  const [clickedLocation, setClickedLocation] = useState<any>(null);

  // Define the bounds for Keffi, Nasarawa
  const keffiBounds = {
    north: 8.9125, // Approximate northern boundary
    south: 8.8225, // Approximate southern boundary
    west: 7.835, // Approximate western boundary
    east: 7.905, // Approximate eastern boundary
  };

  // Map options
  const options = {
    // restriction: {
    //   latLngBounds: keffiBounds, // Restrict to this bounding box (Keffi)
    //   strictBounds: false, // Set to true to strictly enforce bounds
    // },
    styles: [
        {
          featureType: "poi", // Point of interest (POI)
          stylers: [{ visibility: "off" }] // Hide all POIs
        },
        {
          featureType: "transit", // Transit points (e.g., bus stops)
          stylers: [{ visibility: "off" }] // Hide all transit points
        }
    ],
    minZoom: 13, // Minimum zoom level for Keffi
    maxZoom: 17, // Maximum zoom level for Keffi
  };

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.place_id) {
        setPlaceId(place.place_id);
        if (inputRef.current) {
          inputRef.current.value = ""; // Clear the input field
        }
      } else {
        console.log("No details available for the selected place");
      }
    } else {
      console.log("Autocomplete is not loaded yet");
    }
  };

  const fetchPlaceDetails = async (placeId: string) => {
    if (map) {
      setLoading(true);
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        placeId: placeId,
        fields: [
          "name",
          "formatted_address",
          "geometry.location",
          "photos",
          "address_component",
          "adr_address",
          "business_status",
          "formatted_phone_number",
          "icon",
          "international_phone_number",
          "opening_hours",
          "plus_code",
          "rating",
          "reviews",
          "types",
          "user_ratings_total",
          "website",
        ],
      };

      service.getDetails(request, (place: any) => {
        if (place) {
          fetchPlacePhotos(place);
          setLoading(false); // Fetch photos if place details are retrieved
        } else {
          setLoading(false);
          console.error("Error fetching details:", status);
        }
      });
    }
  };

  function getCityStateCountry(addressComponents: any) {
    let city = "";
    let state = "";
    let country = "";

    addressComponents.forEach((component: any) => {
      if (component.types.includes("locality")) {
        city = component.long_name;
      }
      if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name; // or use component.short_name for abbreviation
      }
      if (component.types.includes("country")) {
        country = component.long_name; // or use component.short_name for country code (e.g., "US", "NG")
      }
    });

    return { city, state, country };
  }

  const fetchPlacePhotos = (place: any) => {
    const photoUrls = place?.photos?.map((photo: any) =>
      photo?.getUrl({ maxHeight: 400 })
    );
    setPlaceDetails({
      ...place,
      ...getCityStateCountry(place?.address_components),
      photos: photoUrls || [],
    });
  };

    //   const handleMapClick = async (event: any) => {
    //     setPlaceId(event?.placeId);
    //     setMarkerPosition(event.latLng);
    //   };

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails(placeId);
    }
  }, [placeId]);

    // Define a smaller custom marker icon
    // const customIcon = {
    //     url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png", // Default Google Maps marker icon (you can replace with your own custom icon URL)
    //     scaledSize: new window.google.maps.Size(20, 32), // Reduced size (width: 20px, height: 32px)
    //   };

  return (
    <div className="flex">
      <div className="w-[60%]">
        <LoadScript
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={(mapInstance) => {
              setMap(mapInstance);
              setPlaceId("ChIJ-9QZWvnjURARxBElh4Wj6gw");
              setTimeout(() => {
                setMarkerPosition(center);
              }, 2000);
            }}
            // onClick={handleMapClick}
            options={options}
          >
            <Autocomplete
              options={{
                bounds: keffiBounds,
                strictBounds: true, // Restrict results to the bounds
                componentRestrictions: { country: "ng" }, // Restrict to Nigeria
              }}
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
            >
              <div className="w-full relative z-[999999] flex justify-center pt-12">
                <div className="relative max-w-[400px] w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter a location"
                    className="border-[1px] text-sm rounded-full !pl-14 px-3 py-3 w-full outline-none shadow-md focus:border-green-500"
                    style={{
                      // boxSizing: "border-box",
                      // border: "1px solid transparent",
                      // width: "240px",
                      // height: "32px",
                      // padding: "0 12px",
                      // borderRadius: "3px",
                      // boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                      // fontSize: "14px",
                      outline: "none",
                      textOverflow: "ellipses",
                      // backgroundColor: "red",
                      zIndex: 99999,
                      position: "relative",
                    }}
                  />

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#888888"
                    className="size-6 absolute top-3 left-5 z-[99999]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
              </div>
            </Autocomplete>

            {markerPosition && <Marker position={markerPosition} />}

            {locations.map((location) => (
              <Marker
                key={location._id}
                position={{
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                }}
                // icon={customIcon}
                title={location.title}
                // label={{
                //     text: location.title, // Location name
                //     fontSize: "12px", // Adjust font size
                //     color: "#000000", // Text color
                //     className: "map-label", // Optional CSS class for styling
                // }}
                onClick={(e) => {
                    setPlaceId(location.placeId)
                    setSelectedPlace(location)
                    setClickedLocation(e.latLng); // Store the clicked location
                }} // On marker click, fetch location info
              />
            ))}

            {selectedPlace && clickedLocation && (
              <InfoWindow
                position={clickedLocation}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div>
                  <h3 className="font-bold">{selectedPlace?.title}</h3>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="w-[40%] bg-white p-3 h-screen overflow-auto">
        {loading ? (
          <div className="flex flex-col flex-1 justify-center items-center h-full">
            <LoadingOutlined className="text-5xl text-green-500" />
          </div>
        ) : (
          <div>
            {placeDetails && (
              <div className="mb-5">
                <div className="mb-3 bg-gradient-to-r from-[#22c55e] to-[#fff]  text-white rounded-full px-5 py-2 gap-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-semibold">Location</p>
                </div>

                <p className="font-semibold text-2xl mb-1">
                  {placeDetails?.name}
                </p>
                {placeDetails?.rating && (
                  <div className="flex items-center gap-2">
                    <Rate value={placeDetails?.rating} />
                  </div>
                )}
              </div>
            )}

            <div id="image-container">
              {placeDetails?.photos?.length > 0 ? (
                <Carousel arrows pauseOnHover={false} autoplay>
                  {placeDetails?.photos?.map((url: any, index: any) => (
                    <div className="">
                      <Image
                        rootClassName="!z-[99999999] relative"
                        height={"256px"}
                        width={"100%"}
                        className="object-cover object-center rounded-2xl"
                        key={index}
                        src={url}
                        alt={`Place Photo ${index + 1}`}
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <p>No photos available for this place.</p>
              )}
            </div>

            {placeDetails && (
              <div>
                <ConfigProvider
                  theme={{ token: { fontFamily: "", colorPrimary: "#22c55e" } }}
                >
                  <Tabs
                    items={[
                      { key: "overview", label: "Overview" },
                      { key: "review", label: "Reviews" },
                    ]}
                    onChange={(key: any) => setCurrent(key)}
                  />
                </ConfigProvider>

                {current == "overview" && (
                  <div>
                    <div className="border-b pb-5 border-gray-300">
                      <p className="font-bold mb-3">Address</p>
                      {/* <div className="flex gap-2 text-sm text-gray-500 mb-1">
                        <p>{placeDetails?.city}</p>
                        <p>-</p>
                        <p>{placeDetails?.state}</p>
                      </div> */}
                      <p className="font-semibonld mb-2 text-sm">
                        {placeDetails?.country}
                      </p>
                      <p className="text-sm">
                        {placeDetails?.formatted_address}
                      </p>
                    </div>

                    <div className="mt-5 border-b pb-5 border-gray-300">
                      <p className="font-bold mb-3">Opening Hours</p>
                      {placeDetails?.opening_hours?.weekday_text ? (
                        <div className="flex flex-col gap-2 text-sm">
                          {placeDetails?.opening_hours?.weekday_text?.map(
                            (item: any, i: any) => (
                              <p key={i}>{item}</p>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-sm">No Data</div>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="font-bold mb-3">Other Info</p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center text-sm gap-2">
                          <p className="font-semibold">Contact Number : </p>
                          {placeDetails?.international_phone_number ||
                            "No Data"}
                        </div>
                        <div className="flex items-center text-sm gap-2">
                          <p className="font-semibold">Total User Ratings : </p>
                          {placeDetails?.user_ratings_total || "No Data"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {current == "review" && (
                  <div>
                    {placeDetails?.reviews?.length > 0 ? (
                      <div className="flex flex-col gap-5">
                        {placeDetails?.reviews?.map((item: any, i: any) => (
                          <div
                            key={i}
                            className="border-b pb-5 border-gray-300"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item?.profile_photo_url}
                                className="w-[40px] h-[40px]"
                              />
                              <div>
                                <p className="text-sm">{item?.author_name}</p>
                                <Rate
                                  className="!text-sm"
                                  value={item?.rating}
                                />
                              </div>
                            </div>

                            <p className="text-sm leading-loose mt-3">
                              {item?.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex w-full items-center justify-center text-sm pt-10">
                        No Reviews
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
