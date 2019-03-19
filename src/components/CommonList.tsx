import React, { Component } from "react";

import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import Table from "@material-ui/core/Table/Table";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TablePagination from "@material-ui/core/TablePagination/TablePagination";
import Button from "@material-ui/core/Button";
import Refresh from '@material-ui/icons/Refresh';

import api, { Block } from "../services/cached-web3";
import { TableCell, Link, RefreshButton } from "./utils";
import { connect } from "react-redux";
import { Dispatch, Action as ReduxAction } from "redux";
import { commonListDataService, ShowBlockListAction } from "../data-service";
import { RouteComponentProps } from "react-router-dom";

import { Action, UnregisterCallback, Location } from "history";

const styles = (theme: Theme) => createStyles({
  refreshIcon: {
    marginLeft: theme.spacing.unit,

    animationName: "refresh",
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});

export interface State {
  target: string | number;
  count: number;
  limit: number;
  blocks: Array<Block>;
  request: "doing" | "done";
}

interface Props extends WithStyles<typeof styles>, State, RouteComponentProps<{}> {

}

const mapDispatchToProps = commonListDataService.mapDispatchToProps(builder => {
  return (dispatch: Dispatch<ReduxAction>, props: Props) => {
    const queue: Array<{ target: number | string; limit: number }> = [];
    return {
      showBlock: async (target: number | string, limit: number) => {
        if (typeof target === "number") {
          if (target > api.web3.getBlockNumber()) {
            target = "latest";
          } else if (target < Math.abs(limit)) {
            target = Math.abs(limit) - 1;
          }
        }

        if (queue.push({ target, limit }) !== 1) return;

        dispatch(builder[ShowBlockListAction]<State>({ limit, request: "doing", target, count: api.web3.getBlockNumber() }));
        setImmediate(async () => {
          for (let length = queue.length, { target, limit } = queue[length - 1];
            length > 0;
            length = queue.length, { target, limit } = queue[length - 1]) {

            if (typeof target === "number") {
              if (target > api.web3.getBlockNumber()) {
                target = "latest";
              } else if (target < Math.abs(limit)) {
                target = Math.abs(limit) - 1;
              }
            }

            if (typeof target === "string" || !Number.isInteger(target)) {
              const [block] = await api.web3.getBlock(target, "latest");
              target = block.number < Math.abs(limit) ? Math.abs(limit) - 1 : block.number;
            }
            const count = api.web3.getBlockNumber();

            const top = limit > 0 ? Math.min(target, count): Math.max(target, 0);
            const sign = limit / Math.abs(limit);

            const targets = new Array(Math.abs(limit)).fill(0).map((_, index) => {
              return top + sign * index;
            });

            const blocks = await api.web3.getBlock(...targets);
            if (length === queue.length) {
              dispatch(builder[ShowBlockListAction]<State>({ target, blocks, count, request: "done" }));
              queue.splice(0);
              break;
            }
          }
        });
      },
    };
  };
});

type Infer<T> = T extends (dispatch: Dispatch<ReduxAction>, props: Props) => infer U ? U : T;

export abstract class CommonList extends Component<Props & Infer<typeof mapDispatchToProps>> {
  private _unregisterCallback: UnregisterCallback = undefined!;

  constructor(props: Readonly<Props & Infer<typeof mapDispatchToProps>>, context?: any) {
    super(props, context);

    this._unregisterCallback = this.props.history.listen(this.historyListener.bind(this));
    this.historyListener(undefined!, undefined!);
  }

  private historyListener(location: Location, action: Action) {
    const params = this.props.location.search.slice(1).split(/[&=]/g);
    const map: Map<string, string> = new Map(params.map((val: string, index: number, array: Array<string>) => {
      return index % 2 === 0 ? [val, array[index + 1]] : [] as any;
    }).values());

    const range = map.get("range") || "";

    const [target, limit] = range.trim().split(",");
    this.props.showBlock(target || this.props.target, Number.parseInt(limit) || this.props.limit);
    target && window.scrollTo({ top: 0 });
  }

  componentWillUnmount() {
    this._unregisterCallback();
  }

  protected abstract renderColumnCount(): number;
  protected abstract renderHead(): JSX.Element;
  protected abstract renderBody(blocks: Array<Block>, target: string | number, limit: number): Array<JSX.Element> | JSX.Element;

  render() {
    const { classes, target, limit, count, blocks, request } = this.props;
    const head = this.renderHead();
    const body = this.renderBody(blocks, target, limit);

    const rowsPerPage = Math.abs(limit);
    const rowCount = 3 * rowsPerPage;
    const page = target === count ? 0 : (target === rowsPerPage - 1 ? rowCount/rowsPerPage - 1 : 1);

    return <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={1}>
            <Button variant="outlined" onClick={() => {
              this.props.showBlock(count === target ? "latest" : target, limit);
            }}>
              Refresh
              <Refresh style={{ animationPlayState: request === "done" ? "paused" : "running" }} className={classes.refreshIcon} />
            </Button>
          </TableCell>
          <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            scope="col"
            labelRowsPerPage={`block per page:`}
            colSpan={this.renderColumnCount() - 1}
            count={rowCount}
            labelDisplayedRows={(param) => `${target} ${limit} of ${count}`}
            rowsPerPage={rowsPerPage}
            page={page}
            SelectProps={{
              native: true,
            }}
            onChangePage={(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
              if (typeof target === "number") {
                this.props.showBlock(target + (newPage - page) * limit, limit);
              }
            }}
            onChangeRowsPerPage={(element) => {
              this.props.showBlock(target, (limit > 0 ? 1 : -1) * Number.parseInt(element.target.value));
            }}
          />
        </TableRow>
        {head}
      </TableHead>
      <TableBody>
        {body}
      </TableBody>
    </Table>
  }
}

export default function <T>(List: T) {
  const C = withStyles(styles)(List as any);
  return connect(commonListDataService.mapStateToProps, mapDispatchToProps)(C);
}