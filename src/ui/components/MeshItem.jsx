import React from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import { basename } from "../utils";
import { useRef, useState } from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";

export function MeshItem({
  name,
  index,
  active = false,
  getLayerList = () => {},
  onSetVisibility = () => {},
  onSetActive = () => {},
  onRemove = () => {},
  onLayerDropped = (index, file) => {},
  setLayerVisibility = () => {},
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [files, setFiles] = useState([]);  
  const [layers, setLayers] = useState([]);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  function toggleVisibility() {
    onSetVisibility(index, visible === true ? 0 : 1);
    setVisible(!visible);
  }

  function toggleActive() {
    onSetActive(name, !active);
  }

  function handleContextMenu(event) {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  }

  function handleClose() {
    setContextMenu(null);
  }

  function handleRemove() {
    handleClose();
    onRemove(index);
  }

  function toggleLayerVisibility(layerIndex) {
    setLayerVisibility(index, layerIndex);
    const isVisible = layers[layerIndex].visible;
    layers[layerIndex].visible = !isVisible;
    // slice is necessary to trigger re-render of child controls 
    // https://stackoverflow.com/questions/25937369/react-component-not-re-rendering-on-state-change
    setLayers(layers.slice());
  }

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      onLayerDropped(index, droppedFiles[0]);
      layers.push({name: droppedFiles[0].path.replace(/^.*[\\/]/, ''), url: droppedFiles[0].path, visible: true});
      setOpen(true);
    }

    console.log("droppedFiles", droppedFiles);
  };



  return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minWidth: "100%",
          width: "100%",
          // background color is very light blue if active
          backgroundColor: active ? "#E6F0FF" : "#F8F8F8",
          ...props,
        }}
        ref={ref}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        
      >
        <List>
        <ListItemButton onClick={handleClick}>
        <IconButton onClick={toggleVisibility}>
          {!visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
        <Tooltip title={name}>
          <Typography
            sx={{
              marginLeft: "8px",
              wordBreak: "break-word", // wrap long names
              flexBasis: "75%", // allow for name wrapping for long names and alignment to the button
            }}
            onClick={toggleActive}
            // onMouseUp={toggleActive}
            onContextMenu={handleContextMenu}
          >
            {basename(name)}
          </Typography>
        </Tooltip>
        {/* very small Typography to indicate if mesh or volume */}
        {/* "mesh" or "volume" will be placed in the bottom right corner */}
        <Typography
          sx={{
            fontSize: "0.5em",
            position: "relative",
            color: "#666666",
            alignSelf: "flex-end",
          }}
        >
          {/* TODO: support all niivue volume and mesh file types */}
          {name.includes(".nii") ? "volume" : "mesh"}
          {/* {maxFrame > 1 ? ` (${frame}/${maxFrame})` : ''} */}
        </Typography>
        {open ? <ExpandLess align="right" /> : <ExpandMore align="right"/>}
        </ListItemButton>
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleRemove}>Remove</MenuItem>
        </Menu>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {layers.map((item, layerIndex) => 
            <ListItemButton sx={{ pl: 4 }} key={item.url}>
              <IconButton onClick={() => toggleLayerVisibility(layerIndex)}>
                {!layers[layerIndex].visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
              <ListItemText primary={item.name} />
            </ListItemButton>)
            }
          </List>
        </Collapse>
        </List>
      </Box>
  );
}

MeshItem.propTypes = {
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  active: PropTypes.bool,
  onSetVisibility: PropTypes.func,
  onSetActive: PropTypes.func,
  onRemove: PropTypes.func,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  onShowHeader: PropTypes.func,
  onNextFrame: PropTypes.func,
  onPreviousFrame: PropTypes.func,
  frame: PropTypes.number,
  maxFrame: PropTypes.number,
  id: PropTypes.any,
  moveImage: PropTypes.func,
};
