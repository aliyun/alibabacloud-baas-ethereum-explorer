import React, { Component } from "react";

import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";

const styles = (theme: Theme) => createStyles({
});

export interface State {
}

interface Props extends WithStyles<typeof styles> {
}

class TemplateClass extends Component<Props> {
  render() {
    const { } = this.props;
    return (<p>template</p>)
  }
}

export default withStyles(styles)(TemplateClass);