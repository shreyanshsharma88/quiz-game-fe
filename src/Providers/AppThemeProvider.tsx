import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { getTheme } from "../appTheme";

export const AppThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const {appTheme} = getTheme();
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline>{children}</CssBaseline>
    </ThemeProvider>
  );
};
