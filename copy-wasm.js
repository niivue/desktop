const fs = require('fs');
const path = require('path');


const sourcePath = path.resolve(__dirname, 'node_modules/@niivue/niimath-js/src/process-image.wasm');
const destinationPath = path.resolve(__dirname, 'src/ui/public/assets/process-image.wasm');

fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
        console.error('Error copying WASM file:', err);
        process.exit(1);
    } else {
        console.log('WASM file copied successfully');
    }
});
