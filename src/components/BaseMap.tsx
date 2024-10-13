import { useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSON, Map } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./BaseMap.css";

function BaseMap() {
  const mapRef = useRef<Map | undefined>();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [showEarthquakes, setShowEarthquakes] = useState<boolean>(false);
  const [showOutdoorLayer, setShowOutdoorLayer] = useState<boolean>(false);

  const earthquakeUrl =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?basicmagnitude=&minmagnitude=2.5&maxmagnitude=10&starttime=2022-01-01&endtime=2022-12-31&maxlatitude=40&minlongitude=-200&maxlongitude=0&minlatitude=30&format=geojson";

  const outdoorsUrl = `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDERFORREST_KEY}`;

  const isMapDomReady = () => {
    /**
     * isStyleLoaded() should only be needed here for local dev as a check for 
     * hot reloads, where the state may be out of sync with the DOM
     */ 
    return !!(mapContainerRef.current && mapRef.current && isMapReady && mapRef.current.isStyleLoaded()) 
  }

  useEffect(() => {
    const setReady = () => setIsMapReady(true);
    // Load the initial map
    if (mapContainerRef.current) {
      console.log("implement?");
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [-101, 38],
        zoom: 4,
      });
      // Listen for map load to complete
      mapRef.current.on("load", setReady);
    }

    return () => {
      mapRef.current?.off("ready", setReady);
      mapRef.current?.remove();
    };
  }, [mapRef, mapContainerRef]);

  useEffect(() => {
    console.log("Checking", mapRef.current.isStyleLoaded());
    if (isMapDomReady()) {
      // Once the map is ready add the sources for the layer options
      console.log("Am I running??");
      mapRef.current?.addSource("outdoors", {
        type: "raster",
        tiles: [outdoorsUrl],
      });
      mapRef.current?.addSource("earthquakes", {
        type: "geojson",
        data: earthquakeUrl,
      });
      
    }
    
  }, [mapRef, isMapReady]);

  useEffect(() => {
    if (!isMapDomReady()) {
      return;
    }

    if (showEarthquakes) {
      mapRef.current?.addLayer({
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

      mapRef.current?.on("click", "earthquakes-layer", (e) => {
        // Access the properties of the clicked marker
        const feature = e?.features[0];

        const makePopup = (feature) => {
          const date = new Date(feature?.properties.time);
          const magnitude = feature?.properties?.mag;
          const place = feature?.properties?.place;
          console.log("event", feature, place, magnitude, date);
          return `<div class=eq-popup>
          <h3 class=pop-text>${place}</h3>
          <span class=pop-text>Magnitude: ${magnitude}</span>
          <span class=pop-text>Time: ${date}</span>
          </div>`;
        };

        // Create a popup and display it
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(makePopup(feature))
          .addTo(mapRef.current);
      });
    } else {
      mapRef.current?.removeLayer("earthquakes-layer");
    }
  }, [showEarthquakes]);

  useEffect(() => {
    if (!isMapDomReady()) {
      return;
    }

    if (showOutdoorLayer) {
      mapRef.current?.addLayer({
        id: "outdoors-layer",
        type: "raster",
        source: "outdoors",
      });

      // mapRef.current?.setPaintProperty(
      //   "outdoors-layer",
      //   'raster-opacity',
      //   100
      // )
    } else {
      mapRef.current?.removeLayer('outdoors-layer')
    }
  }, [showOutdoorLayer])


  const handleToggleEarthquakeLayer = async () => {
    setShowEarthquakes(!showEarthquakes);
  };

  const handleToggleOutdoorLayer = () => {
    // Make this reflect acutal user chices not just flip state
    setShowOutdoorLayer(!showOutdoorLayer)
  };

  return (
    <>
      <div className="sidebar">
        <button onClick={handleToggleEarthquakeLayer} disabled={!isMapReady}>
          Click me for Earthquake layers!
        </button>
        <button onClick={handleToggleOutdoorLayer} disabled={!isMapReady}>
          Click me for Outdoors layers!
        </button>
      </div>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default BaseMap;
