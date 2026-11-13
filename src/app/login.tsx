import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/contexts/app-theme";
import { iniciarSesion } from "@/services/api";
import { guardarSesion } from "@/utils/sesion";

export default function LoginScreen() {
  const { colors } = useAppTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const login = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Aviso", "Ingresa tu usuario y contraseña");
      return;
    }

    setCargando(true);

    try {
      // solicita los tokens a Django
      const tokens = await iniciarSesion({
        username: username.trim(),
        password,
      });

      // guarda los JWT en el dispositivo
      await guardarSesion(tokens);

      // mostrar resultado
      Alert.alert("Bienvenido", "Inicio de sesión exitoso");

      // ir a Inicio
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Error al iniciar sesión",
        error instanceof Error ? error.message : "Ocurrió un error inesperado",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="fruit-citrus"
          size={80}
          color={colors.green}
        />

        <Text style={[styles.title, { color: colors.text }]}>PLAN-Z</Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Nombre de usuario"
          placeholderTextColor={colors.secondaryText}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Contraseña"
          placeholderTextColor={colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, { backgroundColor: colors.forest }]}
          onPress={login}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/registro")}>
          <Text>¿Quieres una cuenta?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 30,
    alignItems: "center",
    gap: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
