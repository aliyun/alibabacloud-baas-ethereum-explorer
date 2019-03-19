# Alibaba Cloud Ethereum Explorer Light
A simple ethereum block and transaction explorer. 

## Setup
### Pre dependencies
1.  install nodejs (recommend >= 10)
2.  install yarn (recommend >= 1.13)

### Install dependencies
```bash
yarn install
```

### Development
```bash
yarn run start
```

### Production
```bash
# set the value of the environment variable PUBLIC_URL
yarn run build
```

## Others
### Set the web3js authentication
> Modify ./src/hook.ts, using query string and jwt currently.

### Technology stack
1.  React & React-Router & Redux
2.  Web3
3.  Typescript
4.  Material-UI