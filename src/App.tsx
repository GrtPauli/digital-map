// import MapWithPlaceAutocomplete from "./components/Map";
import { useQuery, gql } from "@apollo/client";
import Map from "./components/MapV3";
import { LoadingOutlined } from "@ant-design/icons";

const GET_LOCATIONS = gql`
  query {
    findSchools(query: {}) {
      _id
      title
      institutionType
      placeId
      address
      latitude
      longitude
    }
  }
`;

function App() {
  const { loading, data } = useQuery(GET_LOCATIONS);
  console.log(data);
  

  return (
    <div>
      {loading ? (
        <div className="flex flex-col flex-1 justify-center items-center h-screen">
          <LoadingOutlined className="text-5xl text-green-500" />
        </div>
      ) : (
        <Map locations={data?.findSchools}/>
      )}
    </div>
  );
}

export default App;
