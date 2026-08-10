import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Loading from './components/shared/Loading.jsx';

const router = createBrowserRouter([{ path: '/*', element: <App /> }]);

createRoot(document.getElementById('root')).render(
  <Suspense fallback={<Loading />}>
    <RouterProvider router={router} />
  </Suspense>
);

