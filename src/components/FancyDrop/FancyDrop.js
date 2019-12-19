import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './FancyDrop.css';
import { Redirect } from 'react-router-dom';
import ImageLogic from '../ImageLogic/ImageLogic';
import classnames from 'classnames';

class FancyDrop extends Component {
    constructor() {
        super();
        this.state = {
            files: []
        };
    }

    onDrop = (files) => {
        this.setState({ files })
    };

    render() {
        if (this.state.files.length > 0) {
            return <ImageLogic onBack={() => this.setState({ files: [] })} files={this.state.files} />
        }

        return (
            <Dropzone accept="image/*" onDrop={this.onDrop}>
                {({ getRootProps, getInputProps, isDragActive }) => (
                    <div {...getRootProps({
                        className: classnames({
                            dropzone: true,
                            active: isDragActive
                        })
                    })}>
                        <input {...getInputProps()} />
                        <span className="icon icon-upload"></span>
                        <p>Drag 'n' drop some fancy image.</p>
                    </div>
                )}
            </Dropzone>
        );
    }
}

export default FancyDrop;