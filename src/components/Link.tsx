import React, { Component } from "react";

import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";

import UiLink, { LinkProps as CoreLinkProps } from "@material-ui/core/Link/Link";
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'

const styles = (theme: Theme) => createStyles({
});

interface Props extends WithStyles<typeof styles> {
  to: string;
}

export function AttachLinkPropsType<T>(UI: React.ComponentType<T>) {
  return UI as any as React.ComponentType<RouterLinkProps | CoreLinkProps | T>
};

export type LinkPropsType = RouterLinkProps | CoreLinkProps;
const Link: React.ComponentType<LinkPropsType> = UiLink as any;

class CombineLink extends Component<Props> {
  render() {
    const { children } = this.props;
    return <Link component={RouterLink} {...this.props}>
      {children}
    </Link>
  }
}

export default AttachLinkPropsType(withStyles(styles)(CombineLink));