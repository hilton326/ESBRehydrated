// UNUSED

// Function to convert profile picture array buffers into a readable format
export function processImageData(pictureData) {
        // Don't proceed if any of the data is null or not in the expected format (mime type and array buffer)
        if (!pictureData) {
            console.log("pictureData is undefined");
            return null;
        }
        if (!pictureData.mime || !pictureData.data) {
            console.log("No picture data");
            return null;
        }

        /* mime = String representing file format. Should be "image/png", "image/jpeg", etc
        * data = the image's binary representation 
        *
        * 1. "data" is an ArrayBuffer, which is the raw memory the image was loaded in on the server.
        * 2. The ArrayBuffer gets converted into an array view of this memory (TypeArray), so the bytes become readable
        * (If "data" isn't an ArrayBuffer, the function will assume the bytes are already readable data and skip step 2.)
        * 3. A Blob is created from the bytes and mime type, which a browser can understand as image data
        * 4. The function returns a URL from the Blob that can be placed directly into img src
        */
        try {
            const {mime, data} = pictureData;
            const bytes = (data instanceof ArrayBuffer) 
                ? new Uint8Array(data) // Uint8 = unsigned 8 bit ints
                : data; // if already a typed array

            const blob = new Blob([bytes], { type: mime });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("Error processing picture data: ", error);
            return null;
        }
    }