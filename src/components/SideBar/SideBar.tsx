import { Dispatch, SetStateAction, useState } from "react";

import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import LayersIcon from "@mui/icons-material/Layers";
import Switch from "@mui/material/Switch";
import useMediaQuery from "@mui/material/useMediaQuery";

import "./sideBar.css";

interface Props {
  handleToggleEarthquakeLayer: Dispatch<SetStateAction<boolean>>;
  handleToggleOutdoorLayer: Dispatch<SetStateAction<boolean>>;
  isMapReady: boolean;
}

function SideBar({
  handleToggleEarthquakeLayer,
  handleToggleOutdoorLayer,
  isMapReady,
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const isSmallScreen = useMediaQuery("(max-width:600px");

  const LayerButton = isSmallScreen
    ? () => (
        <IconButton
          sx={{ bgcolor: "white", color: "black", borderRadius: "6px" }}
          onClick={() => setExpanded(!expanded)}
          size="small"
        >
          <LayersIcon />
        </IconButton>
      )
    : () => (
        <Button
          variant="contained"
          sx={{ bgcolor: "white", color: "black", p: "0, 2.9em" }}
          onClick={() => setExpanded(!expanded)}
          startIcon={<LayersIcon />}
        >
          Layers
        </Button>
      );

  return (
    <div className="sidebar">
      <LayerButton />
      <Collapse
        in={expanded}
        className="sidebar-contents"
        orientation="vertical"
        timeout="auto"
        unmountOnExit
      >
        <div>
          <FormGroup>
            <FormControlLabel
              control={<Switch disabled={!isMapReady} />}
              onChange={({ currentTarget: { checked } }) =>
                handleToggleEarthquakeLayer(checked)
              }
              label="Earthquakes"
            />
            <FormControlLabel
              control={<Switch disabled={!isMapReady} />}
              onChange={({ currentTarget: { checked } }) =>
                handleToggleOutdoorLayer(checked)
              }
              label="Outdoors"
            />
          </FormGroup>
        </div>
      </Collapse>
    </div>
  );
}

export default SideBar;
