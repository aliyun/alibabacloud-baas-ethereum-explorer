
import { State as BlockInitState } from "../components/Block";
import { State as CommonListInitState } from "../components/CommonList";

export const listInitState: CommonListInitState = {
  target: "latest",
  limit: -20,
  count: 1,
  blocks: [],
  request: "done",
};

export const blockInitState: BlockInitState = {
  target: "latest",
  block: undefined!,
  count: 1,
  phase: 0,
};