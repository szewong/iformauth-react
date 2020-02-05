import React from 'react';
import { IformRequest } from './iformRequest';
import './App.css';

const  withAuthenticator = (WrappedComponent, ifbConfig) => {
    let {servername, redirect_uri} = ifbConfig;
    IformRequest.configure(ifbConfig);
    
   /* 
    * Logout does not work yet
    *
   const buildLogoutUrl = ()=> {
    const logoutUrl = 
     'https://'+servername+'.iformbuilder.com/exzact/logoutZWS.php?redirect='+redirect_uri
    return logoutUrl
    } 
    */

   if (!IformRequest.isAuthenticated()) 
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

