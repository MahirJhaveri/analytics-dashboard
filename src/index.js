import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import "bootstrap/dist/css/bootstrap.css";
import Navbar from './navbar';

import { Container } from './styled-components';



class Welcome extends React.Component {
  render() {
    return <h1>Analytics Dashboard</h1>
  }
}

ReactDOM.render(
  <Container>
    <Navbar />
    <App />
  </Container>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
