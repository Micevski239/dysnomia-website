import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Render the app immediately so it loads behind the loader
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Fade out the loader after minimum display time
const loader = document.getElementById('initial-loader');
if (loader) {
  const MIN_MS = 1000;
  setTimeout(() => {
    loader.style.transition = 'opacity 0.4s ease';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
  }, MIN_MS);
}
