import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/contexts/app-theme";
import { dateKey, parseActivityDate } from "@/utils/activity";

import Wheel from "@/components/picker-wheel";
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
}

export default function ActivityDateField({ value, onChange, disabled }: {
  value: string; onChange: (value: string) => void; disabled: boolean;
}) {
  const { colors, darkMode } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [minimum, setMinimum] = useState(today);
  const [draft, setDraft] = useState(today);
  const accent = darkMode ? colors.grass : colors.forest;
  const year = draft.getFullYear();
  const month = draft.getMonth();
  const firstMonth = year === minimum.getFullYear() ? minimum.getMonth() : 0;
  const firstDay = year === minimum.getFullYear() && month === minimum.getMonth() ? minimum.getDate() : 1;
  const lastDay = new Date(year, month + 1, 0, 12).getDate();

  function changeParts(nextYear: number, nextMonth: number, nextDay: number) {
    const days = new Date(nextYear, nextMonth + 1, 0, 12).getDate();
    const next = new Date(nextYear, nextMonth, Math.min(nextDay, days), 12);
    setDraft(next < minimum ? minimum : next);
  }

  return (
    <View style={styles.field}>
      <Pressable
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar fecha: ${value}`}
          accessibilityState={{ expanded: open, disabled }}
          onPress={() => {
            Keyboard.dismiss();
            const min = today();
            const parsed = parseActivityDate(value);
            setMinimum(min);
            setDraft(parsed && parsed >= min ? parsed : min);
            setOpen(!open);
          }}
          style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={{ color: colors.text, flex: 1 }}>{value}</Text>
          <Ionicons name="calendar-outline" size={23} color={accent} />
        </Pressable>
      {open && !disabled && (
        <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.secondaryText }}>Desliza para elegir desde hoy</Text>
          <View style={styles.columns}>
            <Wheel key={`days-${year}-${month}-${firstDay}`} label="Día" selected={draft.getDate()} items={Array.from({ length: lastDay - firstDay + 1 }, (_, index) => {
              const day = firstDay + index;
              return { value: day, label: `${day} ${WEEKDAYS[new Date(year, month, day, 12).getDay()]}` };
            })} onSelect={(day) => changeParts(year, month, day)} />
            <Wheel key={`months-${year}`} label="Mes" selected={month} items={MONTHS.slice(firstMonth).map((label, index) => ({ value: firstMonth + index, label }))} onSelect={(nextMonth) => changeParts(year, nextMonth, draft.getDate())} />
            <Wheel label="Año" selected={year} items={Array.from({ length: Math.max(minimum.getFullYear() + 20, year) - minimum.getFullYear() + 1 }, (_, index) => ({ value: minimum.getFullYear() + index, label: String(minimum.getFullYear() + index) }))} onSelect={(nextYear) => changeParts(nextYear, month, draft.getDate())} />
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.action}><Text style={{ color: colors.secondaryText }}>Cancelar</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => {
              const min = today();
              const selected = draft < min ? min : draft;
              const [y, m, d] = dateKey(selected).split("-");
              onChange(`${d}/${m}/${y}`);
              setOpen(false);
            }} style={[styles.action, { backgroundColor: colors.forest, borderRadius: 12 }]}><Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Usar fecha</Text></Pressable>
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
