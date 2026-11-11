import { createContext, useContext, useState, type PropsWithChildren } from "react";
import { Colors } from "@/constants/theme";

function useThemeState() {
  const [darkMode, setDarkMode] = useState(false);
  return { darkMode, setDarkMode, colors: darkMode ? Colors.dark : Colors.light };
}

const AppThemeContext = createContext<ReturnType<typeof useThemeState> | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeState();
  return <AppThemeContext.Provider value={theme}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(AppThemeContext);
  if (!theme) throw new Error("useAppTheme requiere AppThemeProvider");
  return theme;
}
