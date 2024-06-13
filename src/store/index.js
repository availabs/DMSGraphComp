
import { Reducers, messages } from "@availabs/ams";

import { configureStore } from "@reduxjs/toolkit";

// export default createStore(reducer, applyMiddleware(thunk))
export default configureStore({
  reducer: {
    ...Reducers,
    messages
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    })
});
