import React, { Component } from 'react';
import './ImageLogic.css';
import Jimp from 'jimp/es';
import { saveAs } from 'file-saver';
import prettyBytes from 'pretty-bytes';
import { BounceLoader } from 'react-spinners';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const mimeTypes = {
    PNG: Jimp.MIME_PNG, // "image/png"
    JPG: Jimp.MIME_JPEG, // "image/jpeg"
    BMP: Jimp.MIME_BMP // "image/bmp"
};

class ImageLogic extends Component {
    constructor(props) {
        super(props);
        const fileNameExtensionMime = mimeTypes[(props.files[0].name.split('.').slice(-1)[0] || '').toUpperCase()];
        this.state = {
            files: props.files,
            mime: fileNameExtensionMime,
            loading: false,
            crop: {},
            index: 0,
        }
        this.worker = new window.Worker('jimp-worker.js');
        this.worker.onmessage = this.onWorkerMessage;
    }

    componentDidMount = () => {
        this.process();
    }

    handleNext = () => {
        this.setImageFilterState({ index: Math.min(this.state.index + 1, this.state.files.length - 1) })
    }

    handlePrevious = () => {
        this.setImageFilterState({ index: Math.max(this.state.index - 1, 0) })
    }

    readAsArrayBuffer = file => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = e => {
                resolve(e.target.result);
            }
            fr.readAsArrayBuffer(file);
        });
    }

    onWorkerMessage = ({ data }) => {
        if (data.type === 'FINAL') {
            this.handleWebWorkerFinalSaveResult({ data });
        } else if (data.type === 'PREVIEW') {
            this.setState({ ...data, loading: false });
        } else if (data.type === 'PROGRESS') {
            this.setState({ progress: data.payload });
        }
    }

    process = debounce(async () => {
        this.setState({ loading: true })
        this.worker.postMessage({ state: this.state, type: 'PREVIEW' }); // message the worker thread
    }, 500);

    save = async e => {
        if (!this.imageRef) return;
        const ratio = this.imageRef.naturalWidth / this.imageRef.clientWidth;
        this.setState({ loading: true });
        this.worker.postMessage({ state: this.state, ratio, type: 'FINAL' }); // message the worker thread

    }

    handleWebWorkerFinalSaveResult = async ({ data }) => {
        const { prodData } = data;
        const { quality } = this.state;
        let blob;
        if (window.imagemin) {
            var uint8array = await window.imagemin(prodData, quality);
            blob = new Blob([uint8array]);
        } else {
            blob = new Blob([prodData]);
        }
        saveAs(blob, this.state.files[this.state.index].name);
        this.setState({ loading: false });
    }

    setImageFilterState = patch => {
        this.setState({ ...patch }, this.process);
    }

    onImageLoaded = (image, crop) => {
        this.imageRef = image;
    };

    onCropComplete = crop => {
        this.setState({ crop });
    };

    onCropChange = crop => {
        this.setState({ crop });
    };

    render() {
        return (<div className="imglogic">
            <div className="panel">
                <div className="heading">Filters</div>
                File:<br />
                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ greyscale: e.target.checked })} type="checkbox" /> Greyscale
                    </label>
                </div>
                <button style={{ opacity: this.state.crop.x === undefined ? .5 : 1 }} disabled={this.state.crop.x === undefined} onClick={() => this.setImageFilterState({ crop: {} })} className="btn btn-large btn-primary">Remove Crop</button>{' '}
                {this.state.crop.x !== undefined
                    && <span>Crop: {Math.round(this.state.crop.x)},{Math.round(this.state.crop.y)} - {Math.round(this.state.crop.width)}x{Math.round(this.state.crop.height)}</span>
                    || null}
                <br />
                <br />
                <div className="form-group">
                    <div className="checkbox">
                        <label>
                            <input onChange={e => this.setImageFilterState({ crop: {}, resize: e.target.checked })} type="checkbox" /> Resize
                    </label>
                    </div>
                    <input onChange={e => this.setImageFilterState({ crop: {}, resizeX: +e.target.value })} style={{ width: 100 }} type="number" step="0" min="1" className="form-control" placeholder="pixel width" />
                    {' '}X{' '}
                    <input onChange={e => this.setImageFilterState({ crop: {}, resizeY: +e.target.value })} style={{ width: 100 }} type="number" step="0" min="1" className="form-control" placeholder="pixel height" />
                </div>

                <div className="form-group">
                    <label>JPEG/PNG Quality</label>
                    <input onChange={e => this.setImageFilterState({ quality: +e.target.value })} type="number" step="0" min="1" max="100" className="form-control" placeholder="A value from 0-100" />
                </div>

                <div className="form-group">
                    <label>Rotatation in degress (0-360)</label>
                    <input onChange={e => this.setImageFilterState({ rotation: +e.target.value })} type="number" step="0" min="0" max="360" className="form-control" placeholder="A value from 0-360" />
                </div>

                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ rotationResize: !e.target.checked })} type="checkbox" /> Don't resize after rotation
                    </label>
                </div>

                <div className="form-group">
                    <label>Brightness</label>
                    <input onChange={e => this.setImageFilterState({ brightness: +e.target.value })} type="number" step="0.01" min="-1" max="1" className="form-control" placeholder="A value from -1 to 1" />
                </div>

                <div className="form-group">
                    <label>Contrast</label>
                    <input onChange={e => this.setImageFilterState({ contrast: +e.target.value })} type="number" step="0.01" min="-1" max="1" className="form-control" placeholder="A value from -1 to 1" />
                </div>

                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ background: e.target.checked })} type="checkbox" />
                        {' '}Color <input type="color" onChange={e => this.setImageFilterState({ backgroundColor: e.target.value })} />
                    </label>
                </div>

                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ opaque: e.target.checked })} type="checkbox" /> Opaque
                    </label>
                </div>

                <div className="form-group">
                    <label>Fade</label>
                    <input defaultValue="0" onChange={e => this.setImageFilterState({ fade: +e.target.value })} type="number" step="0.01" min="0" max="1" className="form-control" placeholder="A value from 0 to 1" />
                </div>

                <div className="form-group">
                    <label>Opacity</label>
                    <input defaultValue="1" onChange={e => this.setImageFilterState({ opacity: +e.target.value })} type="number" step="0.01" min="0" max="1" className="form-control" placeholder="A value from 0 to 1" />
                </div>

                <div className="form-group">
                    <label>Blur</label>
                    <input onChange={e => this.setImageFilterState({ blur: +e.target.value })} type="number" step="1" min="0" className="form-control" placeholder="The blur radius in pixels" />
                </div>

                <div className="form-group">
                    <label>Posterize</label>
                    <input onChange={e => this.setImageFilterState({ posterize: +e.target.value })} type="number" step="1" min="0" className="form-control" />
                </div>

                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ sepia: e.target.checked })} type="checkbox" /> Sepia
                    </label>
                </div>

                Mirror:<br />
                <select onChange={e => this.setImageFilterState({ mirror: e.target.value })} className="form-control">
                    <option value={false}>Don't mirror</option>
                    <option value="horizontal">Horizonal</option>
                    <option value="vertical">Vertical</option>
                </select>

                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ invert: e.target.checked })} type="checkbox" /> Invert
                    </label>
                </div>

                <div className="checkbox">
                    <label>
                        <input onChange={e => this.setImageFilterState({ normalize: e.target.checked })} type="checkbox" /> Normalize
                    </label>
                </div>

                <select defaultValue={this.state.mime} className="form-control" onChange={e => this.setImageFilterState({ mime: e.target.value })}>
                    <option value={Jimp.MIME_PNG} >PNG</option>
                    <option value={Jimp.MIME_JPEG} >JPG</option>
                    <option value={Jimp.MIME_BMP} >BMP</option>
                </select>
                <br />
                <br />

                <button onClick={this.save} className="btn btn-large btn-primary">Save</button>{' '}
                <button onClick={this.props.onBack} className="btn btn-large btn-warning">Back</button>

                <br />
                <br />
                {this.state.blob && prettyBytes(this.state.blob.size)}
                <br />
                <br />
                <div className="bounce-loader">
                    <BounceLoader size={150}
                        color={'#7edc91'}
                        loading={this.state.loading}
                        margin="2px auto" />
                </div>
            </div>
            <div className="image">
                <div style={{ display: this.state.index > 0 ? 'block' : 'none' }} onClick={this.handlePrevious} className="left icon icon-left-open-big" />
                <div style={{ display: this.state.index < this.state.files.length - 1 ? 'block' : 'none' }} onClick={this.handleNext} className="right icon icon-right-open-big" />
                <div className="image-innner">
                    {this.state.blobUrl && <ReactCrop
                        src={this.state.blobUrl}
                        crop={this.state.crop}
                        onImageLoaded={this.onImageLoaded}
                        onComplete={this.onCropComplete}
                        onChange={this.onCropChange}
                    /> || <div style={{ width: 200, height: 200 }} />}
                    <div className={'bounce-loader ' + (this.state.loading ? 'loading' : '')}>
                        <BounceLoader size={150}
                            color={'#7edc91'}
                            loading={this.state.loading}
                            margin="2px auto" />
                        <p>{this.state.progress}</p>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default ImageLogic;

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};