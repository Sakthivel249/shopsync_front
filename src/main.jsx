import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // It's good practice to use .jsx if the file contains JSX
import './App.css'; // Importing the main stylesheet

// Find the root element in your public/index.html file
const rootElement = document.getElementById('root');

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);