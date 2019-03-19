import React, { Component } from "react";

import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { RouteComponentProps } from "react-router-dom";

import api from "../services/cached-web3";
import Table from "@material-ui/core/Table/Table";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TableRow from "@material-ui/core/TableRow/TableRow";
import { TableCell } from "./utils";

const styles = (theme: Theme) => createStyles({
  error: {
    textAlign: "center",
  }
});

interface State {
  address: string;
  count: number;
  balance: string;
  error: boolean;
}

interface Props extends WithStyles<typeof styles>, RouteComponentProps<{ hash: string }> {

}

class Address extends Component<Props, State> {
  constructor(props: Readonly<Props>, context?: any) {
    super(props, context);
    this.showOneAddress(props.match.params.hash);
  }

  showOneAddress(target: string) {
    Promise.all([api.web3.getBalance(target), api.web3.getTransactionCount(target)]).then(([balance, count]) => {
      this.setState({ address: target, balance, count, error: false });
    }).catch((error) => {
      this.setState({ address: target, balance: "", count: 0, error: true });
    });
  }

  render() {
    const { match, classes } = this.props;
    const { address, balance, count, error } = Object.assign({ address: match.params.hash, balance: "", count: 0 } as State, this.state);
    return <Table>
      <TableBody>
        {!error && [<TableRow key={1}>
          <TableCell>Address:</TableCell>
          <TableCell>{address}</TableCell>
        </TableRow>,
        <TableRow key={2}>
          <TableCell>Balance:</TableCell>
          <TableCell>{balance}</TableCell>
        </TableRow>,
        <TableRow key={3}>
          <TableCell>Num. Transactions:</TableCell>
          <TableCell>{count}</TableCell>
        </TableRow>] || <TableRow>
            <TableCell className={classes.error}>
              {error ? `Address ${address} Not Exists` : `Loading Address ${address}`}
            </TableCell>
          </TableRow>
        }
      </TableBody>
    </Table>
  }
}

export default withStyles(styles)(Address);