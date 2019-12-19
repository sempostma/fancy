import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './FancyBarCode.css';
import ImageLogic from '../ImageLogic/ImageLogic';
import classnames from 'classnames';
import BarcodeLogic from '../BarcodeLogic/BarcodeLogic'

class FancyBarCode extends Component {
    constructor() {
        super();
        this.state = {
            createBarCode: false
        };
    }

    render() {
        if (this.state.createBarCode) {
            return <BarcodeLogic onBack={() => this.setState({ createBarCode: false })} />
        }

        return (
            <div onClick={() => this.setState({ createBarCode: true })} className="create-bar-code">
                <span className="icon icon-popup"></span>
                <p>Create a barcode.</p>
            </div>
        );
    }
}

export default FancyBarCode;