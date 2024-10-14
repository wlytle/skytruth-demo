import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import mapboxgl, { GeoJSONFeature, Map } from "mapbox-gl";

import SideBar from "../../components/SideBar/SideBar";

import "mapbox-gl/dist/mapbox-gl.css";
import "./BaseMap.css";

function BaseMap() {
  const mapRef = useRef<Map | undefined>();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [showEarthquakeLayer, setShowEarthquakeLayer] =
    useState<boolean>(false);
  const [showOutdoorLayer, setShowOutdoorLayer] = useState<boolean>(false);

  const navControl = useMemo(() => new mapboxgl.NavigationControl(), []);

  const earthquakeUrl =
    "https://earthquake.usgs.gov/fdsnws/event/1/query?basicmagnitude=&minmagnitude=2.5&maxmagnitude=10&starttime=2022-01-01&endtime=2022-12-31&maxlatitude=40&minlongitude=-200&maxlongitude=0&minlatitude=30&format=geojson";
  const outdoorsUrl = `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${import.meta.env.VITE_THUNDERFORREST_KEY}`;
  const eqLayer = "earthquakes-layer";
  const outdoorsLayer = "outdoors-layer";

  const isMapDomReady = useCallback(() => {
    /**
     * isStyleLoaded() should only be needed here for local dev as a check for
     * hot reloads, where the state may be out of sync with the DOM
     */
    return !!(
      mapContainerRef.current &&
      mapRef.current &&
      isMapReady &&
      mapRef.current.isStyleLoaded()
    );
  }, [mapContainerRef, mapRef, isMapReady]);

  useEffect(() => {
    const setReady = () => setIsMapReady(true);
    // Load the initial map
    if (mapContainerRef.current) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-v9",
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
    if (isMapDomReady()) {
      // Once the map is ready add the sources for the layer options
      mapRef.current?.addSource("outdoors", {
        type: "raster",
        tiles: [outdoorsUrl],
        attribution:
          "<a href='https://www.thunderforest.com/'>© Thunderforest</a>",
      });
      mapRef.current?.addSource("earthquakes", {
        type: "geojson",
        data: earthquakeUrl,
        attribution:
          "<a href='https://earthquake.usgs.gov/fdsnws/event/1/'>USGS</a>",
      });
    }

    // Add the navigation control
    mapRef.current?.addControl(navControl);
  }, [
    mapRef,
    isMapReady,
    isMapDomReady,
    navControl,
    outdoorsUrl,
    earthquakeUrl,
  ]);

  useEffect(() => {
    if (!isMapDomReady()) {
      return;
    }

    if (showEarthquakeLayer) {
      mapRef.current?.addLayer({
        id: eqLayer,
        type: "circle",
        source: "earthquakes",
        paint: {
          "circle-radius": 4,
          "circle-stroke-width": 2,
          "circle-color": "red",
          "circle-stroke-color": "white",
        },
      });

      mapRef.current?.on("click", eqLayer, (event) => {
        const innerHTML = !event?.features
          ? "<p>No data available for the this event :( </p>"
          : makePopup(event.features[0]);

        // Create a popup and display it
        new mapboxgl.Popup()
          .setLngLat(event.lngLat)
          .setHTML(innerHTML)
          //isMapDomReady ensures that mapRef.current exists, so this just hides a handled potential error
          //@ts-ignore next-line
          .addTo(mapRef.current);
      });
    } else {
      mapRef.current?.removeLayer(eqLayer);
    }
  }, [showEarthquakeLayer, isMapDomReady]);

  useEffect(() => {
    if (!isMapDomReady()) {
      return;
    }

    if (showOutdoorLayer) {
      mapRef.current?.addLayer({
        id: outdoorsLayer,
        type: "raster",
        source: "outdoors",
      });
      // Ensure the earthquake markes don't get covered by the outdoor layer
      if (
        mapRef.current &&
        mapRef.current
          .getStyle()
          ?.layers.filter((layer) => layer.id === eqLayer)
      ) {
        mapRef.current.moveLayer(outdoorsLayer, eqLayer);
      }
    } else {
      mapRef.current?.removeLayer(outdoorsLayer);
    }
  }, [showOutdoorLayer, isMapDomReady]);

  const makePopup = (feature: GeoJSONFeature) => {
    // This should be replaced with a custom pop over component that enables easier accesebility improvements
    const date = new Date(feature?.properties?.time);
    const magnitude = feature?.properties?.mag;
    const place = feature?.properties?.place;

    return `<div class=eq-popup role=note>
    <h3 class=pop-text>${place}</h3>
    <span class=pop-text>Magnitude: ${magnitude},</span>
    <br />
    <span class=pop-text>Time: ${date}</span>
    </div>`;
  };

  return (
    <>
      <SideBar
        handleToggleEarthquakeLayer={setShowEarthquakeLayer}
        handleToggleOutdoorLayer={setShowOutdoorLayer}
        isMapReady={isMapReady}
      />
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default BaseMap;
