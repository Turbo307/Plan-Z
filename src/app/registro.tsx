import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/contexts/app-theme";
import { registrarUsuario } from "@/services/api";

export default function RegistroScreen() {
  const { colors } = useAppTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrar = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert("Aviso", "Completa todos los campos");
      return;
    }

    setCargando(true);

    try {
      //envia los datos al backend Django
      const usuario = await registrarUsuario({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert(
        "Registro exitoso",
        `Bienvenido ${usuario.username}. Ya puedes iniciar sesión.`,
        [
          {
            text: "Iniciar sesión",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error al registrarse",
        error instanceof Error
          ? error.message
          : "No se pudo registrar el usuario",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Ionicons name="person-add-outline" size={65} color={colors.forest} />

        <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>

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
          autoCorrect={false}
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
          placeholder="Correo electrónico"
          placeholderTextColor={colors.secondaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
          onPress={registrar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace("/login")} disabled={cargando}>
          <Text style={{ color: colors.forest, fontSize: 15 }}>
            Inicia sesión
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
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
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
