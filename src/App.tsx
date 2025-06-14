import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Todo App</h1>
      <Outlet /> {/* This renders TodoList or TodoDetail */}
    </div>
  );
}

export default App;
