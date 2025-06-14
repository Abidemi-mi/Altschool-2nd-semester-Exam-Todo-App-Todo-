// src/AppRouter.tsx or your routes file
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import TodoList from "./pages/TodoList";
import TodoDetail from "./pages/TodoDetail";
import NotFound from "./pages/NotFound"; // ✅ Import your NotFound page

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />, // ✅ Handles route errors
    children: [
      {
        path: "/",
        element: <TodoList />,
      },
      {
        path: "todos/:id",
        element: <TodoDetail />,
      },
      {
        path: "*",
        element: <NotFound />, // ✅ Catch-all for unknown paths
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
