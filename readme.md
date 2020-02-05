# iformauth-react

## Currently in Alpha

## installation
```
npm install iformauth-react
```

## Implementation

In App.js

```
{ withAuthenticator } from 'iformauth-react'

function App() {
  return (.....);
}

const config = { servername: "loadapp" }

export default withAuthenticator(App, ifbConfig);
```


Using API calls:

```
import { IformRequest } from 'iformauth-react';

IformRequest.get('profiles/10845/pages/290817343/records/10')
	.then(res=>{...})
	.catch(err=>{...})

IformRequest.put('profiles/10845/pages/290817343/records/10', body)
	.then(res=>{...})
	.catch(err=>{...})

IformRequest.post('profiles/10845/pages/290817343/records', body)
	.then(res=>{...})
	.catch(err=>{...})

IformRequest.delete('profiles/10845/pages/290817343/records/10')
	.then(res=>{...})
	.catch(err=>{...})
```