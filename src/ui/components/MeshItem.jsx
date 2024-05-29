import React from "react";
import Typography from "@mui/material/Typography";
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import PropTypes from "prop-types";
import { basename } from "../utils";
import { useRef } from "react";

export function MeshItem({
  name,
  index,
  active = false,  
  onSetVisibility = () => { },
  onSetActive = () => { },
  onRemove = () => { },
  onMoveUp = () => {},
  onMoveDown = () => {},
  onShowHeader = () => {},
  onNextFrame = () => {},
  onPreviousFrame = () => {},
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = React.useState(true);
  const [contextMenu, setContextMenu] = React.useState(null);

  

  function toggleVisibility() {
    onSetVisibility(index, visible === true ? 0 : 1)
    setVisible(!visible)
  }

  function toggleActive() {
    onSetActive(name, !active)
  }

  function handleContextMenu(event) {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        :
        null,
    );
  }


  function handleClose() {
    setContextMenu(null);
  }

  function handleRemove() {
    handleClose()
    onRemove(index)
  }

  function handleMoveUp() {
    handleClose()
    onMoveUp(index)
  }

  function handleMoveDown() {
    handleClose()
    onMoveDown(index)
  }

  function handleShowHeader() {
    handleClose()
    onShowHeader(index)
  }

  function handleNextFrame() {
    handleClose()
    onNextFrame(index)
  }

  function handlePreviousFrame() {
    handleClose()
    onPreviousFrame(index)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: '100%',
        width: '100%',
        // background color is very light blue if active
        backgroundColor: active ? '#E6F0FF' : '#F8F8F8',
        ...props
      }}
      ref={ref}
    >
      <IconButton onClick={toggleVisibility}>
        {!visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
      <Tooltip title={name}>
        <Typography
          sx={{
            marginLeft: '8px',
            wordBreak: 'break-word', // wrap long names
            flexBasis: '75%' // allow for name wrapping for long names and alignment to the button
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
          fontSize: '0.5em',
          position: 'relative',
          color: '#666666',
          alignSelf: 'flex-end',
        }}
      >
        {/* TODO: support all niivue volume and mesh file types */}
        {name.includes('.nii') ? 'volume' : 'mesh'}
        {/* {maxFrame > 1 ? ` (${frame}/${maxFrame})` : ''} */}
      </Typography>
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
    </Box>
  )
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
}