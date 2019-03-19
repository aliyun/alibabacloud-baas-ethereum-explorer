import React, { Component } from "react";
import Navbar from "./components/Navbar";
import createStyles from "@material-ui/core/styles/createStyles";
import withStyles, { WithStyles, CSSProperties } from "@material-ui/core/styles/withStyles";
import { Redirect } from "react-router";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import BlockList from "./components/BlockList";
import TxList from "./components/TxList";
import Block from "./components/Block";

import Address from "./components/Address";
import { Theme, MuiThemeProvider } from "@material-ui/core";
import { Provider } from "react-redux";

import { store } from "./data-service";

import globalTheme from "./theme";

const minWidth = 1400;

const styles = (theme: Theme) => createStyles({
  root: {
    minWidth: minWidth,
  },
  body: {
    paddingTop: 80,
    marginLeft: theme.spacing.unit * 5,
    marginRight: theme.spacing.unit * 5,
  },
});


class App extends Component<WithStyles<typeof styles>> {
  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={globalTheme}>
        <Provider store={store}>
          <Router>
            <div className={classes.root}>
              <Route path="/" component={Navbar} className={classes.root} />
              <div className={classes.body}>
                <Switch>
                  <Route exact path="/block" component={BlockList} />
                  <Route exact path="/block/:hash" component={Block} />
                  <Route exact path="/tx" component={TxList} />
                  <Route exact path="/address/:hash" component={Address} />
                  <Redirect to="/block" />
                </Switch>
              </div>
            </div>
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
