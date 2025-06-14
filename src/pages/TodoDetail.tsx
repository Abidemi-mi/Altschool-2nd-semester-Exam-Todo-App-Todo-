import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const fetchTodo = async (id: string) => {
  // const response = await fetch(
  //   "https://jsonplaceholder.typicode.com/todos/${id}"
  // );

  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
  if (!res.ok) {
    throw new Error("Todo not found");
  }
  return res.json();
};

function TodoDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useQuery<Todo>({
    queryKey: ["todo", id],
    queryFn: () => {
      if (!id) throw new Error("No ID provided");
      return fetchTodo(id);
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="p-4">Loading todo...</div>;

  if (isError) {
    // console.error("Error fetching todo:", error);
    return (
      <div className="p-4 text-red-600 font-semibold">Error loading todo</div>
    );
  }

  if (!todo)
    return <div className="p-4 text-red-600 font-semibold">Todo not found</div>;

  return (
    <div className="p-4 border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-2">Todo Detail</h2>
      <p>
        <strong>ID:</strong> {todo.id}
      </p>
      <p>
        <strong>Title:</strong> {todo?.title}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {todo.completed ? "✅ Completed" : "❌ Not Completed"}
      </p>
    </div>
  );
}

export default TodoDetail;
