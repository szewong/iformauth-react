import { iformConfig } from './config';

const _setLocal = (key, value)=>{ window.localStorage.setItem(key, value) }

const _getLocal = (key)=>{ return window.localStorage.getItem(key) }

const _removeLocal = (key)=>{ window.localStorage.removeItem(key) }

const _token = (code)=>{
    const redirect_uri = _getLocal(iformConfig.REDIRECT_KEY);
    const body = { code: code, redirect_uri: redirect_uri};
    _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/token`, method:'post',body: body})
    .then (response => {
         if (response.token){
            _setLocal(iformConfig.ACCESSTOKEN_KEY, response.token.access_token)
            _setLocal(iformConfig.ACCESSTOKEN_EXP_KEY,  Date.now() + (response.token.expires_in*1000))
         } 
        return window.location.href = redirect_uri;
    }).catch(error => {
        console.log(error)
    })
}

const _authenticate = ()=>{
    const redirect_uri = _getLocal(iformConfig.REDIRECT_KEY);
    _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/authenticate?redirect_uri=${redirect_uri}`, method: 'get'})
    .then (response => {
        if (response.redirect_url) return window.location.href = response.redirect_url;
    }).catch(error => {
        console.log(error)
    })
}

const _isValidToken = () =>{
    const access_token = _getLocal(iformConfig.ACCESSTOKEN_KEY);
    const exp = _getLocal(iformConfig.ACCESSTOKEN_EXP_KEY);
    return (access_token && exp > Date.now());
}

const _isAuthenticated  = () => {
    if (_isValidToken()) return true;
    _removeLocal(iformConfig.ACCESSTOKEN_EXP_KEY);
    _removeLocal(iformConfig.ACCESSTOKEN_KEY);
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) _token(code);
    else _authenticate();
    return false;
}

const _logout = () => {
    _removeLocal(iformConfig.ACCESSTOKEN_EXP_KEY);
    _removeLocal(iformConfig.ACCESSTOKEN_KEY);
    const redirect_uri = _getLocal(iformConfig.REDIRECT_KEY);
    _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/logout?redirect_uri=${redirect_uri}`, method: 'get'})
    .then (response => {
        if (response.redirect_url) return window.location.href = response.redirect_url;
    }).catch(error => {
        console.log(error)
    })

}

const _sendAPI =  (path, method, body)=>{
    let token = _getLocal(iformConfig.ACCESSTOKEN_KEY);
    let apiKey = _getLocal(iformConfig.API_KEY);
    let options = { 
            method: method, 
            headers: {'Content-Type': 'application/json' }
        };
    if(body) options.body = JSON.stringify(body);
    if(token) options.headers.Authorization = `Bearer ${token}`;
    if(apiKey) options.headers['x-api-key'] = apiKey;

    return new Promise((resolve, reject)=>{
        fetch(iformConfig.endpoint + path, options)
        .then(res=> {
            if(!res.ok) throw(res);
            res.json().then(data=> resolve(data));
        })
        .catch(err=>{
            let status = err.status;
            if(status ==401) {
                _removeLocal(iformConfig.ACCESSTOKEN_KEY);
                _removeLocal(iformConfig.ACCESSTOKEN_EXP_KEY);
                window.location.href = _getLocal(iformConfig.REDIRECT_KEY);
            }
            err.json().then(data=>reject(data.error));
        })
    })
}


const _sendInternal = (option)=>{
    let {path, method, body} = option;
    if(!path) return new Error('Property "path" is required');
    if(!method) return new Error('Property "method" is required');
    method = method.toLowerCase();
    if(["post", "put", "get", "delete"].indexOf(method)<-1) return new Error('Invalid "method" value! Value allowance: ["POST", "PUT", "DELETE", "GET"]');
    if((method == "post" || method =="put")&& !body) return new Error('Property "body" is required');
    return _sendAPI(path, method, body);
}

const IformRequest  = {
    isAuthenticated: _isAuthenticated,

    logout: _logout,

    send: (option) => _sendInternal(option),

    get: (path)=> _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/api${(path[0]!="/"?"/":"")}${path}`, method: 'get'}),

    post: (path, body)=> _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/api${(path[0]!="/"?"/":"")}${path}`, method: 'post', body: body}),
    
    put: (path, body)=> _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/api${(path[0]!="/"?"/":"")}${path}`, method: 'put', body: body}),

    delete: (path, body)=> _sendInternal({path: `/${_getLocal(iformConfig.SERVERNAME_KEY)}/${_getLocal(iformConfig.IFORM_ENV_KEY)}/api${(path[0]!="/"?"/":"")}${path}`, method: 'delete', body: body}),

    configure: (config)=>{
        let {servername, iform_env, redirect_uri, apiKey} = config;
        if(!servername) throw new Error('Property "servername" is required');    
        if(!apiKey) throw new Error('Property "apiKey" is required');    
        if(!redirect_uri) redirect_uri = window.location.href.split("?")[0];
        config.redirect_uri = redirect_uri;
        _setLocal(iformConfig.IFORM_ENV_KEY, (iform_env?iform_env:iformConfig.iform_env));
        _setLocal(iformConfig.SERVERNAME_KEY, servername);
        _setLocal(iformConfig.REDIRECT_KEY, redirect_uri);
        _setLocal(iformConfig.API_KEY, apiKey);
    }
}

export { IformRequest }
