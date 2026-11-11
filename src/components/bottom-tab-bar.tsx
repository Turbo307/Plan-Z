import { useAppTheme } from "@/contexts/app-theme";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

const icons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  index: "home-outline",
  calendario: "calendar-outline",
  posts: "document-text-outline",
  ajustes: "settings-outline",
};

export default function BottomTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const { colors, darkMode } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 18 + insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const color = focused
          ? darkMode
            ? colors.grass
            : colors.forest
          : colors.secondaryText;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              options.tabBarAccessibilityLabel ?? options.title
            }
            style={styles.item}
            onPress={() => {
              const event = emitter.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}
            onLongPress={() =>
              emitter.emit({ type: "tabLongPress", target: route.key })
            }
          >
            <Ionicons
              name={icons[route.name] ?? "ellipse-outline"}
              size={23}
              color={color}
            />
            <Text style={[styles.label, { color }]}>
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", borderTopWidth: 1, paddingTop: 12 },
  item: { flex: 1, minHeight: 44, alignItems: "center", gap: 5 },
  label: { fontSize: 11 },
});
