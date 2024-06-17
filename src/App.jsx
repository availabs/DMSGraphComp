import { createBrowserRouter, RouterProvider } from "react-router-dom";

import {  dmsPageFactory, registerDataType, Selector, adminConfig, registerComponents } from "./modules/dms/src/"
registerDataType("selector", Selector)

import {siteConfig} from './modules/dms/src/patterns/page/siteConfig'


import Routes from "./Routes"
import Layout from '~/layout/ppdaf-layout'
import LayoutWrapper from '~/layout/LayoutWrapper'
const WrappedRoutes = LayoutWrapper(Routes, Layout);

import TimeComp from "./TimeComp"
import GraphComp from "./GraphComp"

import { API_HOST } from './config'

registerComponents({
  [TimeComp[name]]: TimeComp,
  [GraphComp[name]]: GraphComp
})

registerDataType("selector", Selector);

const temp = siteConfig({
  app: "dms-docs", type: "main", baseUrl: ""
})

const siteCMS = {
  ...dmsPageFactory({ ...temp, API_HOST })
};

function App() {
  return (
    <RouterProvider
      router={
        createBrowserRouter([siteCMS, ...WrappedRoutes])
      }/>
  )
}

export default App
