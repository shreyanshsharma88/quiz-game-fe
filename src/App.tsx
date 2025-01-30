import { Route, Routes } from "react-router-dom";
import { AppThemeProvider, SocketProvider } from "./Providers";
import { Dashboard, LoginSignup } from "./Components";
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
          maxWidth="1400px"
          width="100%"
          justifySelf="center"
          justifyContent="center"
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
              </Route>
            </Routes>
          </QueryClientProvider>
        </Stack>
      </AppThemeProvider>
    </>
  );
}

export default App;
