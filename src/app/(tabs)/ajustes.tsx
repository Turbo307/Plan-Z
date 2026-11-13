import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/contexts/app-theme";
import { obtenerPerfil, type Usuario } from "@/services/api";
import { eliminarSesion, obtenerAccessToken } from "@/utils/sesion";

export default function AjustesScreen() {
  const { colors } = useAppTheme();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Consultar el perfil al entrar a Ajustes
  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      // recuperar token guardado
      const token = await obtenerAccessToken();

      if (!token) {
        setUsuario(null);
        setError("No hay una sesión iniciada.");
        return;
      }

      // enviar GET con Bearer token
      const perfil = await obtenerPerfil(token);

      // guardar datos recibidos
      setUsuario(perfil);
    } catch (err) {
      setUsuario(null);
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible obtener el perfil.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil]),
  );

  // eliminar tokens y regresar a Login
  const cerrarSesion = async () => {
    try {
      await eliminarSesion();
      setUsuario(null);
      router.replace("/login");
    } catch (err) {
      setError("No se pudo cerrar la sesión.");
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={28} color={colors.forest} />

          <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Información de tu cuenta
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={65}
            color={colors.forest}
          />

          {cargando ? (
            <ActivityIndicator size="large" color={colors.forest} />
          ) : error ? (
            <Text style={{ color: colors.text }}>{error}</Text>
          ) : usuario ? (
            <View style={styles.userInfo}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>
                Nombre de usuario
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {usuario.username}
              </Text>

              <Text style={[styles.label, { color: colors.secondaryText }]}>
                Correo electrónico
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {usuario.email}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={cargarPerfil}
          disabled={cargando}
          style={[styles.button, { backgroundColor: colors.forest }]}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Actualizar perfil</Text>
        </Pressable>

        <Pressable
          onPress={cerrarSesion}
          style={[
            styles.button,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  userInfo: {
    width: "100%",
    gap: 8,
  },
  label: {
    fontSize: 13,
    marginTop: 10,
  },
  value: {
    fontSize: 17,
    fontWeight: "600",
  },
  button: {
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
