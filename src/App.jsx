import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { dmsPageFactory, registerDataType } from "./modules/dms/src"

import pageConfig from './modules/dms/src/patterns/page/siteConfig'
import Selector, { registerComponents } from "./modules/dms/src/patterns/page/selector"

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

const temp = pageConfig({
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
