import hook from "./hook";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

interface State {
  error: boolean;
  loading: boolean;
}

class Root extends Component<{}, State> {
  componentDidMount() {
    Promise.race([
      hook.web3.getBlockNumber(),
      new Promise((resolve, reject) => {
        setTimeout(reject, 3000, new Error(`getBlockNumber timeout`));
      }),
    ]).then(() => {
      this.setState({ loading: false });
    }).catch((err) => {
      this.setState({ error: true, loading: false });
      console.log(err);
    });
  }

  render() {
    const { error, loading } = Object.assign({ error: false, loading: true }, this.state);

    if (loading) {
      return <p style={{ textAlign: "center" }} >Check web3 connect...</p>;
    } else if (error) {
      return <p style={{ textAlign: "center" }} >Connect Ethereum error, check the web3 param, and refresh then.</p>;
    } else {
      return <App />
    }
  }
}

if (hook.web3) {
  ReactDOM.render(<Root />, document.getElementById('root'));
} else {
  ReactDOM.render(<p>web3 is not initialized</p>, document.getElementById('root'));
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
