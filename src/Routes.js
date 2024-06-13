
import DataManager from "~/pages/DataManager"
import Auth from "~/pages/Auth"

// import { useFalcor } from "~/modules/avl-components/src"
// import { useAuth } from "~/modules/ams/src"
import { useFalcor } from "@availabs/avl-falcor"
import { useAuth } from "@availabs/ams"

const DAMA_ARGS = {
  baseUrl: '/datasources',
  defaultPgEnv: 'hazmit_dama',
  useFalcor,
  useAuth
}

const Routes = [
  ...DataManager(DAMA_ARGS)
]
export default Routes
