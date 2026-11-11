import { type ComponentRef, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/contexts/app-theme";

const ROW = 48;

export default function PickerWheel({ label, items, selected, onSelect }: {
  label: string; items: { value: number; label: string }[]; selected: number; onSelect: (value: number) => void;
}) {
  const { colors, darkMode } = useAppTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [initialOffset] = useState(() => ({ x: 0, y: Math.max(0, items.findIndex((item) => item.value === selected)) * ROW }));
  function selectOffset(offset: number) {
    const index = Math.max(0, Math.min(items.length - 1, Math.round(offset / ROW)));
    onSelect(items[index].value);
  }
  return (
    <View style={styles.column}>
      <Text style={[styles.heading, { color: colors.secondaryText }]}>{label}</Text>
      <ScrollView
        ref={scroll}
        style={styles.wheel}
        contentContainerStyle={styles.wheelContent}
        contentOffset={initialOffset}
        nestedScrollEnabled
        snapToInterval={ROW}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => selectOffset(event.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(event) => selectOffset(event.nativeEvent.targetContentOffset?.y ?? event.nativeEvent.contentOffset.y)}
      >
        {items.map((item, index) => (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${item.label}`}
            accessibilityState={{ selected: item.value === selected }}
            onPress={() => {
              scroll.current?.scrollTo({ y: index * ROW, animated: true });
              onSelect(item.value);
            }}
            style={[styles.wheelItem, item.value === selected && { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
          >
            <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: item.value === selected ? (darkMode ? colors.grass : colors.forest) : colors.secondaryText, fontWeight: item.value === selected ? "700" : "400" }}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, minWidth: 0, gap: 8 },
  heading: { textAlign: "center", fontWeight: "600" },
  wheel: { height: ROW * 3 },
  wheelContent: { paddingVertical: ROW },
  wheelItem: { height: ROW, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingHorizontal: 4 },
});