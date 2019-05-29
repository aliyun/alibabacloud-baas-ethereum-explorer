import React, { Component, Fragment } from "react";

import SearchIcon from "@material-ui/icons/Search";
import BallotIcon from "@material-ui/icons/Ballot";
import SubjectIcon from "@material-ui/icons/Subject";

import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import AppBar from "@material-ui/core/AppBar/AppBar";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import Link, { AttachLinkPropsType } from "./Link";
import { RouteComponentProps } from "react-router-dom";
import { History } from "history";
import { IconButton as UiIconButton, Toolbar, Input, Typography, Tooltip } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";

const styles = (theme: Theme) => createStyles({
  title: {
    width: 200,
  },
  grow: {
    flexGrow: 1,
  },
  search: {
    display: "flex",
    flexFlow: "row",
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing.unit,
      width: "auto",
    },
  },
  searchIcon: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.unit,
  },
  inputRoot: {
    width: "100%",
  },
  inputInput: {
    paddingTop: theme.spacing.unit / 4,
    paddingLeft: theme.spacing.unit / 4,
    paddingBottom: theme.spacing.unit / 4,
    paddingRight: theme.spacing.unit / 4,
    transition: theme.transitions.create("width"),
    width: "100%",

    [theme.breakpoints.up("md")]: {
      width: 240,
      "&:focus": {
        width: 360,
      },
    },
  },
  inputTooltip: {
    maxWidth: 300,
    minWidth: 240
  },
});

interface State {
  search: string;
  error: boolean;
}

interface Props extends WithStyles<typeof styles>, RouteComponentProps {

}

const IconButton = AttachLinkPropsType(UiIconButton);

class Navbar extends Component<Props, State> {
  search(search: string, history: History<any>) {
    const match = search.match(/^((b|bl|block):)?([1-9]\d*)$|^((t|tx|b|bl|block):)?(0x[a-f0-9]+)$|^((a|add|address):)?(0x[a-f0-9A-F]+)$/)!;
    if (match[3]) {
      /// block number
      history.push(`/block/${match[3]}`);

    } else if (match[6]) {
      const map = {
        "b": "block",
        "bl": "block",
        "block": "block",
        "t": "tx",
        "tx": "tx",
      };
      /// tx or block hash
      const pre = (map as any)[(match[5]) || location.pathname.split("/")[1]] || "block";
      history.push(`/${pre}/${match[6]}`);
    } else if (match[9]) {
      history.push(`/address/${match[9]}`);
    }
  }

  render() {
    const { classes, location, history } = this.props;
    const { search, error } = Object.assign({ search: "", error: false } as State, this.state);

    return <AppBar>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          {
            (() => {
              if (location.pathname === "/block") {
                return "Block List";
              } else if (location.pathname === "/tx") {
                return "Transaction List";
              } else if (location.pathname.slice(0, 6) === "/block") {
                return "Block";
              } else if (location.pathname.slice(0, 3) === "/tx") {
                return "Transaction";
              } else if (location.pathname.slice(0, 8) === "/address") {
                return "Address";
              }
            })()
          }
        </Typography>
        <div>
          <Tooltip title="Block List">
            <IconButton component={Link} to="/block" aria-label="Block List">
              <BallotIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Transaction List">
            <IconButton component={Link} to="/tx" aria-label="Transaction List">
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        </div>

        <div className={classes.grow}> </div>
        <div className={classes.search}>
          <Tooltip classes={{ tooltip: classes.inputTooltip, }} title={<span style={{ color: "yellow" }}>SUPPORT REGEXP:<br />  ((b|bl|block):)?([1-9]\d*)<br />  ((t|tx|b|bl|block):)?(0x[a-f0-9]+)<br />  ((a|add|address):)?(0x[a-f0-9A-F]+)</span>}>
            <Input spellCheck={false} error={error} type="search" classes={{ root: classes.inputRoot, input: classes.inputInput, }}
              placeholder="Tx Hash, Address, or Block #" value={search}
              onKeyUp={(event) => {
                if (event.key === "Enter" && !error && search.length !== 0) {
                  this.search(search, history);
                }
              }}
              onChange={(event) => {
                const value = event.currentTarget.value.trim();
                const match = value.match(/^((b|bl|block):)?([1-9]\d*)$|^((t|tx|b|bl|block):)?(0x[a-f0-9]+)$|^((a|add|address):)?(0x[a-f0-9A-F]+)$/);
                this.setState({ search: value, error: (!match || !match[0]) && value.length !== 0 });
              }} />
          </Tooltip>
          <IconButton className={classes.searchIcon} disabled={error || search.length === 0} aria-label="Search" onClick={() => {
            this.search(search, history);
          }}>
            <SearchIcon />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  }
}

export default withStyles(styles)(Navbar);