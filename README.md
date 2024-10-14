# SkyTruth coding exercise

## About
This React application serves as the written, code-based, portion of the SkyTruth technical screen. It includes a sateltite image base map with options to overlay [earthquake locations from USGS data](https://earthquake.usgs.gov/fdsnws/event/1/) and an [outdoors based vector map form Thunder Forrest](https://www.thunderforest.com/). Clicking on the earthquake markers opens a pop up with relevant metadata about the clicked event.

## Developer Notes
This Project was built using node version `21.5.0` and React `18.3.1`
To use the application follow these steps:
1. Clone (or fork) the repo `git clone git@github.com:wlytle/skytruth-demo.git`
2. Install depenendencies. From the root of the repo run `npm install`
3. Start the development server `npm run dev`
4. Navigate to http://localhost:5173/

NOTE: Vite uses `Hot Module Replacement (HMR)` to handle hot reloading when developing. The way this interacts with React means that client state is persisted if a developer makes code changes and then saves. This app uses state flags to indicate when the map is mounted to the DOM and loaded, becuase the state does not reset but the map does reload during a hot reload, it is highly likely that you will need to refresh the browser window to accurately see changes to the application. 
