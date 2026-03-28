import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Designer from './components/Designer/Designer';

export default function App() {
  return (
    <Provider store={store}>
      <Designer />
    </Provider>
  );
}
