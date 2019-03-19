
import Web3 from "web3";
import api from "./services/cached-web3";

const param = (() => {
  try {
    return JSON.parse(window.localStorage.getItem("eel")!) || {};
  } catch (e) {
  }
  return {};
})();

(window.location.search.replace("?", "") || window.location.hash.replace(/.-\?/g, "")).split("&").forEach(function (s) { var v = s.split("="); param[v[0]] = v.slice(1).join("="); });

param.host = param.host || window.location.host;
param.token = param.token || undefined;
param.hostname = window.location.host.split(":")[0];
param.port = param.host.split(":")[1] || "80";
if (param.token !== undefined) {
  window.localStorage.setItem("eel", JSON.stringify(param));
}

const provider = new Web3.providers.HttpProvider(
  `http://${param.host}/jwt`,
  {
    headers: [{ name: "Authorization", value: "Bearer " + param.token }]
  }
);

if (provider.constructor.name !== "HttpProvider") {
  /// keep_classnames
  provider.constructor = new Proxy(provider.constructor, {
    get: (target, p, receiver) => {
      if (p === "name") {
        return "HttpProvider";
      }
      return (target as any)[p];
    },
  });
}

const web3 = new Web3(provider);

api.reset(web3);

// eslint-disable-next-line
export default api;