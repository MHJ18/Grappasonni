"use client";
import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { useAppearance } from "./appearance-provider";
export function DesignProvider({ children }: { children: React.ReactNode }) {
  const { colorMode } = useAppearance();
  const dark = colorMode === "dark";
  const theme = useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
        },
        shape: { borderRadius: 18 },
        palette: {
          mode: colorMode,
          primary: {
            main: dark ? "#d8b47b" : "#8d5f29",
            contrastText: dark ? "#1a241c" : "#fff",
          },
          secondary: { main: "#b8765a" },
          background: {
            default: dark ? "#101912" : "#f4eee2",
            paper: dark ? "#1c281e" : "#fffbf3",
          },
          text: {
            primary: dark ? "#f1e8d6" : "#263829",
            secondary: dark ? "#b7bda9" : "#69745f",
          },
          divider: dark ? "#46513a" : "#d9d2bd",
          error: { main: dark ? "#efad8d" : "#ac402e" },
        },
        typography: {
          fontFamily: "var(--font-dm),sans-serif",
          button: { textTransform: "none", fontWeight: 600 },
          h2: { fontFamily: "var(--font-cormorant),serif" },
        },
        components: {
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                fontFamily: "var(--font-cormorant),serif",
                fontSize: 28,
                fontWeight: 700,
              },
            },
          },
          MuiDialogContent: { styleOverrides: { root: { paddingBottom: 30 } } },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { minHeight: 44, borderRadius: 14 } },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontFamily: "var(--font-dm)",
                fontSize: 13,
                minHeight: 48,
              },
            },
          },
          MuiIconButton: {
            styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
          },
        },
      }),
    [colorMode, dark],
  );
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}
