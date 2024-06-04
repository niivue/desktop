import React, { useState, useEffect } from "react";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";

export const ColorPickerTile = ({ color, onChange }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color) => {
    const rgbaArray = [
      color.rgb.r / 255,
      color.rgb.g / 255,
      color.rgb.b / 255,
      color.rgb.a
    ];
    setCurrentColor(rgbaArray);
    onChange(rgbaArray);
  };

  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${currentColor[0] * 255}, ${currentColor[1] * 255}, ${
          currentColor[2] * 255
        }, ${currentColor[3]})`
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer"
      },
      popover: {
        position: "absolute",
        zIndex: "2"
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px"
      }
    }
  });

  return (
    <div>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </div>
      {displayColorPicker ? (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <SketchPicker color={{ rgb: { ...currentColor, r: currentColor[0] * 255, g: currentColor[1] * 255, b: currentColor[2] * 255 } }} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};
