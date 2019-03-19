import React, { Component } from "react";
import TableRow from "@material-ui/core/TableRow/TableRow";
import { TableCell, Link } from "./utils";
import { Block } from "../services/cached-web3";

import AttachCommonList, { CommonList } from "./CommonList";

class TxList extends CommonList {
  protected renderHead() {
    return <TableRow>
      <TableCell>Hash</TableCell>
      <TableCell>Block</TableCell>
      <TableCell>Index</TableCell>
      <TableCell>From</TableCell>
      <TableCell>To</TableCell>
      <TableCell>Value</TableCell>
      <TableCell>Timestamp</TableCell>
      <TableCell>Gas</TableCell>
    </TableRow>;
  }

  protected renderColumnCount() {
    return 8;
  }

  protected renderBody(blocks: Array<Block>, target: string | number, limit: number) {
    const list = blocks.map((block) => {
      return block.transactions.map((tx, index) => {
        return <TableRow key={`${block.number},${index}`}>
          <TableCell component={Link} to={`/block/${block.hash}?tx=${tx.hash}`}>{tx.hash}</TableCell>
          <TableCell component={Link} to={`/block/${block.hash}`}>{block.number}</TableCell>
          <TableCell>{index}</TableCell>
          <TableCell component={Link} to={`/address/${tx.from}`}>{tx.from}</TableCell>
          <TableCell component={Link} to={`/address/${tx.to}`}>{tx.to}</TableCell>
          <TableCell>{tx.value}</TableCell>
          <TableCell>{new Date(block.timestamp * 1000).toLocaleString()}</TableCell>
          <TableCell>{tx.gas}</TableCell>
        </TableRow>
      });
    }).reduce((p, c) => p.concat(...c), []);
    if (list.length !== 0) return list;
    if (this.props.request === "doing") {
      return <TableRow>
        <TableCell colSpan={8} style={{ textAlign: "center" }}>{`loading transaction in block(${target} ${limit})`}</TableCell>
      </TableRow>;
    }

    return <TableRow>
      <TableCell colSpan={8} style={{ textAlign: "center" }}>{`transaction in block(${blocks.map(block => block.number).join(", ")}) not exists`}</TableCell>
    </TableRow>;
  }
}

export default AttachCommonList(TxList);