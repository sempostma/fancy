
importScripts('jimp.min.js');

const readAsArrayBuffer = file => {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = e => {
            resolve(e.target.result);
        }
        fr.readAsArrayBuffer(file);
    });
}

let image;

self.addEventListener('message', async function (e) {
    switch (e.data.type) {
        case 'PREVIEW':
            return await preview(e);
        case 'FINAL':
            return await final(e);
        default: throw new Error('Does not exist');
    }
});

async function preview(e) {
    console.time("worker");
    self.postMessage({ payload: 'Reading the image ⌛', type: 'PROGRESS' });
    const state = e.data.state;
    const { rotation, blur, posterize, sepia, resize, resizeX, index, opacity, fade, opaque, background, backgroundColor, resizeY, greyscale, brightness, contrast, rotationResize, quality, mirror, normalize, invert, crop } = state;
    const buffer = await readAsArrayBuffer(state.files[index]);
    self.postMessage({ payload: 'Processing the image 🌆', type: 'PROGRESS' });
    console.timeLog("worker");
    image = await Jimp.read(buffer);
    console.timeLog("worker");
    if (resize && (typeof resizeX === 'number' || typeof resizeY === 'number')) image.resize(resizeX || Jimp.AUTO, resizeY || Jimp.AUTO);
    console.timeLog("worker");
    if (greyscale) image.greyscale();
    console.timeLog("worker");
    if (rotation) image.rotate(rotation, rotationResize);
    console.timeLog("worker");
    if (quality) image.quality(quality);
    console.timeLog("worker");
    if (brightness) image.quality(brightness);
    console.timeLog("worker");
    if (opaque) image.opaque();
    console.timeLog("worker");
    if (contrast) image.quality(contrast);
    console.timeLog("worker");
    if (background && backgroundColor) image.background(parseInt(backgroundColor.slice(1) + 'ff', 16));
    console.timeLog("worker");
    if (opacity) image.opacity(opacity);
    console.timeLog("worker");
    if (fade) image.fade(fade);
    console.timeLog("worker");
    if (blur) image.blur(blur);
    console.timeLog("worker");
    if (posterize) image.posterize(posterize);
    console.timeLog("worker");
    if (sepia) image.sepia();
    console.timeLog("worker");
    if (mirror) {
        if (mirror === 'horizontal') image.mirror(true, false);
        else if (mirror === 'vertical') image.mirror(false, true);
    }
    console.timeLog("worker");
    if (normalize) image.normalize();
    console.timeLog("worker");
    if (invert) image.invert();
    console.timeLog("worker");
    self.postMessage({ payload: 'Creating the new image 🎉', type: 'PROGRESS' });
    const data = await image.getBufferAsync(state.mime);
    console.timeLog("worker");
    console.log(data);
    const blob = new Blob([new Uint8Array(data)]);
    console.timeLog("worker");
    const blobUrl = URL.createObjectURL(blob);
    console.timeEnd("worker");
    if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
    self.postMessage({ blob, blobUrl, data, type: 'PREVIEW' });
}

async function final(e) {
    const {state, ratio} = e.data;
    const { crop } = state;
    if (state.crop.x !== undefined) image.crop(crop.x * ratio, crop.y * ratio, crop.width * ratio, crop.height * ratio);
    console.timeLog("worker");
    const prodData = await image.getBufferAsync(state.mime);
    console.timeLog("worker");
    self.postMessage({ prodData, type: 'FINAL' });
}
