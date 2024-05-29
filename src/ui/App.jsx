import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
} from "react";
import update from 'immutability-helper'
import "./App.css";
import { nvUtils } from "./nvUtils";
import { Niivue, NVDocument, SLICE_TYPE } from "@niivue/niivue";
import { NiivueCanvas } from "./components/NiivueCanvas";
import { Sidebar } from "./components/Sidebar";
import { FileList } from "./components/FileList";
import { MeshList } from "./components/MeshList";
import { ImageTools } from "./components/ImageTools";
import { FileItem } from "./components/FileItem";
import { MeshItem } from "./components/MeshItem";
import { ColormapSelect } from "./components/ColormapSelect";
import { MinMaxInput } from "./components/MinMaxInput";
import { MosaicInput } from "./components/MosaicInput";
import { OpacitySlider } from "./components/OpacitySlider";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ColorPicker } from "./components/ColorPicker";
import Typography from "@mui/material/Typography";

// use a context to call the Niivue instance from any component
const _nv = new Niivue();
const NV = createContext(_nv);

// map the slice type UI string to the Niivue slice type
const sliceTypes = {
  axial: SLICE_TYPE.AXIAL,
  coronal: SLICE_TYPE.CORONAL,
  sagittal: SLICE_TYPE.SAGITTAL,
  multiPlanarACS: SLICE_TYPE.MULTIPLANAR,
  render: SLICE_TYPE.RENDER,
};

const NONE = 0;
const VOLUME = 1;
const MESH = 2;


function App() {
  // create a new Niivue object
  const nv = useContext(NV);

  nv.onImageLoaded = (volume) => {
    setActiveImage(nv.volumes.length - 1)
    handleDrop();
  };

  nv.onMeshLoaded = (mesh) => {
    handleMeshAdded()
  }

  nv.onLocationChange = (locationData) => {
    // set the window title to locationData.string
    document.title = locationData.string;
  };

  // get the list of colormap names
  const colormapNames = nv.colormaps(true); // sorted by name

  // create an array of objects with the colormap name and values (used to render the colormap select)
  const colormaps = colormapNames.map((name) => {
    return {
      name: name,
      values: nv.colormapFromKey(name),
    };
  });

  // ------------ State ------------
  // set the initial state of the commsInfo object to an empty object
  const [commsInfo, setCommsInfo] = useState({});
  const [activeImage, setActiveImage] = useState(0); // index of the active image
  const [images, setImages] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [calMin, setCalMin] = useState(0);
  const [calMax, setCalMax] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [colormap, setColormap] = useState("gray"); // default
  const [sliceType, setSliceType] = useState("");
  const [mosaicString, setMosaicString] = useState("A 0 20 C 30 S 42");
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerColor, setColorPickerColor] = useState({ r: 255, g: 0, b: 0, a: 1 });
  const [colorOptionToChange, setColorOption] = useState();
  const [meshes, setMeshes] = useState([]);
  const [activeMesh, setActiveMesh] = useState(0)
  const [activeImageType, setActiveImageType] = useState(NONE)

  // ------------ Callbacks ------------
  // add a volume from a URL
  const addVolume = useCallback(
    async (path, commsInfo) => {
      let url = makeNiivueUrl(path, commsInfo);
      console.log(url);
      await nv.addVolumeFromUrl({ url: url, name: path });
      let volumes = nv.volumes;
      let newImages = volumes.map((volume, index) => {
        return {
          url: volume.url,
          name: volume.name,
          index: index,
          id: volume.id,
          color: volume.colormap,
          active: index === activeImage,
          frame: volume.frame4D,
          maxFrame: volume.nTotalFrame4D,
        };
      });
      console.log(newImages);
      setImages(newImages);
    },
    [activeImage, nv, setImages]
  );

  const setVisibility = useCallback(
    (index, opacity) => {
      nv.setOpacity(index, opacity);
    },
    [nv]
  );

  const updateOpacity = useCallback(
    (opacity) => {
      nv.setOpacity(activeImage, opacity);
      setOpacity(opacity);
    },
    [activeImage, nv]
  );

  const updateColormap = useCallback(
    (colormap) => {
      nv.volumes[activeImage].colormap = colormap;
      nv.updateGLVolume();
      setColormap(colormap);
    },
    [activeImage, nv]
  );

  const setCalMinMax = useCallback(
    (min, max) => {
      nv.volumes[activeImage].cal_min = min;
      nv.volumes[activeImage].cal_max = max;
      nv.updateGLVolume();
      setMin(min);
      setMax(max);
    },
    [activeImage, nv]
  );

  const onMosaicChange = (newValue) => {
    nv.setSliceMosaicString(newValue);
    setMosaicString(newValue);
  };


  // ------------ Effects ------------
  // get the comms info from the main process
  // when the app is first loaded
  useEffect(() => {
    async function getCommsInfo() {
      let info = await nvUtils.getCommsInfo();
      console.log(info);
      setCommsInfo(info);

      nvUtils.onSaveMosaicString(() => {
        saveMosaicString(nv.sliceMosaicString);
      });

      nvUtils.onLoadMosaicString(() => {
        loadMosaicString();
      });

      nvUtils.onLoadDocument(() => {
        loadDocument();
      })

      nvUtils.onSaveDocument(() => {
        saveDocument();
      })

      // set the callback for when volumes are loaded
      nvUtils.onLoadVolumes((imgs) => {
        console.log("loaded volumes", imgs);
        imgs.forEach(async (img) => {
          await addVolume(img, info);
        });
      });

      nvUtils.onCloseAllVolumes(() => {
        let volumes = nv.volumes;
        // loop over all volumes from the end of the array to the beginning
        // this is because when a volume is removed, the array is reindexed
        // so if you remove the first volume, the second volume becomes the first
        // and the second volume is never removed
        for (let i = volumes.length - 1; i >= 0; i--) {
          nv.removeVolumeByIndex(i);
        }
        
        setImages([]);
        setMeshes([]);

        // update active image, min, max, opacity
        setActiveImage(0);
        setActiveMesh(0);
        setMin(0);
        setMax(0);
        setOpacity(1);
        setCalMax(0);
        setCalMin(0);
        setColorPickerOpen(false);
        setColorPickerColor("#ff000000")
        setActiveImageType(NONE)
      });
      // set the callback for when the view needs updating
      nvUtils.onSetView((view) => {
        setSliceType(view);
        // clear the mosaic string
        nv.setSliceMosaicString("");
        if (view === "multiPlanarACSR") {
          nv.opts.multiplanarForceRender = true;
        } else if (view === "mosaic") {
          nv.setSliceMosaicString("A 0 20 C 30 S 42");
          nv.opts.multiplanarForceRender = false;
        } else {
          nv.opts.multiplanarForceRender = false;
        }
        nv.setSliceType(sliceTypes[view]);
      });
      nvUtils.onSetOpt((view) => {
        // view is an array with the first element as the option name and the second as the value(s)
        console.log("Setting ", view[0], " as ", view[1]);
        const regex = new RegExp('Color$');
        if (regex.test(view[0])) {
          const currentColor = nv.opts[view[0]]
          setColorPickerColor({ r: currentColor[0] * 255, g: currentColor[1] * 255, b: currentColor[2] * 255, a: currentColor[3] });
          setColorPickerOpen(true);
          setColorOption(view[0]);

        }
        else {
          nv.opts[view[0]] = view[1];
          nv.updateGLVolume();
          nv.drawScene();
        }
      });
      nvUtils.onSetDrawPen((pen) => {
        // pen is color for drawing
        if (pen === Infinity) {
          nv.setDrawingEnabled(false);
          return;
        } else {
          nv.setDrawingEnabled(true);
        }
        let isFilled = nv.opts.isFilledPen;
        console.log("Setting draw pen to ", pen);
        nv.setPenValue(pen, isFilled);
      });
      nvUtils.onSetEvalStr((str) => {
        console.log("Evaluating ", str);
        eval(str);
      });
      nvUtils.onGetOpt((opt) => {
        // opt is the option name, returns current value(s)
        let val = nv.opts[opt[0]];
        console.log("Getting ", opt[0], " which is", val);
        return val;
      });
      // set the callback for when the DRAG mode changes
      nvUtils.onSetDragMode((mode) => {
        switch (mode) {
          case "pan":
            nv.opts.dragMode = nv.dragModes.pan;
            break;
          case "contrast":
            nv.opts.dragMode = nv.dragModes.contrast;
            break;
          case "measure":
            nv.opts.dragMode = nv.dragModes.measurement;
            break;
          case "none":
            nv.opts.dragMode = nv.dragModes.none;
            break;
        }
      });

      // set the callback for when the volume number updates (4D files)
      nvUtils.onSetFrame((frame) => {
        let vol = nv.volumes[activeImage];
        let id = vol.id;
        let currentFrame = vol.frame4D;
        nv.setFrame4D(id, currentFrame + frame);
        // TODO: update the frame in the FileItem
      });
    }
    getCommsInfo();
  }, [activeImage, nv, addVolume]);

  // when active image changes, update the min and max
  useEffect(() => {
    if (images.length === 0) {
      return;
    }
    let vol = nv.volumes[activeImage];
    setCalMin(vol.cal_min);
    setCalMax(vol.cal_max);
    setMin(vol.cal_min);
    setMax(vol.cal_max);
    setOpacity(vol.opacity);
    setColormap(vol.colormap);
    // nv.updateGLVolume();
  }, [activeImage, images, nv]);

  // when user changes intensity with the right click selection box
  // for now, only works with the background image
  useEffect(() => {
    nv.onIntensityChange = (volume) => {
      setMin(volume.cal_min);
      setMax(volume.cal_max);
    };
  }, [nv]);

  // ------------ Helper Functions ------------
  function makeNiivueUrl(path, commsInfo) {
    return `http://${commsInfo.host}:${commsInfo.fileServerPort}/${commsInfo.route}?${commsInfo.queryKey}=${path}`;
  }

  const toggleActive = useCallback((name, value) => {
    console.log(name, value);
    let newImages = images.map((image, index) => {
      if (image.name === name) {
        image.active = value;
        setActiveImage(index);
        setActiveImageType(VOLUME)
      } else {
        image.active = false;
      }
      return image;
    });
    setImages(newImages);
  }, [images, setActiveImage]);

  const toggleActiveMesh = useCallback((name, value) => {
    console.log(name, value);
    let newMeshes = meshes.map((mesh, index) => {
      if (mesh.name === name) {
        mesh.active = value;
        setActiveMesh(index);
        setActiveImageType(MESH)
      } else {
        mesh.active = false;
      }
      return mesh;
    });
    setMeshes(newMeshes);
  }, [meshes, setActiveMesh]);


  const getImageList = useCallback(() => {
    let volumes = nv.volumes;
    let newImages = volumes.map((volume, index) => {
      return {
        url: volume.url,
        name: volume.name,
        index: index,
        id: volume.id,
        color: volume.colormap,
        active: index === activeImage,
      };
    });

    return newImages;
  }, [nv, activeImage])


  const getMeshList = useCallback(() => {
    let meshes = nv.meshes;
    let newMeshes = meshes.map((mesh, index) => {
      return {
        id: mesh.id,
        name: mesh.name,
        opacity: mesh.opacity,
        meshShaderIndex: mesh.meshShaderIndex,
        colormap: mesh.colormap,
        active: index === activeMesh,
        index
      };
    });

    return newMeshes;
  }, [nv, activeMesh])


  function handleDrop() {
    const newImages = getImageList();
    const newMeshes = getMeshList();
    console.log(newImages);
    setImages(newImages);
    setMeshes(newMeshes);
  }

  function handleMeshAdded() {
    console.log('mesh added handler called')
    let meshes = nv.meshes.map((mesh, index) => {
      return {
        id: mesh.id,
        name: mesh.name,
        opacity: mesh.opacity,
        meshShaderIndex: mesh.meshShaderIndex,
        colormap: mesh.colormap,
        active: true,
        index
      }
    })

    console.log('meshes', meshes)
    setMeshes(meshes)
  }

  const handleRemove = useCallback(
    (index) => {
      let vol = nv.volumes[index];
      nv.removeVolume(vol);
      let newImages = getImageList();
      setActiveImage(0);
      if(images.length === 0) {
        if(meshes.length > 0) {
          setActiveImageType(MESH)
        }
        else {
          setActiveImageType(NONE)
        }
      }
      setImages(newImages);
    },
    [nv, getImageList]
  );

  const handleRemoveMesh = useCallback(
    (index) => {
      let mesh = nv.meshes[index];
      nv.removeVolume(mesh);
      let meshes = nv.meshes;
      let newMeshes = meshes.map((mesh, index) => {
        return {
          id: mesh.id,
          name: mesh.name,
          opacity: mesh.opacity,
          meshShaderIndex: mesh.meshShaderIndex,
          colormap: mesh.colormap,
          active: index === activeMesh,
          index
        };
      });
      setActiveMesh(0);
      setMeshes(newMeshes);
    },
    [activeMesh, nv]
  );

  const handleMoveUp = useCallback(
    (index) => {
      const newIndex = index - 1;
      if (newIndex < 0) {
        return;
      }

      nv.setVolume(nv.volumes[index], newIndex);
      let newImages = getImageList()
      setActiveImage(0);
      setImages(newImages);
    },
    [getImageList, nv]
  );

  const handleMoveDown = useCallback(
    (index) => {
      const newIndex = index + 1;
      if (newIndex > nv.volumes.length - 1) {
        return;
      }

      nv.setVolume(nv.volumes[index], newIndex);
      let newImages = getImageList()
      setActiveImage(0);
      setImages(newImages);
    },
    [getImageList, nv]
  );

  const handleShowHeader = (index) => {
    let vol = nv.volumes[index];
    alert(vol.hdr.toFormattedString());
  };

  const handleNextFrame = (index) => {
    const vol = nv.volumes[index];
    let id = vol.id;
    let currentFrame = vol.frame4D;
    nv.setFrame4D(id, currentFrame + 1);
  };

  const handlePreviousFrame = (index) => {
    const vol = nv.volumes[index];
    let id = vol.id;
    let currentFrame = vol.frame4D;
    nv.setFrame4D(id, currentFrame - 1);
  };

  const saveMosaicString = async (mosaic) => {
    console.log("mosaic:", mosaic);
    if (mosaic) {
      const result = await nvUtils.openSaveMosaicFileDialog();
      if (!result.canceled) {
        nvUtils.saveTextFile(result.filePath, mosaic);
      }
    }
  };

  const loadMosaicString = async () => {
    const result = await nvUtils.openLoadMosaicFileDialog();
    if (!result.canceled) {
      const mosaicString = await nvUtils.loadTextFile(result.filePaths[0]);
      nv.setSliceMosaicString(mosaicString);
      setMosaicString(mosaicString);
    }
  };

  const loadDocument = async () => {
    const result = await nvUtils.openFileDialog(['*.nvd']);
    if (!result.canceled) {
      const jsonString = await nvUtils.loadTextFile(result.filePaths[0]);
      const json = JSON.parse(jsonString);
      const document = NVDocument.loadFromJSON(json)
      nv.loadDocument(document);

    }
  }

  const saveDocument = async () => {
    const result = await nvUtils.openSaveFileDialog("niivue.nvd");
    if (!result.canceled) {
      const json = nv.json();
      const re = new RegExp("([^\\\\\\\\/]*$)")

      json.name = result.filePath.match(re)[0]
      let imageIndex = 0;
      for (const imageOption of json.imageOptionsArray) {
        imageOption.name = `${nv.volumes[imageIndex++].name}.nii`;
      }
      const jsonString = JSON.stringify(json)
      nvUtils.saveTextFile(result.filePath, jsonString);
    }
  }

  const onColorPickerChange = (color) => {
    setColorPickerColor(color.rgb);
    console.log("color picked: ", color);
  }

  const onCloseColorPicker = (isCanceled = true) => {
    setColorPickerOpen(false);
    console.log("color picker closed");

    if (!isCanceled) {
      const colorPicked = [colorPickerColor.r / 255.0, colorPickerColor.g / 255.0, colorPickerColor.b / 255.0, colorPickerColor.a * 1.0];
      console.log("color picked", colorPicked);
      nv.opts[colorOptionToChange] = colorPicked;
      nv.updateGLVolume();
      nv.drawScene();
    }
  }
  
  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setImages((prevImages) => 
      update(prevImages, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevImages[dragIndex]],
        ],
      }),
    )
    // update the volume order in Niivue
    nv.setVolume(nv.volumes[dragIndex], hoverIndex)
    // update the active image if it was moved
    if (activeImage === dragIndex) {
      setActiveImage(hoverIndex)
    } else if (activeImage === hoverIndex) {
      setActiveImage(dragIndex)
    }
  }, [nv, activeImage, setImages, setActiveImage])

  const renderImage = useCallback((image, index) => {
    return (
      <FileItem
        id={image.id}
        key={image.id} // unique key for React
        moveImage={moveImage}
        name={image.name} // the name of the image (the full path on the file system)
        active={image.active} // whether the image is the active image
        index={index} // the index of the image in the images array
        frame={image.frame} // the current frame of the image (for 4D images)
        maxFrame={image.maxFrame} // the maximum frame of the image (for 4D images)
        onSetActive={toggleActive} // callback to set if the image is active
        onSetVisibility={setVisibility} // callback to set the visibility of the image (opacity 0 or 1)
        onRemove={handleRemove} // callback to remove the image from the scene via the context menu
        onMoveUp={handleMoveUp} // callback to move the image up via the context menu
        onMoveDown={handleMoveDown} // callback to move the image down via the context menu
        onShowHeader={handleShowHeader} // callback to show the image header via the context menu
        onNextFrame={handleNextFrame} // advances the frame for 4D volumes
        onPreviousFrame={handlePreviousFrame} // goes back a frame for 4D volumes
      ></FileItem>
    )
  }, [toggleActive, setVisibility, handleRemove, handleMoveUp, handleMoveDown, handleShowHeader, handleNextFrame, handlePreviousFrame, moveImage])


  const renderMesh = useCallback((mesh, index) => {
    return (
      <MeshItem
        key={mesh.id} // unique key for React
        index={index}
        name={mesh.name}
        active={mesh.active}
        onSetActive={toggleActiveMesh} // callback to set if the image is active
        onSetVisibility={setVisibility} // callback to set the visibility of the image (opacity 0 or 1)
        onRemove={handleRemoveMesh} // callback to remove the image from the scene via the context menu
></MeshItem>
    )
  }, [toggleActiveMesh, setVisibility, handleRemoveMesh])

  let imageToolsPanel;
  if(activeImageType === VOLUME) {
    imageToolsPanel = <ImageTools>{/* colormap select: sets the colormap of the active image */}
    <ColormapSelect
      colormaps={colormaps} // array of colormap objects
      onSetColormap={updateColormap} // callback to set the colormap of the active image
      colormap={nv.volumes.length > 0 && nv.volumes[activeImage] ? nv.volumes[activeImage].colormap : colormap} // the current colormap of the active image
    />
    {/* min max input: set the min and max of the active image */}
    <MinMaxInput
      calMin={calMin} // the minimum value of the active image
      calMax={calMax} // the maximum value of the active image
      min={min} // the selected minimum value of the active image
      max={max} // the selected maximum value of the active image
      onSetMinMax={setCalMinMax} // callback to set the min and max of the active image
    />
    {/* opacity slider: set the opacity of the active image */}
    <OpacitySlider
      opacity={opacity} // the current opacity of the active image
      onSetOpacity={updateOpacity} // callback to set the opacity of the active image
    /></ImageTools>
  }
  else {
    imageToolsPanel = <></>
  }
  return (
    // wrap the app in the Niivue context
    <NV.Provider value={_nv}>
      {/* AppContainer: the parent component that lays out the rest of the scene */}
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          width: "100vw",
          minHeight: "300px",
          gap: 0,
        }}
      >
        {/* CssBaseline sets some standard CSS configs for working with MUI */}
        <CssBaseline />
        {/* Sidebar: is the left panel that shows all files and image/scene widgets */}
        <Sidebar>
        <Typography
        variant="body"
        sx={{
          marginTop: 0,
          marginBottom: 0.5,
        }}
      >
        
      </Typography>
          Images
          {/* FileList: shows all files in layer order */}
          <FileList>
            {/* FileItems: each FileItem is an image to be rendered in Niivue */}
            {images.map((image, index) => {
              return renderImage(image, index)
            })}
          </FileList>
          Meshes
          <MeshList>
            {meshes.map((mesh, index) => {
              return renderMesh(mesh, index)
            })}
          </MeshList>
          {/* mosaic text input if sliceType is "mosaic" */}
          {sliceType === "mosaic" && <MosaicInput onChange={onMosaicChange} value={mosaicString} />}
          {imageToolsPanel}
          {/* SceneTools here in the future! */}
        </Sidebar>
        {/* Niivue Canvas: where things are rendered :) */}
        <NiivueCanvas nv={nv} />
        <ColorPicker isOpen={isColorPickerOpen} pickedColor={colorPickerColor} onChange={onColorPickerChange} onClose={onCloseColorPicker} isFullScreen={false} />
      </Container>
    </NV.Provider>
  );
}

export default App;
