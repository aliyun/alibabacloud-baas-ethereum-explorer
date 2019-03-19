import React, { Component } from "react";

import UiTableCell from "@material-ui/core/TableCell/TableCell";

import CombineLink, { AttachLinkPropsType, LinkPropsType } from "./Link";

import "./utils.css";
import Button from "@material-ui/core/Button";

export const TableCell = AttachLinkPropsType(UiTableCell);

export const Link = (props: LinkPropsType) => {
  const { className, ...other } = props;
  return <TableCell>
    <CombineLink {...other} />
  </TableCell>;
};

export const RefreshButton = Button;

