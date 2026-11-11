import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";

import PickerWheel from "@/components/picker-wheel";
import { useAppTheme } from "@/contexts/app-theme";
import { formatTime, parseTime } from "@/utils/time";

const pad = (value: number) => String(value).padStart(2, "0");
const HOURS = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: String(index + 1) }));
const MINUTES = Array.from({ length: 60 }, (_, value) => ({ value, label: pad(value) }));
const PERIODS = [{ value: 0, label: "AM" }, { value: 1, label: "PM" }];

export default function ActivityTimeField({ value, onChange, disabled }: {
  value: string; onChange: (value: string) => void; disabled: boolean;
}) {
  const { colors, darkMode } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState(0);
  const accent = darkMode ? colors.grass : colors.forest;

  return (
    <View style={styles.field}>
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Seleccionar hora: ${formatTime(value) || "sin seleccionar"}`}
        accessibilityState={{ expanded: open, disabled }}
        onPress={() => {
          Keyboard.dismiss();
          if (!open) {
            const now = new Date();
            const parsed = parseTime(value);
            const currentHour = parsed?.hour ?? now.getHours();
            setHour(currentHour % 12 || 12);
            setMinute(parsed?.minute ?? now.getMinutes());
            setPeriod(currentHour >= 12 ? 1 : 0);
          }
          setOpen(!open);
        }}
        style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={{ flex: 1, color: value ? colors.text : colors.secondaryText }}>{formatTime(value) || "Seleccionar hora"}</Text>
        <Ionicons name="time-outline" size={23} color={accent} />
      </Pressable>
      {open && !disabled && (
        <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.secondaryText }}>Desliza para elegir la hora</Text>
          <View style={styles.columns}>
            <PickerWheel label="Hora" items={HOURS} selected={hour} onSelect={setHour} />
            <PickerWheel label="Minutos" items={MINUTES} selected={minute} onSelect={setMinute} />
            <PickerWheel label="AM/PM" items={PERIODS} selected={period} onSelect={setPeriod} />
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.action}>
              <Text style={{ color: colors.secondaryText }}>Cancelar</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => {
              onChange(`${hour}:${pad(minute)} ${period === 0 ? "AM" : "PM"}`);
              setOpen(false);
            }} style={[styles.action, { backgroundColor: colors.forest, borderRadius: 12 }]}>
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Usar hora</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 10 },
  toggle: { flexDirection: "row", gap: 12, paddingHorizontal: 14, minHeight: 52, borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  picker: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 14 },
  columns: { flexDirection: "row", gap: 6 },
  actions: { flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", gap: 8 },
  action: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16 },
});
