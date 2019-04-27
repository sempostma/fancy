import React from 'react';
import './App.css';
import FancyDrop from '../FancyDrop/FancyDrop';

const childProps = {
  isAuthenticated: true,
  userHasAuthenticated: true
};

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}

      <FancyDrop />
      {/* <HashRouter>
        <Routes childProps={childProps} />
      </HashRouter> */}
    </div>
  );
}

export default App;
