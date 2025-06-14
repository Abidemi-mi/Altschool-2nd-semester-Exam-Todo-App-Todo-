import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const LIMIT = 10;

export const usePaginatedTodos = (page: number) => {
  return useQuery({
    queryKey: ["todos", page],
    queryFn: () =>
      axios
        .get(
          "https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=${LIMIT}"
        )
        .then((res) => res.data),
  });
};
