import { useRef, useEffect } from "react";
import mapboxgl, { Map } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

function BaseMap() {
  const mapRef = useRef<Map | undefined>();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [mapRef, mapContainerRef]);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default BaseMap;
