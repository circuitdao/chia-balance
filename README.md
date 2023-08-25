# Chia key balance 
A convenient way to check your wallet balance for CATs and XCH. Either if your wallet is struggling to sync, you suspect balance is not correct or just want to quickly see if you got any airdrops. It also includes all CAT tails from Tail Database.
Addresses are derived in the browser, so you don't lose any privacy. 

Powered by [`Mojonode SQL`](https://mojonode.com/explorer). Part of [CircuitDAO](https://circuitdao.com) Community tools.


Supported coins:
 - XCH 
 - CATs


# TODOs
 - [ ] decent logo and favicon :) 
 - [ ] add CI/CD and other various Github actions 
 - [ ] improve design and error messages
 - [ ] add support for NFTs
 - [ ] add support for clawback
 - [ ] add support to export transactions for tax purposes
 - [ ] add fee monitor
 - [ ] add notifications
 - [ ] create a PWA and enable push notifications

## Contributing

Once you've cloned the repo, install it with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```
When ready, create a new pull request. Once it's merged to `main`, it's going to be automatically deployed. 

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

