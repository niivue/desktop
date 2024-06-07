import React, { useState, useEffect } from 'react';
import { TextField, Typography, Container, Box, Paper, Switch, FormControlLabel, InputLabel, FormControl } from '@mui/material';
import { ColorPickerTile } from './ColorPickerTile';

function getColorsFromJson(initialJsonObject) {
  const updatedJsonObject = { ...initialJsonObject };
    const colors = {};
    Object.keys(updatedJsonObject).forEach(key => {
      if (key.toLowerCase().endsWith('color')) {
        console.log('key, color', key, updatedJsonObject[key])
        const color = updatedJsonObject[key];
        colors[key] = {r: color[0] * 255, g: color[1] * 255, b: color[2] * 255, a: color[3] };
      }
    });
    return colors;
}

const JsonEditor = ({ initialJsonObject, onJsonChange, title}) => {
  const [jsonObject, setJsonObject] = useState(initialJsonObject);
  const [colorStates, setColorStates] = useState(getColorsFromJson(initialJsonObject));

  useEffect(() => {
    const updatedJsonObject = { ...initialJsonObject };
    const colors = {};
    Object.keys(updatedJsonObject).forEach(key => {
      if (key.toLowerCase().endsWith('color')) {
        // console.log('key, color', key, updatedJsonObject[key])
        colors[key] = updatedJsonObject[key];
      }
    });
    setColorStates(colors);
    


    // Dynamically create color states from JSON properties
    
  }, [initialJsonObject]);

  const handleChange = (e, key) => {
    const { value } = e.target;
    const updatedJsonObject = {
      ...jsonObject,
      [key]: value
    };
    setJsonObject(updatedJsonObject);
    onJsonChange(updatedJsonObject, key, value);
  };

  const handleColorChange = (color, key) => {
    const updatedJsonObject = {
      ...jsonObject,
      [key]: color.rgb
    };
    setJsonObject(updatedJsonObject);
    // colors[key] = color.rgb;
    console.log('Updated color state for', key, ':', color);
    const colorArray = [
      color.rgb.r / 255,
      color.rgb.g / 255,
      color.rgb.b / 255,
      color.rgb.a
    ];
    onJsonChange(updatedJsonObject, key, colorArray);
  };

  const handleBooleanChange = (e, key) => {
    const updatedJsonObject = {
      ...jsonObject,
      [key]: e.target.checked
    };
    setJsonObject(updatedJsonObject);
    onJsonChange(updatedJsonObject, key, e.target.checked);
  };
  // console.log('colorStates', colorStates);
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          {Object.keys(jsonObject).map(key => (
            <Box key={key} sx={{ mb: 2 }}>
              {typeof jsonObject[key] === 'boolean' ? (
                <Box
                  sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}                  
                >
                  <Typography variant="subtitle1">{key}</Typography>
                  <Switch checked={jsonObject[key]} onChange={(e) => handleBooleanChange(e, key)} />
                  </Box>
              ) : key.toLowerCase().endsWith('color') ? (
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Typography variant="subtitle1">{key}</Typography>
                  <ColorPickerTile
                    color={colorStates[key]}
                    onChange={(colorArray) => handleColorChange(colorArray, key)}
                  />
                </Box>
              ) : (
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="subtitle1">{key}</Typography>
                <TextField
                  size="small"
                  sx={{textAlign: 'right', float: 'right'}}
                  variant="outlined"
                  value={jsonObject[key]}
                  onChange={(e) => handleChange(e, key)}
                />
                </Box>
              )}
            </Box>
          ))}
        </Paper>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h2">
            Updated JSON:
          </Typography>
          <Paper elevation={3} sx={{ p: 2, whiteSpace: 'pre-wrap' }}>
            <pre>{JSON.stringify(jsonObject, null, 2)}</pre>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default JsonEditor;
