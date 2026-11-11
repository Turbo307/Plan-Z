import ActivityDateField from "@/components/activity-date-field";
import ActivityTimeField from "@/components/activity-time-field";
import { timeForStorage } from "@/utils/time";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/contexts/app-theme";
import { useActivities } from "@/contexts/activities";
import { dateKey, LISTS, parseActivityDate, RECURRENCES, REMINDERS } from "@/utils/activity";

function displayDate(key: string) {
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}

export default function NewActivityScreen() {
  const { colors, darkMode } = useAppTheme();
  const { addActivity, ready, error: storageError } = useActivities();
  const params = useLocalSearchParams<{ date?: string }>();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => displayDate(
    typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : dateKey(new Date()),
  ));
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState<typeof REMINDERS[number]>("15 minutos antes");
  const [recurrence, setRecurrence] = useState<typeof RECURRENCES[number]>("No repetir");
  const [list, setList] = useState<typeof LISTS[number]>("Personal");
  const [showReminders, setShowReminders] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const accent = darkMode ? colors.grass : colors.forest;
  const fieldStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  async function save() {
    if (savingRef.current || !ready) return;
    const parsedDate = parseActivityDate(date);
    const savedTime = timeForStorage(time);
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Escribe el nombre de la actividad.";
    if (parsedDate && dateKey(parsedDate) < dateKey(new Date())) nextErrors.date = "Elige una fecha de hoy en adelante.";
    if (!parsedDate) nextErrors.date = "Escribe una fecha válida: DD/MM/AAAA.";
    if (!savedTime) nextErrors.time = "Selecciona una hora válida con AM o PM.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !parsedDate || !savedTime) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await addActivity({ title: title.trim(), date: dateKey(parsedDate), time: savedTime, reminder, recurrence, list });
      close();
    } catch {
      setErrors({ save: "No se pudo guardar la actividad. Inténtalo de nuevo." });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function errorText(key: string) {
    return errors[key] ? <Text accessibilityRole="alert" style={{ color: colors.text }}>{errors[key]}</Text> : null;
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <Pressable disabled={saving} accessibilityRole="button" accessibilityLabel="Volver" onPress={close} style={[styles.back, { backgroundColor: colors.surface }]}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Nueva actividad</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Actividad</Text>
            <TextInput accessibilityLabel="Actividad" placeholder="¿Qué vas a hacer?" placeholderTextColor={colors.secondaryText} selectionColor={accent} keyboardAppearance={darkMode ? "dark" : "light"} style={fieldStyle} value={title} onChangeText={setTitle} maxLength={120} editable={!saving} />
            {errorText("title")}
          </View>

          <View style={styles.field}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Fecha</Text>
              <ActivityDateField value={date} onChange={setDate} disabled={saving} />
              {errorText("date")}
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Hora</Text>
              <ActivityTimeField value={time} onChange={setTime} disabled={saving} />
              {errorText("time")}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Recordatorio</Text>
            <Pressable disabled={saving} accessibilityRole="button" accessibilityLabel={`Recordatorio: ${reminder}`} accessibilityState={{ expanded: showReminders }} onPress={() => setShowReminders(!showReminders)} style={[...fieldStyle, styles.reminder]}>
              <Ionicons name="notifications-outline" size={21} color={accent} />
              <Text style={[styles.flex, { color: colors.text }]}>{reminder}</Text>
              <Ionicons name={showReminders ? "chevron-up" : "chevron-down"} size={18} color={colors.secondaryText} />
            </Pressable>
            {showReminders && <Options options={REMINDERS} selected={reminder} disabled={saving} onSelect={(value) => { setReminder(value); setShowReminders(false); }} />}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Recurrencia</Text>
            <Options options={RECURRENCES} selected={recurrence} onSelect={setRecurrence} disabled={saving} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Lista</Text>
            <Options options={LISTS} selected={list} onSelect={setList} disabled={saving} />
          </View>

          {errorText("save")}
          {storageError && <Text accessibilityRole="alert" style={{ color: colors.text }}>{storageError}</Text>}
          <Pressable disabled={saving || !ready} accessibilityRole="button" accessibilityState={{ disabled: saving || !ready }} onPress={save} style={[styles.save, { backgroundColor: colors.forest, opacity: saving || !ready ? 0.6 : 1 }]}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="checkmark" size={22} color="#FFFFFF" />}
            <Text style={styles.saveText}>{saving ? "Guardando…" : "Guardar actividad"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Options<T extends string>({ options, selected, onSelect, disabled }: {
  options: readonly T[]; selected: T; onSelect: (value: T) => void; disabled: boolean;
}) {
  const { colors, darkMode } = useAppTheme();
  const accent = darkMode ? colors.grass : colors.forest;
  return (
    <View accessibilityRole="radiogroup" style={styles.options}>
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable key={option} disabled={disabled} accessibilityRole="radio" accessibilityState={{ checked: active, disabled }} onPress={() => onSelect(option)} style={[styles.option, { backgroundColor: active ? colors.forest : colors.surface, borderColor: active ? accent : colors.border }]}>
            <Ionicons name={active ? "radio-button-on" : "radio-button-off"} size={18} color={active ? "#FFFFFF" : colors.secondaryText} />
            <Text style={{ color: active ? "#FFFFFF" : colors.text, flexShrink: 1 }}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  back: { minWidth: 44, minHeight: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", flexShrink: 1 },
  content: { padding: 20, paddingBottom: 32, gap: 24, width: "100%", maxWidth: 640, alignSelf: "center" },
  field: { gap: 10 },
  label: { fontSize: 15, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, minHeight: 52 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  flex: { flex: 1, minWidth: 100 },
  reminder: { flexDirection: "row", alignItems: "center", gap: 10 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, minHeight: 44, borderWidth: 1, borderRadius: 14 },
  save: { flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", minHeight: 54, borderRadius: 16 },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
