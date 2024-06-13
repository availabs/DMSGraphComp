import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { API_HOST, AUTH_HOST, PROJECT_NAME, CLIENT_HOST } from './config'

import { Provider } from 'react-redux';
import store from '~/store';

import PPDAF_THEME from "./theme"
import { ThemeContext } from "~/modules/avl-components/src"

import {
  FalcorProvider,
  falcorGraph
} from "@availabs/avl-falcor"

import { enableAuth } from "@availabs/ams"

console.log("CONFIG:", API_HOST, AUTH_HOST, PROJECT_NAME, CLIENT_HOST)

const AuthEnabledApp = enableAuth(App, { AUTH_HOST, PROJECT_NAME, CLIENT_HOST });

const falcor = falcorGraph(API_HOST)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   	<Provider store={ store }>
      <FalcorProvider falcor={ falcor }>
        <ThemeContext.Provider value={ PPDAF_THEME }>
          <AuthEnabledApp />
        </ThemeContext.Provider>
      </FalcorProvider>
    </Provider>
  </React.StrictMode>,
)
