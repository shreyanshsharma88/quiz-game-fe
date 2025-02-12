import { Route, Routes } from "react-router-dom";
import { AppThemeProvider, SocketProvider } from "./Providers";
import { Dashboard, LoginSignup, Quiz } from "./Components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Stack } from "@mui/material";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
function App() {
  return (
    <>
      <AppThemeProvider>
        <Stack
          maxWidth="800px"
          width="100%"
          justifySelf="center"
          justifyContent="center"
          mt={4}
        >
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<LoginSignup />} />
              <Route element={<SocketProvider />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/play/:quizId/:quizName" element={<Quiz />} />
              </Route>
            </Routes>
          </QueryClientProvider>
        </Stack>
      </AppThemeProvider>
    </>
  );
}

export default App;
