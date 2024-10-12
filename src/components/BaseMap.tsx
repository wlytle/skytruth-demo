import { useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSON, Map } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./BaseMap.css";

function BaseMap() {
  const mapRef = useRef<Map | undefined>();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isMapReady, setIsMapReady] = useState<boolean>(false)
  const [earthquakeLayer, setEarthquakeLayer] = useState<GeoJSON | null>(null);
  const [showEarthquakes, setShowEarthquakes] = useState<boolean>(false);

  const earthquakeUrl =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?basicmagnitude=&minmagnitude=2.5&maxmagnitude=10&starttime=2022-01-01&endtime=2022-12-31&maxlatitude=40&minlongitude=-200&maxlongitude=0&minlatitude=30&format=geojson";
  
    const outdoorsUrl = "https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=fbb8fa64d2014e5da62dd21c5d665dd1";

  useEffect(() => {
    const setReady = () => setIsMapReady(true)    
    // Load the initial map
    if (mapContainerRef.current) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [-101, 38],
        zoom: 4,
      });
      // Listen for map laod to complete 
      mapRef.current.on("load",  setReady)
    }


    return () => {
      mapRef.current?.off("ready",  setReady)
      mapRef.current?.remove();
    };
  }, [mapRef, mapContainerRef]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current || !isMapReady) {
      console.log("Shiort circuit", isMapReady);
      return;
    }

    if (showEarthquakes && mapRef.current) {
      mapRef.current.addLayer({
      id: "earthquakes-layer",
      type: "circle",
      source: "earthquakes",
      paint: {
        "circle-radius": 4,
        "circle-stroke-width": 2,
        "circle-color": "red",
        "circle-stroke-color": "white",
      },
    });

    mapRef.current.on('click', 'earthquakes-layer', (e) => {
      // Access the properties of the clicked marker
      const feature = e?.features[0];
      const magnitude = feature?.properties?.mag
      

      const makePopup = (feature) => {
        const date = new Date(feature?.properties.time)
        const magnitude = feature?.properties?.mag;
        const place = feature?.properties?.place;
        console.log("event", feature, place, magnitude, date);
        return (
          `<div class=eq-popup>
          <h3 class=pop-text>${place}</h3>
          <span class=pop-text>Magnitude: ${magnitude}</span>
          <span class=pop-text>Time: ${date}</span>
          </div>`
        )
      } 
    
      // Create a popup and display it
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(makePopup(feature))
        .addTo(mapRef.current);
    });
  } else {
    mapRef.current?.removeLayer("earthquakes-layer")
  }
  }, [showEarthquakes, earthquakeLayer]);

  const loadEarthquakeSource = async () => {
    const response = await fetch(earthquakeUrl);
    const earthquakeGeoJson = await response.json();
    setEarthquakeLayer(earthquakeGeoJson);
    mapRef.current?.addSource("earthquakes", {
      type: "geojson",
      data: earthquakeGeoJson,
    });
  };

  const handleToggleEarthquakeLayer = async () => {
    console.log(`Turn EarthQuake features ${showEarthquakes ? "on" : "off"}`);
    // Fix this so the action reflects the users choices
    console.log("EQL", earthquakeLayer);
    if (!showEarthquakes && earthquakeLayer === null) {
      await loadEarthquakeSource();
    }
    setShowEarthquakes(!showEarthquakes);
  };

  (async() => await mapRef.current?.once('idle'))()
  return (
    <>
      <div className="sidebar">
        <button onClick={handleToggleEarthquakeLayer} disabled={!isMapReady}>
          Click me for new layers!
        </button>
      </div>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default BaseMap;
