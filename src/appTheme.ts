import { createTheme } from "@mui/material";

export const getTheme = () => {
  const appTheme = createTheme({
    typography: {
      allVariants: {
        fontFamily: "Poppins",
        color: "#FDEBF3",
      },
    },
    palette: {
      background: {
        default: "#1e1e2e",
        paper: "#27293d",
      },
      primary: {
        main: "#FDEBF3",
      },
      secondary: {
        main: "#EDECF9",
      },
      info: {
        main: "#37557A",
      },
      error: {
        main: "#FF5C5C",
      },
      success: {
        main: "#4CAF50",
      },
      warning:{
        main: "#ffae42"
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            variants: [
              "contained",
              {
                style: {
                  backgroundColor: "#37557A",
                  color: "#FDEBF3",
                },
              },
            ],
          },
          outlined: {
            backgroundColor: "transparent",
          },
         
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: "#EDECF9",
            color: "#1e1e2e",
            borderRadius: "10px",
            input: {
              borderRadius: "10px",
            },
          },
        },
      },
    },
  });
  return { appTheme };
};
