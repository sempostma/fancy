import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import './Routes.css';

import AppliedRoute from "../AppliedRoute/AppliedRoute";
import UnauthenticatedRoute from '../UnauthenticatedRoute/UnauthenticatedRoute';
import AuthenticatedRoute from '../AuthenticatedRoute/AuthenticatedRoute';
import asyncComponent from '../AsyncComponent/AsyncComponent';
import FancyDrop from '../FancyDrop/FancyDrop';
import ImageLogic from '../ImageLogic/ImageLogic';

class Routes extends Component {
    constructor(props) {
        super();
        this.state = {
        };

    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    render() {
        const { childProps } = this.props;
        return (
            <Switch>
                <AppliedRoute exact path="/" component={FancyDrop} props={childProps} />
            </Switch>
        );
    }
}

export default Routes;
