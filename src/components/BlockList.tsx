import React from "react";
import TableRow from "@material-ui/core/TableRow/TableRow";
import { TableCell, Link } from "./utils";
import { Block } from "../services/cached-web3";

import AttachCommonList, { CommonList } from "./CommonList";

class BlockList extends CommonList {
  protected renderHead() {
    return <TableRow>
      <TableCell>Hash</TableCell>
      <TableCell>Block</TableCell>
      <TableCell>Transaction</TableCell>
      <TableCell>Date</TableCell>
      <TableCell>Miner</TableCell>
    </TableRow>;
  }

  protected renderColumnCount() {
    return 5;
  }

  protected renderBody(blocks: Array<Block>, target: string | number, limit: number) {
    return blocks.map((block) => {
      return <TableRow key={block.number}>
        <TableCell component={Link} to={`/block/${block.hash}`}>{block.hash}</TableCell>
        <TableCell>{block.number}</TableCell>
        <TableCell>{block.transactions.length}</TableCell>
        <TableCell>{new Date(block.timestamp * 1000).toLocaleString()}</TableCell>
        <TableCell component={Link} to={`/address/${block.miner}`}>{block.miner}</TableCell>
      </TableRow>
    });
  }
}

export default AttachCommonList(BlockList);