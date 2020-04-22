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

const ifbConfig = { 
	servername: "loadapp",
	apiKey: "XXXXXXX"
	iform_env: "(OPTIONAL)iformbuilder",
	redirect_uri: "(OPTIONAL)"	
 }

export default withAuthenticator(App, ifbConfig);
```


Using API calls:

```
import { IformRequest } from 'iformauth-react';

IformRequest.get('/v60/profiles/10845/pages/290817343/records/10')
	.then(res=>{...})
	.catch(err=>{...})

IformRequest.put('/v60/profiles/10845/pages/290817343/records/10', body)
	.then(res=>{...})
	.catch(err=>{...})

IformRequest.post('/v60/profiles/10845/pages/290817343/records', body)
	.then(res=>{...})
	.catch(err=>{...})

IformRequest.delete('/v60/profiles/10845/pages/290817343/records/10')
	.then(res=>{...})
	.catch(err=>{...})
```