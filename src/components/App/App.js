import React from 'react';
import './App.css';
import FancyDrop from '../FancyDrop/FancyDrop';
import FancyBarCode from '../FancyBarCode/FancyBarCode';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const childProps = {
  isAuthenticated: true,
  userHasAuthenticated: true
};

function App() {
  return (
    <div className="App">
      <h1 className="app-title">Fancy</h1>
      <section className="container">
        <div className="scrolling-content">
          <FancyDrop />
          <FancyBarCode />
        </div>
      </section>
      <div className="container-after" />
      <ToastContainer />
    </div>
  );
}

export default App;
