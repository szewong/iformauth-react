import React from 'react';
import { API } from 'aws-amplify';
import awsconfig from './src/aws-exports';
import './src/App.css';

const ACCESSTOKEN_KEY = 'access_token';
const ACCESSTOKEN_EXP_KEY = 'access_token_expiration';
const SERVERNAME_KEY = 'servername';
const REDIRECT_KEY = 'redirect_uri';
const _setLocal = (key, value)=>{
    window.localStorage.setItem(key, value);
}

const _getLocal = (key)=>{
    return window.localStorage.getItem(key);
}

const _removeLocal = (key)=>{
    window.localStorage.removeItem(key);
}

const getAPIPath =(path)=>{
    if(path[0]!="/") path = "/" + path ;
    return `/${_getLocal(SERVERNAME_KEY)}/api` + path;
}

const sendAPI =  (path, method, body)=>{
    let token = _getLocal(ACCESSTOKEN_KEY);
    let options = { headers: {'Content-Type': 'application/json' } };
    if(body) options.body = body;
    if(token) options.headers.Authorization = `Bearer ${token}`;
    return new Promise((resolve, reject)=>{
        API[method]('iformapi', path, options)
        .then(res=> resolve(res))
        .catch(err=>{
            if(err.response && err.response.status && err.response.status == 401){
                _removeLocal(ACCESSTOKEN_EXP_KEY);
                _removeLocal(ACCESSTOKEN_KEY);
                const url = _getLocal(REDIRECT_KEY);
                if(url) window.location.href = url;
            }
            reject(err);
        })
    })
}

const sendInternal = (option)=>{
    let {path, method, body} = option;
    if(!path) return new Error('Property "path" is required');
    if(!method) return new Error('Property "method" is required');
    method = method.toLowerCase();
    if(["post", "put", "get", "delete", "del"].indexOf(method)<-1) return new Error('Invalid "method" value! Value allowance: ["POST", "PUT", "DELETE", "GET"]');
    if((method == "post" || method =="put")&& !body) return new Error('Property "body" is required');
    if(method=="delete") method ="del";
    return sendAPI(getAPIPath(path), method, body);
}

const IformRequest = {
    send: (option) => sendInternal(option),

    get: (path)=>sendInternal({path: path, method: 'get'}),

    post: (path, body)=>sendInternal({path: path, method: 'post', body: body}),
    
    put: (path, body)=>sendInternal({path: path, method: 'put', body: body}),

    delete: (path, body)=>sendInternal({path: path, method: 'del', body: body})
}


const  withAuthenticator = (WrappedComponent, ifbConfig) => {
    let {servername, client_id, redirect_uri} = ifbConfig;
    if(!servername) throw new Error('Property "servername" is required');    
    if(!redirect_uri){ 
        ifbConfig.redirect_uri = window.location.href.split("?")[0];
        redirect_uri = ifbConfig.redirect_uri;
    }
    API.configure(awsconfig);
    _setLocal(SERVERNAME_KEY, servername);
    _setLocal(REDIRECT_KEY, redirect_uri);

    const authenticate = ()=> {
        sendAPI(`/${servername}/authenticate?redirect_uri=${redirect_uri}`,'get').then (response => {
            if (response.redirect_url) return window.location.href = response.redirect_url;
        }).catch(error => {
            console.log(error)
        })
    } 


    const token = (code)=>{
        const body = { code: code, redirect_uri: redirect_uri};
        sendAPI(`/${servername}/token`,'post',body).then (response => {
            if (response.token){
                _setLocal(ACCESSTOKEN_KEY, response.token.access_token)
                _setLocal(ACCESSTOKEN_EXP_KEY,  Date.now() + (response.token.expires_in*1000))
            } 
            return window.location.href = redirect_uri;
        }).catch(error => {
            console.log(error)
        })
    }

   /* 
    * Logout does not work yet
    *
   const buildLogoutUrl = ()=> {
    const logoutUrl = 
     'https://'+servername+'.iformbuilder.com/exzact/logoutZWS.php?redirect='+redirect_uri
    return logoutUrl
    } 
    */

   const accessTokenGood = () =>{
        const access_token = _getLocal(ACCESSTOKEN_KEY)
        const exp = _getLocal(ACCESSTOKEN_EXP_KEY)
        return (access_token && exp > Date.now())
   }

   const isLoggedIn  = () => {
        if (accessTokenGood()) return true;
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) token(code);
        else authenticate();
        return false;
   }

   if (!isLoggedIn()) 
    return class extends React.Component {
        render(){
            return (
                <div className="App">
                <header className="App-header">
                    Redirecting...
                </header>
              </div>
            )
        }
    }
    return class extends React.Component {
      render() {
        return (
        <div>
            {/*<a href={buildLogoutUrl()}>LOGOUT</a>*/}
            <WrappedComponent {...this.props} />
        </div>
        )
        }
    }
}

export  { withAuthenticator,  IformRequest }

