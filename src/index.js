import React from 'react';
import { API } from 'aws-amplify';
import awsconfig from './src/aws-exports'
import './src/App.css'

const  withAuthenticator = (WrappedComponent, ifbConfig) => {

    API.configure(awsconfig);

    const {servername, client_id, redirect_uri} = ifbConfig

   const buildAuthorizeUrl = ()=> {
        const authorizeUrl = 
         'https://'+servername+'.iformbuilder.com/exzact/api/oauth/auth?client_id='+client_id+'&redirect_uri='+redirect_uri+'&response_type=code'
        return authorizeUrl

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
        const access_token = window.localStorage.getItem('access_token')
        const exp = window.localStorage.getItem('access_token_expiration')

        return (access_token && exp > Date.now())
   }

   const isLoggedIn  = () => {
        if (accessTokenGood()) return true
        else {
            //Just logged in. Go get access_token
            const redirectUrl = window.location.href
            const requestTokenMatch = redirectUrl.match(/code=([^&]+)/)
            if (requestTokenMatch) {
                const requestToken = requestTokenMatch[1]
                
                let myInit = {
                    body: {
                        code: requestToken,
                        redirect_uri: redirect_uri
                    }
                }
                
                API.post('iformapi', '/token', myInit).then (response => {
                    if (response.token){
                        const access_token = response.token.access_token
                        const exp = Date.now() + (response.token.expires_in*1000)
                        window.localStorage.setItem('access_token', access_token)
                        window.localStorage.setItem('access_token_expiration', exp)
                    } 
                    return true
                }).catch(error => {
                    console.log(error)
                    return false
                })
            }
        }
   }


   if (!isLoggedIn()) 
   return class extends React.Component {
        componentDidMount(){
            window.location = buildAuthorizeUrl()
        }
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

export default withAuthenticator

