import React, { Component, Fragment, RefObject, DOMElement, Ref } from "react";

import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import Table from "@material-ui/core/Table/Table";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TablePagination from "@material-ui/core/TablePagination/TablePagination";

import api, { Block, Transaction } from "../services/cached-web3";
import { TableCell, Link } from "./utils";
import TextField from "@material-ui/core/TextField/TextField";
import CombineLink from "./Link";
import { connect } from "react-redux";
import { Dispatch, Action as ReduxAction } from "redux";
import { blockDataService, ShowBlockAction } from "../data-service";
import { RouteComponentProps } from "react-router-dom";

import { Action, UnregisterCallback, Location } from "history";
import { Typography, RootRef, Link as UiLink } from "@material-ui/core";

const styles = (theme: Theme) => createStyles({
  transaction: {
    borderStyle: "ridge",
    borderSpacing: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3,
  },
});

export interface State {
  target: string | number;
  block: Block;
  count: number;
  phase: number;
}

interface Props extends WithStyles<typeof styles>, State, RouteComponentProps<{ hash: string }> {

}

const mapDispatchToProps = blockDataService.mapDispatchToProps(builder => {
  return (dispatch: Dispatch<ReduxAction>, props: Props) => {
    return {
      showBlock: async (target: number | string) => {
        if (typeof target === "number") {
          if (target > api.web3.getBlockNumber()) {
            target = "latest";
          } else if (target < 0) {
            target = 0;
          }
        }

        dispatch(builder[ShowBlockAction]<State>({ target, count: api.web3.getBlockNumber(), phase: 0 }));

        if (typeof target === "string" || !Number.isInteger(target)) {
          const [block] = await api.web3.getBlock(target, "latest");
          target = block.number;
        }

        {
          const [block] = await api.web3.getBlock(target);
          dispatch(builder[ShowBlockAction]<State>({ target, block, count: api.web3.getBlockNumber(), phase: 1 }));

          await api.web3.getTx(...block.transactions.map(tx => {
            return tx.hash;
          }));
        }
        const [block] = await api.web3.getBlock(target);
        dispatch(builder[ShowBlockAction]<State>({ target, block, count: api.web3.getBlockNumber(), phase: 2 }));
      },
    };
  };
});

type Infer<T> = T extends (dispatch: Dispatch<ReduxAction>, props: Props) => infer U ? U : T;

type CommonetProps = Props & Infer<typeof mapDispatchToProps>;
export class BlockDetail extends Component<CommonetProps> {
  private _unregisterCallback: UnregisterCallback = undefined!;
  private _dealyTimer = new Date();
  private _dealyProps: CommonetProps = undefined!;

  constructor(props: Readonly<CommonetProps>, context?: any) {
    super(props, context);

    this._unregisterCallback = this.props.history.listen(this.historyListener.bind(this));
    this.historyListener(undefined!, undefined!);
  }

  private historyListener(location: Location, action: Action) {
    this.props.showBlock(this.props.match.params.hash);
  }

  componentDidUpdate(prevProps: CommonetProps, prevState: {}, snapshot?: any) {
    if (prevProps.phase === 2 && prevProps.match.params.hash === prevProps.block.hash) {
      const params = this.props.location.search.slice(1).split(/[&=]/g);
      const map: Map<string, string> = new Map(params.map((val: string, index: number, array: Array<string>) => {
        return index % 2 === 0 ? [val, array[index + 1]] : [] as any;
      }).values());

      const tx = map.get("tx") || "";
      const show = tx && document.getElementById(tx);
      if (!show) return;
      show.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }

  componentWillUnmount() {
    this._unregisterCallback();
  }

  shouldComponentUpdate(nextProps: CommonetProps, nextState: {}, nextContext: any): boolean {
    if (nextProps.block && nextProps.block.hash && nextProps.phase === 0) {
      const timer = this._dealyTimer = new Date();
      this._dealyProps = nextProps;
      setTimeout(() => {
        if (timer === this._dealyTimer) this.setState(this._dealyProps);
      }, 500);
      return false;
    }
    return true;
  }

  render() {
    const { classes, target, count, block, phase } = this.props;
    let key = 0;

    const rowsPerPage = 1;
    const rowCount = 3 * rowsPerPage;
    const page = target === count ? 0 : (target === rowsPerPage - 1 ? rowCount/rowsPerPage - 1 : 1);

    const refs: Array<RefObject<HTMLTableElement>> = [];
    const blockRef = React.createRef<HTMLTableElement>();
    const transactions = phase === 2 && block.transactions.map((tx, index) => {
      const ref = React.createRef<HTMLTableElement>();
      refs.push(ref);
      return <Fragment key={index}>
        <RootRef rootRef={ref}>
          <Table className={classes.transaction} id={tx.hash}>
            <TableBody >
              <TableRow >
                <TableCell>Hash:</TableCell>
                <TableCell>{tx.hash} (<CombineLink to={`/tx?range=${block.hash}`}>
                  show in list
                </CombineLink>)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date:</TableCell>
                <TableCell>{new Date(block.timestamp * 1000).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Receipt Status:</TableCell>
                <TableCell>{tx.status ? "true" : "false"}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Block Hash:</TableCell>
                <TableCell><UiLink style={{ cursor: "pointer" }} onClick={() => {
                  blockRef.current!.scrollIntoView({ block: "start", behavior: "auto" });
                }}>{tx.blockHash}</UiLink></TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Block Number:</TableCell>
                <TableCell><UiLink style={{ cursor: "pointer" }} onClick={() => {
                  blockRef.current!.scrollIntoView({ block: "start", behavior: "auto" });
                }}>{tx.blockNumber}</UiLink></TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Transaction Index:</TableCell>
                <TableCell>{tx.transactionIndex}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>From:</TableCell>
                <TableCell component={Link} to={`/address/${tx.from}`}>{tx.from}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>To:</TableCell>
                <TableCell component={Link} to={`/address/${tx.to}`}>{tx.to}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Gas:</TableCell>
                <TableCell>{tx.gas}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Gas Price:</TableCell>
                <TableCell>{tx.gasPrice}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Gas Used:</TableCell>
                <TableCell>{tx.gasUsed}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Nonce:</TableCell>
                <TableCell>{tx.nonce}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Value:</TableCell>
                <TableCell>{tx.value}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell>Input:</TableCell>
                <TableCell>{tx.input}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </RootRef>
        <br />
        <br />
      </Fragment>
    }) || [];

    return <Fragment>
      <RootRef rootRef={blockRef}>
        <Table>
          <TableHead>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[1]}
                scope="col"
                labelRowsPerPage={`block per page:`}
                colSpan={2}
                labelDisplayedRows={(param) => `${target} of ${count}`}
                count={rowCount}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  native: true,
                }}
                onChangePage={(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
                  if (typeof target === "number") {
                    this.props.showBlock(target + (newPage - page) * -1 );
                  }
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {
              phase === 0 ? <TableRow>
                <TableCell colSpan={2} style={{ textAlign: "center" }}>{`loading block (${target})`}</TableCell>
              </TableRow> : [
                  <TableRow key={key++}>
                    <TableCell>Hash:</TableCell>
                    <TableCell>{block.hash} (<CombineLink to={`/block?range=${block.hash}`}>
                      show in list
                </CombineLink>)</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Date:</TableCell>
                    <TableCell>{new Date(block.timestamp * 1000).toLocaleString()}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Number:</TableCell>
                    <TableCell>{block.number}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Parent:</TableCell>
                    <TableCell component={Link} to={`/block/${block.parentHash}`} >{block.parentHash}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Nonce:</TableCell>
                    <TableCell>{block.nonce}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Miner:</TableCell>
                    <TableCell component={Link} to={`/address/${block.miner}`} >{block.miner}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Difficulty:</TableCell>
                    <TableCell>{block.difficulty}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Total Difficulty:</TableCell>
                    <TableCell>{block.totalDifficulty}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Gas Limit:</TableCell>
                    <TableCell>{block.gasLimit}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Gas Used:</TableCell>
                    <TableCell>{block.gasUsed}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Size:</TableCell>
                    <TableCell>{block.size}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Transactions:</TableCell>
                    <TableCell>{block.transactions.map((tx, index) => {
                      return <div key={index}>{index}. <UiLink style={{ cursor: "pointer" }} onClick={() => {
                        refs[index].current!.scrollIntoView({ block: "center", behavior: "auto" });
                      }}>{tx.hash}</UiLink></div>;
                    }) || block.transactions.length}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Num. Uncles:</TableCell>
                    <TableCell>{block.uncles.length}</TableCell>
                  </TableRow>,
                  <TableRow key={key++}>
                    <TableCell>Extra Data:</TableCell>
                    <TableCell><TextField variant="outlined" multiline disabled fullWidth value={block.extraData} /></TableCell>
                  </TableRow>
                ]}
          </TableBody>
        </Table>
      </RootRef>
      {
        phase === 2 && block.transactions.length && <Fragment>
          <Typography variant="h5" style={{ textAlign: "center", marginTop: 48, marginBottom: 24 }}>Transaction In Block {block.hash}</Typography>
          {
            transactions
          }
        </Fragment> || undefined
      }
    </Fragment>

  }
}

export default connect(blockDataService.mapStateToProps, mapDispatchToProps)(withStyles(styles)(BlockDetail));
