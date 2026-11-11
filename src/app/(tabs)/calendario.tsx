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

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/contexts/app-theme";


const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

// compara fechas sin la hora
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// generar la cuadricula del mes
function getMonthDays(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1, 12);
  const lastDay = new Date(year, month + 1, 0, 12);

  // alinea el primer dia con la semana desde lunes
  const offset = (firstDay.getDay() + 6) % 7;

  const days: (Date | null)[] = Array(offset).fill(null);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day, 12));
  }

  // completar la ultima fila
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

// cambiar de mes respetando el dia cuando sea posible
function addMonths(date: Date, amount: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + amount;

  const targetMonth = new Date(year, month, 1, 12);
  const lastDay = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
    12,
  ).getDate();

  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    Math.min(date.getDate(), lastDay),
    12,
  );
}

export default function CalendarioScreen() {
  const { darkMode, setDarkMode, colors } = useAppTheme();
  const [today, setToday] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());


  const monthDays = getMonthDays(selectedDate);

  const monthTitle = selectedDate.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const selectedDateLabel = selectedDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  function formatDate(date: Date): string {
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // actualizar hoy al regresar a la aplicacion
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setToday(new Date());
      }
    });

    return () => subscription.remove();
  }, []);

  const changeMonth = (amount: number) => {
    setSelectedDate((previous) => addMonths(previous, amount));
  };

  const goToToday = () => {
    const current = new Date();
    setToday(current);
    setSelectedDate(current);
  };

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
            {/* logo de plan-z */}
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

            <Text style={[styles.title, { color: colors.text }]}>
              Calendario
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

        {/* calendario mensual */}
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* mes y controles */}
          <View style={styles.calendarHeader}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)}
            </Text>

            <View style={styles.calendarControls}>
              <Pressable
                onPress={() => changeMonth(-1)}
                style={styles.controlButton}
              >
                <Ionicons name="chevron-back" size={21} color={colors.text} />
              </Pressable>

              <Pressable onPress={goToToday} style={styles.controlButton}>
                <Ionicons
                  name="today-outline"
                  size={22}
                  color={colors.forest}
                />
              </Pressable>

              <Pressable
                onPress={() => changeMonth(1)}
                style={styles.controlButton}
              >
                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color={colors.text}
                />
              </Pressable>
            </View>
          </View>

          {/* nombres de los dias */}
          <View style={styles.weekHeader}>
            {DAYS.map((day, index) => (
              <View key={index} style={styles.weekHeaderCell}>
                <Text
                  style={[styles.weekDayText, { color: colors.secondaryText }]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* cuadricula de fechas */}
          <View style={styles.monthGrid}>
            {monthDays.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const selected = isSameDay(date, selectedDate);

              const isToday = isSameDay(date, today);

              return (
                <View key={date.toDateString()} style={styles.dayCell}>
                  <Pressable
                    onPress={() => setSelectedDate(date)}
                    style={[
                      styles.dayButton,
                      selected && {
                        backgroundColor: colors.forest,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        {
                          color: selected ? "#FFFFFF" : colors.text,
                        },
                      ]}
                    >
                      {date.getDate()}
                    </Text>

                    <View
                      style={[
                        styles.todayDot,
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
                </View>
              );
            })}
          </View>

          {/* marca del dia actual */}
          <View style={styles.legend}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.forest }]}
            />
            <Text style={[styles.legendText, { color: colors.secondaryText }]}>
              El punto indica el día de hoy
            </Text>
          </View>
        </View>

        {/* fecha seleccionada */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Actividades de la semana
          </Text>
        </View>

        {/* actividades vacias */}
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
            size={36}
            color={colors.secondaryText}
          />

          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sin actividades
          </Text>

          <Text
            style={[styles.emptyDescription, { color: colors.secondaryText }]}
          >
            No tienes actividades registradas para la semana.
          </Text>
        </View>

        {/* mensaje de organizacion */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryIcon}>
            <Ionicons name="leaf-outline" size={25} color={colors.forest} />
          </View>

          <View style={styles.summaryText}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Un día a la vez
            </Text>

            <Text
              style={[
                styles.summaryDescription,
                { color: colors.secondaryText },
              ]}
            >
              info super util proximamente.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* boton flotante */}
      <Pressable
        style={[styles.floatingButton, { backgroundColor: colors.forest }]}
        onPress={() =>
          console.log("Nueva actividad para:", selectedDate.toDateString())
        }
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
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

  brandText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  title: {
    fontSize: 29,
    fontWeight: "bold",
  },

  dateText: {
    fontSize: 14,
    marginTop: 4,
  },

  subtitle: {
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
    gap: 20,
  },

  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  monthTitle: {
    fontSize: 19,
    fontWeight: "bold",
    flexShrink: 1,
  },

  calendarControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  controlButton: {
    padding: 5,
  },

  weekHeader: {
    flexDirection: "row",
  },

  weekHeaderCell: {
    width: "14.285714%",
    alignItems: "center",
  },

  weekDayText: {
    fontSize: 13,
    fontWeight: "600",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 7,
  },

  dayCell: {
    width: "14.285714%",
    alignItems: "center",
    justifyContent: "center",
  },

  dayButton: {
    width: 38,
    height: 43,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },

  dayNumber: {
    fontSize: 15,
    fontWeight: "600",
  },

  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  legendText: {
    fontSize: 11,
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
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyDescription: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCE8C9",
  },

  summaryText: {
    flex: 1,
    gap: 5,
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  summaryDescription: {
    fontSize: 12,
    lineHeight: 18,
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
