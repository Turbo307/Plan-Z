import { useActivities } from "@/contexts/activities";
import { useAppTheme } from "@/contexts/app-theme";
import { dateKey, occursOn } from "@/utils/activity";
import { formatTime } from "@/utils/time";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  AppState,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Activity = {
  id: number | string;
  title: string;
  start: string;
  end: string;
  duration: string;
  icon: IconName;
  color: string;
  completed: boolean;
};

// actividades temporales de demostracion
const activities: Activity[] = [
  {
    id: 1,
    title: "Medicina del abuelo",
    start: "09:00",
    end: "10:00",
    duration: "1 hora",
    icon: "document-text-outline",
    color: "#568D58",
    completed: true,
  },
  {
    id: 2,
    title: "Cita con el dentista",
    start: "15:00",
    end: "16:00",
    duration: "1 hora",
    icon: "medkit-outline",
    color: "#D4AD65",
    completed: false,
  },
  {
    id: 3,
    title: "Salir a correr al parque",
    start: "18:00",
    end: "18:30",
    duration: "30 minutos",
    icon: "walk-outline",
    color: "#568D82",
    completed: false,
  },
];

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

// compara fechas sin la hora
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// genera la semana de lunes a domingo
function getWeek(date: Date) {
  const start = new Date(date);

  const day = start.getDay();

  // ajusta el inicio de semana al lunes
  const difference = (day + 6) % 7;

  start.setDate(start.getDate() - difference);
  start.setHours(12, 0, 0, 0);

  return DAYS.map((name, index) => {
    const current = new Date(start);

    current.setDate(start.getDate() + index);

    return {
      name,
      date: current,
    };
  });
}

// sumar o restar dias a una fecha
function addDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

// formatear fechas en espanol
function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HomeScreen() {
  const { darkMode, setDarkMode, colors } = useAppTheme();
  const { activities: savedActivities } = useActivities();

  // fecha actual del dispositivo
  const [today, setToday] = useState(() => new Date());

  // dia seleccionado
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // semana del dia seleccionado
  const week = getWeek(selectedDate);

  // actualizar la fecha real al volver a la aplicacion
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setToday(new Date());
      }
    });

    return () => subscription.remove();
  }, []);

  // cambiar de semana
  const changeWeek = (direction: number) => {
    setSelectedDate((previous) => addDays(previous, direction * 7));
  };

  // regresar al dia actual
  const goToToday = () => {
    const current = new Date();

    setToday(current);
    setSelectedDate(current);
  };

  // muestra los ejemplos solo en el dia actual
  const visibleActivities: Activity[] = [
    ...(isSameDay(selectedDate, today) ? activities : []),
    ...savedActivities
      .filter((activity) => occursOn(activity, selectedDate))
      .map((activity) => ({
        id: activity.id,
        title: activity.title,
        start: activity.time,
        end: "",
        duration: "Sin duración",
        icon: "document-text-outline" as IconName,
        color: colors.blue,
        completed: false,
      })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  const completed = visibleActivities.filter(
    (activity) => activity.completed,
  ).length;

  const pending = visibleActivities.length - completed;

  const monthLabel = selectedDate.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const selectedDayLabel = selectedDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* encabezado */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.brand}>
              <MaterialCommunityIcons
                name="fruit-citrus"
                size={22}
                color={colors.green}
              />
              <Text style={[styles.brandText, { color: colors.forest }]}>
                PLAN-Z
              </Text>
            </View>

            <Text style={[styles.greeting, { color: colors.text }]}>
              Hola, Usuario
            </Text>

            <Text style={[styles.dateText, { color: colors.secondaryText }]}>
              {formatDate(today)}
            </Text>
          </View>

          <Pressable
            onPress={() => setDarkMode(!darkMode)}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name={darkMode ? "sunny-outline" : "moon-outline"}
              size={23}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* calendario semanal */}
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.calendarHeader}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            </Text>

            <View style={styles.calendarControls}>
              <Pressable
                onPress={() => changeWeek(-1)}
                style={styles.calendarControl}
              >
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Pressable>

              <Pressable onPress={goToToday} style={styles.calendarControl}>
                <Ionicons
                  name="today-outline"
                  size={22}
                  color={colors.forest}
                />
              </Pressable>

              <Pressable
                onPress={() => changeWeek(1)}
                style={styles.calendarControl}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.weekRow}>
            {week.map((item) => {
              const selected = isSameDay(item.date, selectedDate);

              const isToday = isSameDay(item.date, today);

              return (
                <Pressable
                  key={item.date.toDateString()}
                  onPress={() => setSelectedDate(item.date)}
                  style={[
                    styles.dayItem,
                    selected && {
                      backgroundColor: colors.forest,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayName,
                      {
                        color: selected ? "#FFFFFF" : colors.secondaryText,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: selected ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    {item.date.getDate()}
                  </Text>

                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor: isToday
                          ? selected
                            ? "#FFFFFF"
                            : colors.forest
                          : "transparent",
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* resumen de actividades */}
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={24}
              color={colors.forest}
            />

            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {visibleActivities.length}
            </Text>

            <Text
              style={[styles.summaryLabel, { color: colors.secondaryText }]}
            >
              Actividades
            </Text>
          </View>

          <View
            style={[
              styles.summaryItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={colors.forest}
            />

            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {completed}
            </Text>

            <Text
              style={[styles.summaryLabel, { color: colors.secondaryText }]}
            >
              Completadas
            </Text>
          </View>

          <View
            style={[
              styles.summaryItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="time-outline" size={24} color={colors.wood} />

            <Text style={[styles.summaryNumber, { color: colors.text }]}>
              {pending}
            </Text>

            <Text
              style={[styles.summaryLabel, { color: colors.secondaryText }]}
            >
              Pendientes
            </Text>
          </View>
        </View>

        {/* encabezado de actividades */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Actividades del día
          </Text>
        </View>

        {/* lista de actividades */}
        <View style={styles.activitiesList}>
          {visibleActivities.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="calendar-clear-outline"
                size={32}
                color={colors.secondaryText}
              />

              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No hay actividades registradas para este día.
              </Text>
            </View>
          ) : (
            visibleActivities.map((activity) => (
              <Pressable
                key={activity.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => console.log(activity.title)}
              >
                <View
                  style={[
                    styles.activityAccent,
                    {
                      backgroundColor: activity.color,
                    },
                  ]}
                />

                <View style={styles.activityTime}>
                  <Text style={[styles.startTime, { color: colors.text }]}>
                    {formatTime(activity.start)}
                  </Text>

                  <Text
                    style={[
                      styles.endTime,
                      {
                        color: colors.secondaryText,
                      },
                    ]}
                  >
                    {formatTime(activity.end)}
                  </Text>
                </View>

                <Ionicons
                  name={activity.icon}
                  size={26}
                  color={activity.color}
                />

                <View style={styles.activityInfo}>
                  <Text
                    style={[styles.activityTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {activity.title}
                  </Text>

                  <Text
                    style={[
                      styles.activityDuration,
                      {
                        color: colors.secondaryText,
                      },
                    ]}
                  >
                    Duración: {activity.duration}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.secondaryText}
                />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* boton flotante */}
      <Pressable
        style={[
          styles.floatingButton,
          {
            position: "absolute",
            right: 22,
            bottom: 20,
            backgroundColor: colors.forest,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Nueva actividad"
        onPress={() =>
          router.push({
            pathname: "/nueva-actividad",
            params: { date: dateKey(selectedDate) },
          })
        }
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
    gap: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  headerText: {
    flex: 1,
    gap: 6,
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  brandText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },

  greeting: {
    fontSize: 29,
    fontWeight: "bold",
  },

  dateText: {
    fontSize: 14,
  },

  iconButton: {
    padding: 12,
    borderRadius: 14,
  },

  calendarCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 18,
  },

  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  calendarControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  calendarControl: {
    padding: 5,
  },

  monthTitle: {
    fontSize: 19,
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dayItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 14,
    gap: 8,
  },

  dayName: {
    fontSize: 12,
    fontWeight: "600",
  },

  dayNumber: {
    fontSize: 15,
    fontWeight: "bold",
  },

  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },

  summaryItem: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 1,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 5,
  },

  summaryNumber: {
    fontSize: 15,
    fontWeight: "bold",
  },

  summaryLabel: {
    fontSize: 10,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  sectionDate: {
    fontSize: 12,
    textTransform: "capitalize",
  },

  activitiesList: {
    gap: 10,
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
    minHeight: 76,
    overflow: "hidden",
    gap: 10,
    paddingRight: 12,
  },

  activityAccent: {
    width: 6,
    alignSelf: "stretch",
  },

  activityTime: {
    width: 48,
    gap: 6,
  },

  startTime: {
    fontSize: 13,
    fontWeight: "bold",
  },

  endTime: {
    fontSize: 11,
  },

  activityInfo: {
    flex: 1,
    gap: 5,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  activityDuration: {
    fontSize: 11,
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
