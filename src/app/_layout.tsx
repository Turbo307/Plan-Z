import { ActivitiesProvider } from "@/contexts/activities";
import { AppThemeProvider } from "@/contexts/app-theme";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ActivitiesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="nueva-actividad" />
        </Stack>
      </ActivitiesProvider>
    </AppThemeProvider>
  );
}
