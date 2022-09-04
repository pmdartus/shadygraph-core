import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';

import './index.css';

const root = document.getElementById('root')!;
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
