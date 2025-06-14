import { createBrowserRouter } from "react-router-dom";
import TodoList from "./pages/TodoList";
import TodoDetail from "./pages/TodoDetail";

const router = createBrowserRouter([
  {
    index: true,
    element: <TodoList />,
  },
  {
    path: "todo/:id",
    element: <TodoDetail />,
  },
]);
