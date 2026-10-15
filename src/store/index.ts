import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { todosReducer } from '../screens/todo/redux/todosSlice';

/** App-wide Redux store, provided in App.tsx. */
export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  // Every dispatched action becomes a Sentry breadcrumb and the latest
  // state is attached to errors (Sentry → issue → "Redux State" context).
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(Sentry.createReduxEnhancer()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed versions of the react-redux hooks.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
