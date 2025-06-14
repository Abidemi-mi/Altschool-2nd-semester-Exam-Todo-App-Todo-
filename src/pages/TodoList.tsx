import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const fetchTodos = async (): Promise<Todo[]> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

const updateTodo = async (todo: Todo) => {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/todos/${todo.id}",
    {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.json();
};

const deleteTodo = async (id: number) => {
  await fetch("https://jsonplaceholder.typicode.com/todos/${id}", {
    method: "DELETE",
  });
};

const addTodo = async (title: string) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    body: JSON.stringify({
      title,
      completed: false,
      userId: 1,
    }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

function TodoList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 10;

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * todosPerPage;
  const indexOfFirst = indexOfLast - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

  const mutationEdit = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const mutationDelete = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const mutationAdd = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
    },
  });

  const handleSaveEdit = (id: number) => {
    mutationEdit.mutate({ id, title: editingText, completed: false });
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        📝 Todo App
      </h1>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Add new todo"
          className="flex-1 border px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          onClick={() => {
            if (newTodo.trim()) mutationAdd.mutate(newTodo);
          }}
        >
          ➕ Add
        </button>
      </div>

      <input
        type="text"
        placeholder="Search todos..."
        className="mb-4 w-full border px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p className="text-center">Loading todos...</p>
      ) : (
        <ul className="space-y-4">
          {currentTodos.map((todo) => (
            <li
              key={todo.id}
              className="p-4 bg-white border rounded-md shadow hover:shadow-md flex justify-between items-center"
            >
              <div className="flex flex-col">
                <Link
                  to={`/todo/${todo.id}`}
                  className="text-lg font-medium text-indigo-600 hover:underline"
                >
                  View Todo #{todo.id}
                </Link>

                {editingId === todo.id ? (
                  <input
                    className="mt-2 border p-1 rounded"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700">{todo.title}</p>
                )}
              </div>

              <div className="flex gap-2 items-center">
                {editingId === todo.id ? (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleSaveEdit(todo.id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="text-yellow-600 font-bold"
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditingText(todo.title);
                    }}
                  >
                    ✏
                  </button>
                )}

                <button
                  className="text-red-600 font-bold"
                  onClick={() => mutationDelete.mutate(todo.id)}
                >
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          ⬅ Prev
        </button>
        <span className="text-sm font-medium text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}

export default TodoList;
