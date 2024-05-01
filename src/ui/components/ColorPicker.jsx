import React, { useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { SketchPicker } from 'react-color'

export const ColorPicker = ({isOpen = false, pickedColor = "#ff0000ff", isFullScreen = true, onChange, onClose}) => {
    // const [color, setColor] = useState(pickedColor);
    // const handleChange = color => setColor(color);
    // const [open, setOpen] = React.useState(isOpen);
    // const theme = useTheme();
    // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    // const handleChange = ({ hex }) => console.log(hex)
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // return (<div className="App">
    //     <SketchPicker color={color} onChangeComplete={handleChange} />
    // </div>);
    // return (
    //     <React.Fragment>
    //         <Dialog
    //             fullScreen={fullScreen}
    //             open={open}
    //             onClose={handleClose}
    //             aria-labelledby="responsive-dialog-title"
    //         >
    //             <DialogTitle id="responsive-dialog-title">
    //                 {"Use Google's location service?"}
    //             </DialogTitle>
    //             <DialogContent>
    //                 <SketchPicker color={color} onChangeComplete={handleChange} />
    //             </DialogContent>
    //             <DialogActions>
    //                 <Button autoFocus onClick={handleClose}>
    //                     Cancel
    //                 </Button>
    //                 <Button onClick={handleClose} autoFocus>
    //                     Apply
    //                 </Button>
    //             </DialogActions>
    //         </Dialog>
    //     </React.Fragment>
    // );

    return ( <React.Fragment>
        <Dialog
                fullScreen={isFullScreen}
                open={isOpen}
                onClose={onClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    {"Pick a color"}
                </DialogTitle>
                <DialogContent>
                    <SketchPicker color={pickedColor} onChangeComplete={onChange} />
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose} autoFocus>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
      </React.Fragment>);
}