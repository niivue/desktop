import React, { useState, useEffect } from 'react';
import { TextField, Typography, Container, Box, Paper, Switch, FormControlLabel } from '@mui/material';
import { ColorPickerTile } from './ColorPickerTile';

const JsonEditor = ({ initialJsonObject, onJsonChange }) => {
  const [jsonObject, setJsonObject] = useState(initialJsonObject);

  useEffect(() => {
    const updatedJsonObject = { ...initialJsonObject };

    Object.keys(updatedJsonObject).forEach(key => {
      if (updatedJsonObject[key] == null) {
        if (key.toLowerCase().includes('color')) {
          updatedJsonObject[key] = [1, 1, 1, 1];  // Default color is white
        } else {
          updatedJsonObject[key] = '';
        }
      }
    });

    setJsonObject(updatedJsonObject);
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

  const handleColorChange = (colorArray, key) => {
    const updatedJsonObject = {
      ...jsonObject,
      [key]: colorArray
    };
    setJsonObject(updatedJsonObject);
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

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Scene Settings
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          {Object.keys(jsonObject).map(key => (
            <Box key={key} sx={{ mb: 2 }}>
              {typeof jsonObject[key] === 'boolean' ? (
                <FormControlLabel
                  control={<Switch checked={jsonObject[key]} onChange={(e) => handleBooleanChange(e, key)} />}
                  label={key}
                />
              ) : key.toLowerCase().endsWith('color') ? (
                <Box>
                  <Typography variant="subtitle1">{key}</Typography>
                  <ColorPickerTile
                    color={jsonObject[key]}
                    onChange={(colorArray) => handleColorChange(colorArray, key)}
                  />
                </Box>
              ) : (
                <TextField
                  fullWidth
                  label={key}
                  variant="outlined"
                  value={jsonObject[key]}
                  onChange={(e) => handleChange(e, key)}
                />
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
