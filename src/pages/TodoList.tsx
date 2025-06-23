//

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Todo = { id: number; title: string; completed: boolean };

// Fetch all todos
const fetchTodos = async (): Promise<Todo[]> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

// Individual CRUD operations
const addTodoApi = async (title: string) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    body: JSON.stringify({ title, completed: false }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

const updateTodoApi = async (todo: Todo) => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todo.id}`,
    {
      method: "PUT",
      body: JSON.stringify(todo),
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.json();
};

const deleteTodoApi = async (id: number) => {
  await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
    method: "DELETE",
  });
  return id;
};

export default function TodoList() {
  const queryClient = useQueryClient();

  // State: filtering, pagination, editing
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  // Fetch query
  const {
    data: todos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // Filter and paginate
  const filtered = useMemo(
    () =>
      todos.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [todos, search]
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Add mutation
  const addMutation = useMutation({
    mutationFn: addTodoApi,
    onSuccess: (added) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old ? [{ ...added, id: Date.now() }, ...old] : [added]
      );
      setNewTitle("");
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: updateTodoApi,
    onSuccess: (updated) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) => (t.id === updated.id ? t : updated))
      );
      setEditingId(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTodoApi,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.filter((t) => t.id !== id)
      );
    },
  });

  if (isLoading) return <p className="p-4">Loading todos...</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load todos</p>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Todo App</h1>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="New todo title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={() => newTitle.trim() && addMutation.mutate(newTitle.trim())}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <input
        type="text"
        placeholder="Search todos..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full border rounded px-3 py-2"
      />

      <ul className="space-y-3">
        {paginated.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            <div className="flex-1">
              <Link
                to={`/todo/$ {todo.id}`}
                className="text-blue-600 hover:underline"
              >
                {editingId === todo.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  todo.title
                )}
              </Link>
            </div>
            ,
            <div className="flex space-x-2">
              {editingId === todo.id ? (
                <button
                  onClick={() =>
                    editMutation.mutate({ ...todo, title: editTitle })
                  }
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(todo.id);
                    setEditTitle(todo.title);
                  }}
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(todo.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center space-x-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 py-1">
          {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
