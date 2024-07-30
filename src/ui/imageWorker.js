import { LinearMemory } from "@niivue/niimath-js/src/linear-memory.js";

let linearMemory = new LinearMemory({ initial: 256, maximum: 2048 });
let wasmInstance;
const wasmUrl = new URL("/assets/process-image.wasm?url", import.meta.url);

const initializeWasm = async () => {
    if (!wasmInstance) {
        try {
            const wasmBinary = await fetch(wasmUrl).then(response => response.arrayBuffer());
            const niimathWasm = await WebAssembly.instantiate(wasmBinary, { env: linearMemory.env() });
            wasmInstance = niimathWasm.instance;
        } catch (error) {
            console.error("Failed to initialize WASM:", error);
            throw error;
        }
    }
    return wasmInstance;
};

addEventListener("message", async (e) => {
    try {
        const initialized = await initializeWasm();
        const niimathWasm = initialized.exports;

        if (!niimathWasm.walloc || !niimathWasm.wfree || !niimathWasm.niimath) {
            console.error("Required WASM functions are not available");
            return;
        }

        const [imageMetadata, imageBytes, cmd, isNewLayer] = e.data;

        // Allocate memory for command string
        const cmdBufferSize = cmd.length + 1;
        const cmdPtr = niimathWasm.walloc(cmdBufferSize);
        if (cmdPtr === 0) {
            console.error("Failed to allocate memory for command string");
            return;
        }
        linearMemory.record_malloc(cmdPtr, cmdBufferSize);

        // Create and set command string in WASM memory
        const cmdArray = new Uint8Array(cmdBufferSize);
        for (let i = 0; i < cmd.length; i++) {
            cmdArray[i] = cmd.charCodeAt(i);
        }
        new Uint8Array(niimathWasm.memory.buffer, cmdPtr, cmdBufferSize).set(cmdArray);

        // Allocate memory for image data
        const nvox = imageMetadata.nx * imageMetadata.ny * imageMetadata.nz * imageMetadata.nt;
        const imageBufferSize = nvox * imageMetadata.bpv;
        const imgPtr = niimathWasm.walloc(imageBufferSize);
        if (imgPtr === 0) {
            console.error("Failed to allocate memory for image data");
            return;
        }
        linearMemory.record_malloc(imgPtr, imageBufferSize);

        // Set image data in WASM memory
        new Uint8Array(niimathWasm.memory.buffer, imgPtr, imageBufferSize).set(new Uint8Array(imageBytes));

        // Process image
        const result = niimathWasm.niimath(
            imgPtr,
            imageMetadata.datatypeCode,
            imageMetadata.nx,
            imageMetadata.ny,
            imageMetadata.nz,
            imageMetadata.nt,
            imageMetadata.dx,
            imageMetadata.dy,
            imageMetadata.dz,
            imageMetadata.dt,
            cmdPtr
        );

        if (result !== 0) {
            console.error(`Command "${cmd}" generated a fatal error: ${result}`);
            return;
        }

        // Retrieve processed image data
        const processedImage = new Uint8Array(
            niimathWasm.memory.buffer,
            imgPtr,
            imageBufferSize
        );
        const clonedImage = new Uint8Array(processedImage);

        // Post the processed image and metadata
        postMessage({
            id: imageMetadata.id,
            imageBytes: clonedImage,
            cmd,
            isNewLayer,
        });

        // Free allocated WASM memory
        linearMemory.record_free(cmdPtr);
        niimathWasm.wfree(cmdPtr);
        linearMemory.record_free(imgPtr);
        niimathWasm.wfree(imgPtr);
        console.log('image processed');
    } catch (error) {
        console.error("Error processing image:", error);
    }
});
