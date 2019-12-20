# iformauth-react

## Currently in Alpha

## installation
```
npm install iformauth-react
```

## Implementation

In App.js

```
import withAuthenticator from 'iformauth-react'

function App() {
  return (.....);
}

const ifbConfig = {
  servername: '<SERVERNAME>',
  client_id: '<CLIENT_ID>',
  redirect_uri: '<DEPLOYMENT URL / localhost >'
}

export default withAuthenticator(App, ifbConfig);
```