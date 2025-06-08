import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './fonts/font.css'
import { RouterProvider, createBrowserRouter } from 'react-router'
import Create from './pages/Create.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/create',
    element: <Create />
  }
])


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
