import { combineReducers, createStore } from "redux";

import { Action as ReduxAction } from "redux";
import { listInitState, blockInitState } from "./initState";

import { Dispatch, Action } from "redux";

/// action
const createAction = <T>(type: T) => {
  return <S>(value: { [key in keyof S]?: S[key] }) => ({
    type,
    ...value,
  });
};

/// reducer
export const createDataService = <K, S, A>(key: K, initState: S, builder: A) => {
  return {
    key,
    reducer: (state: S | any, action: ReduxAction<symbol>): S => {
      const { type, ...other } = action;
      if (!(builder as any)[type]) {
        return Object.assign(initState, state) as S;
      } else {
        return Object.assign({}, state, other) as S;
      }
    },
    mapStateToProps: <T>(state: { /*[[key]]: S*/ }, props: T): T => {
      return {
        ...props,
        ...(state as any)[key],
      };
    },
    mapDispatchToProps: <R>(createDispatch: (builder: A) => (dispatch: Dispatch<Action>, props: any) => R) => {
      const dispatcher = createDispatch(builder);
      return dispatcher;
    },
  };
};

export const ShowBlockListAction = Symbol();
export const commonListDataService = createDataService("list", listInitState, {
  [ShowBlockListAction]: createAction(ShowBlockListAction),
});

export const ShowBlockAction = Symbol();
export const blockDataService = createDataService("block", blockInitState, {
  [ShowBlockAction]: createAction(ShowBlockAction),
});

const reducers = combineReducers({
  [commonListDataService.key]: commonListDataService.reducer,
  [blockDataService.key]: blockDataService.reducer,
});

export const store = createStore(reducers);