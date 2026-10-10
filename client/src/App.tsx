
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
         <RouterProvider router={router} />
    </QueryClientProvider>
     
  );
}
