import BottomTabBar from "@/components/bottom-tab-bar";
import { useAppTheme } from "@/contexts/app-theme";
import { Tabs } from "expo-router/js-tabs";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="calendario" options={{ title: "Calendario" }} />
      <Tabs.Screen name="posts" options={{ title: "Posts" }} />
      <Tabs.Screen name="ajustes" options={{ title: "Ajustes" }} />
    </Tabs>
  );
}
