import React, { Component } from 'react';
import jsbarcode from 'jsbarcode'
import omit from 'lodash/omit'
import { toast } from 'react-toastify';
import '../../lib/canvas-to-blob'
import '../../lib/blob'
import { saveAs } from 'file-saver'
import { SketchPicker } from 'react-color'
import Dropzone from 'react-dropzone'
import clsx from 'clsx'
var SvgSaver = require('svgsaver');                 // if using CommonJS environment
var svgsaver = new SvgSaver();
var convert = require('color-convert');

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex({ r, g, b, a }) {
    console.log("#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(Math.floor(a * 255)))
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(Math.floor(a * 255));
}

const formats = [
    'CODE128',
    'EAN13',
    'UPC',
    'EAN8',
    'EAN5',
    'EAN2',
    'CODE39',
    'ITF14',
    'MSI',
    'MSI10',
    'MSI11',
    'MSI1010',
    'MSI1110',
    'codabar',
    'pharmacode',
]

class BarcodeLogic extends Component {
    constructor(props) {
        super(props)

        this.state = {
            format: 'EAN13',
            width: 2,
            height: 100,
            displayValue: true,
            text: undefined,
            fontOptions: '',
            font: 'monospace',
            textAlign: 'center',
            textPosition: 'bottom',
            textMargin: '2',
            fontSize: '20',
            background: '#ffffffff',
            lineColor: '#000000ff',
            margin: 10,
            marginTop: undefined,
            marginLeft: undefined,
            marginRight: undefined,
            marginBottom: undefined,

            value: '0075678164125'
        }
    }

    componentDidMount = () => {
        this.runJsBarcode();
    }

    componentDidUpdate = () => {
        this.runJsBarcode();
    }

    savePng = () => {
        try {
            jsbarcode("#code-canvas", this.state.value, omit(this.state, 'value'));
            const value = this.state.value
            document.querySelector('#code-canvas').toBlob(blob => {
                saveAs(blob, `${value}.png`);
            })
        } catch (err) {
            toast.error(err.toString())
            throw err;
        }
    }

    saveSvg = () => {
        const value = this.state.value
        var svg = document.querySelector('#code-svg');         // find the SVG element
        svgsaver.asSvg(svg, `${value}.svg`);
    }

    downloadSettings = () => {
        const settings = JSON.stringify(this.state, null, 4)
        const blob = new Blob([settings], { type: 'application/json' })
        saveAs(blob, 'fancy-barcode-settings.fancybarcodejson')
    }

    onDrop = ([file]) => {
        try {
            const self = this
            var reader = new FileReader();
            reader.onload = (function (reader) {
                return function () {
                    var contents = reader.result;
                    const state = JSON.parse(contents)
                    self.setState(state)
                }
            })(reader);

            reader.readAsText(file);
        } catch (err) {
            toast.error(err.toString())
            throw err;
        }
    }

    runJsBarcode = () => {
        try {
            jsbarcode("#code-svg", this.state.value, omit(this.state, 'value'));
        } catch (err) {
            toast.error(err.toString())
        }
    }

    render() {
        return (
            <div className="imglogic">
                <div className="panel">
                    format:<br />
                    <select value={this.state.format} onChange={e => this.setState({ format: e.target.value })} className="form-control">
                        {formats.map(format => {
                            return (
                                <option key={format} value={format}>{format}</option>
                            )
                        })}
                    </select>
                    <label>Code</label>
                    <input value={this.state.value} onChange={e => this.setState({ value: +e.target.value })} type="text" minLength="13" maxLength="13" className="form-control" placeholder="A valid EAN code" />

                    <div className="form-group">
                        <label>Width</label>
                        <input value={this.state.width} onChange={e => this.setState({ width: +e.target.value })} type="number" step="0.1" className="form-control" placeholder="Width" />
                    </div>

                    <div className="form-group">
                        <label>Height</label>
                        <input value={this.state.height} onChange={e => this.setState({ height: +e.target.value })} type="number" step="1" className="form-control" placeholder="Width" />
                    </div>

                    <div className="checkbox">
                        <label>
                            <input checked={this.state.displayValue} onChange={e => this.setState({ displayValue: !this.state.displayValue })} type="checkbox" />
                            Display value
                     </label>
                    </div>

                    <label>Text</label>
                    <input value={this.state.text} onChange={e => this.setState({ text: e.target.value || undefined })} type="text" minLength="13" maxLength="13" className="form-control" placeholder="Some text" />

                    <label>Font options</label>
                    <input value={this.state.fontOptions} onChange={e => this.setState({ fontOptions: e.target.value })} type="text" minLength="13" maxLength="13" className="form-control" placeholder="Font opties" />

                    Text align:<br />
                    <select value={this.state.textAlign} onChange={e => this.setState({ textAlign: e.target.value })} className="form-control">
                        <option value="center">Center</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                    </select>

                    <div className="form-group">
                        <label>Text margin</label>
                        <input value={this.state.textMargin} onChange={e => this.setState({ textMargin: +e.target.value })} type="number" step="0.1" className="form-control" placeholder="Width" />
                    </div>

                    <div className="form-group">
                        <label>Font Size</label>
                        <input value={this.state.fontSize} onChange={e => this.setState({ fontSize: +e.target.value })} type="number" step="0.1" className="form-control" placeholder="Width" />
                    </div>

                    <div className="form-group">
                        <label>Margin</label>
                        <input value={this.state.margin} onChange={e => this.setState({ margin: +e.target.value })} type="number" step="0.1" className="form-control" placeholder="Width" />
                    </div>

                    Background <br />
                    <SketchPicker color={this.state.background} onChangeComplete={e => console.log(e) || this.setState({ background: rgbToHex(e.rgb) })} />

                    <br />
                    Line color <br />
                    <SketchPicker color={this.state.lineColor} onChangeComplete={e => console.log(e) || this.setState({ lineColor: rgbToHex(e.rgb) })} />




                    <br />

                    <Dropzone accept=".fancybarcodejson" onDrop={this.onDrop}>
                        {({ getRootProps, getInputProps, isDragActive }) => (
                            <div {...getRootProps({
                                className: clsx({
                                    dropzone: true,
                                    active: isDragActive
                                })
                            })}>
                                <input {...getInputProps()} />
                                <span className="icon icon-upload"></span>
                                <p>Drag your settings file here.</p>
                            </div>
                        )}
                    </Dropzone>

                    <br />

                    <button onClick={this.savePng} className="btn btn-large btn-primary">Save PNG</button>{' '}
                    <button onClick={this.saveSvg} className="btn btn-large btn-tertiary">Save SVG</button>{' '}
                    <button onClick={this.downloadSettings} className="btn btn-large btn-secondary">Download Settings</button>
                    <button onClick={this.props.onBack} className="btn btn-large btn-warning">Back</button>

                    <br />
                    <br />
                </div>
                <div className="image">
                    <div className="image-innner">
                        <svg id="code-svg" />
                        <img id="code-img" alt="Code" style={{ display: 'none' }} />
                        <canvas id="code-canvas" style={{ display: 'none' }} />
                    </div>
                </div>
            </div>
        );
    }
}

export default BarcodeLogic