import Web3 from "web3";


import * as utils from "web3-utils"
import * as web3CoreHelpers from "web3-core-helpers";

import { BatchRequest } from "web3-providers/types";
import { Block as BlockBroken } from "web3-eth/types";
import { Transaction as TransactionBroken, TransactionReceipt } from "web3-core/types";

export interface Transaction extends TransactionReceipt {
  hash: string;
  value: string;
  gas: number;
  gasPrice: string;
  nonce: number;
  input: string;
}

export interface Block extends BlockBroken {
  transactions: Transaction[];
}

const { GetBlockMethod, GetTransactionMethod, GetTransactionReceipt } = require("web3-core-method/dist/web3-core-method.umd");

class CachedWeb3 {
  private _cachedBlockNumber: Array<number> = [];
  private _blockCacheByNumber: Map<number, Block> = new Map();
  private _blockCacheByHash: Map<string, Block> = new Map();
  private _txCacheByHash: Map<string, Transaction> = new Map();

  private _blockNumber = 0;

  constructor(private _web3: Web3) {
  }

  delCache() {
    if (this._cachedBlockNumber.length > 2000) {
      const keys = this._cachedBlockNumber.splice(this._cachedBlockNumber.length - 1000);
      keys.forEach(key => {
        const block = this._blockCacheByNumber.get(key)!;
        this._blockCacheByHash.delete(block.hash);
        this._blockCacheByNumber.delete(key);
        block.transactions.forEach(tx => {
          this._txCacheByHash.delete(tx.hash!);
        });
      });
    }
  }

  addCache(blocks: Block[]) {
    this.delCache();
    blocks.forEach(block => {
      if (this._blockCacheByNumber.has(block.number)) return;
      this._blockNumber = Math.max(this._blockNumber, block.number);
      this._cachedBlockNumber.push(block.number);
      this._blockCacheByNumber.set(block.number, block);
      this._blockCacheByHash.set(block.hash, block);
      block.transactions.forEach((tx: Transaction) => {
        this._txCacheByHash.set(tx.hash!, tx);
      });
    });
  }

  private getBlockFromCache(...targets: Array<string | number>) {
    return targets.map((target) => {
      const N = Number.parseInt(target.toString());
      if (Number.isSafeInteger(N)) {
        return this._blockCacheByNumber.get(target as number)!;
      } else {
        return this._blockCacheByHash.get(target as string)!;
      }
    });
  }

  private getTxFromCache(...targets: Array<string>) {
    return targets.map((target) => {
      return this._txCacheByHash.get(target)!;
    });
  }

  getBlockNumber() {
    return this._blockNumber;
  }

  async getTx(...targets: Array<string>) {
    const buildBatchRequestHelper = () => {
      let batch: BatchRequest = undefined!;
      let count = 0;
      return {
        add: (args: any, ctx: { notGetTransaction?: boolean, notGetTransactionReceipt?: boolean }) => {
          batch = batch || new this._web3.BatchRequest();

          if (!ctx.notGetTransactionReceipt) {
            const getTransactionReceipt = new GetTransactionReceipt(utils, web3CoreHelpers.formatters);
            getTransactionReceipt.arguments = args;
            batch.add(getTransactionReceipt);
            count++;
          }

          if (!ctx.notGetTransaction) {
            const getTransaction = new GetTransactionMethod(utils, web3CoreHelpers.formatters);
            getTransaction.arguments = args;
            batch.add(getTransaction);
            count++;
          }

          return batch;
        },
        execute: () => {
          return batch.execute()
        },
        count: () => {
          return count;
        }
      };
    };

    const batch = buildBatchRequestHelper();

    const result: Array<Transaction> = this.getTxFromCache(...targets).map((val, index) => {
      val = val || {};

      batch.add([targets[index], (error: string | Error, tx: Transaction) => {
        if (error) return;
        tx.gas = tx.gas === 0 ? 0 : (tx.gas || val.gas);
        tx.nonce = tx.nonce || val.nonce;
        tx.gasUsed = tx.gasUsed === 0 ? 0 : (tx.gasUsed || val.gasUsed);
        result[index] = Object.assign(val, tx);
      }], { notGetTransaction: !!val.hash, notGetTransactionReceipt: !!val.transactionHash });

      return val;
    });

    return batch.count() === 0 ? result : batch.execute().then((fn) => {
      if (Array.isArray(fn)) throw new Error(fn.join(","));

      const blockNumbers = Array.from(new Set((fn.response as Transaction[]).map((tx) => {
        return tx.blockNumber;
      })).keys());

      return this.getBlock(...blockNumbers).then((blocks) => {
        result.forEach((item) => {
          const tx = this._txCacheByHash.get(item.hash);
          Object.assign(tx, item);
        });
        return result;
      });
    });
  }

  async getBlock(...targets: Array<number | string>) {
    const buildBatchRequestHelper = () => {
      let batch: BatchRequest = undefined!;
      let count = 0;
      return {
        add: (args: any) => {
          batch = batch || new this._web3.BatchRequest();
          const getBlcok = new GetBlockMethod(utils, web3CoreHelpers.formatters);
          getBlcok.arguments = args;
          count++;
          batch.add(getBlcok);
          return batch;
        },
        execute: () => {
          return batch.execute()
        },
        count: () => {
          return count;
        }
      };
    };

    const batch = buildBatchRequestHelper();

    const result: Array<Block> = this.getBlockFromCache(...targets).map((val, index) => {
      return val || batch.add([targets[index], true, (error: string | Error, block: Block) => {
        !error && (result[index] = block);
      }]) as any;
    });

    return batch.count() === 0 ? result : batch.execute().then((fn) => {
      if (Array.isArray(fn)) throw new Error(fn.join(","));
      this.addCache(fn.response as Block[]);
      return result;
    });
  }

  async getBalance(address: string) {
    return await this._web3.eth.getBalance(address);
  }

  async getTransactionCount(address: string) {
    return await this._web3.eth.getTransactionCount(address);
  }
}


const singleton = {
  web3: undefined! as CachedWeb3,
  reset: (web3: Web3) => {
    singleton.web3 = new CachedWeb3(web3);
  }
};


export default singleton;