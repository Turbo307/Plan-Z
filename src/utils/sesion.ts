import type { Tokens } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_KEY = "planz_access_token";
const REFRESH_KEY = "planz_refresh_token";

// guarda los dos tokens JWT
export async function guardarSesion(tokens: Tokens): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.multiSet([
      [ACCESS_KEY, tokens.access],
      [REFRESH_KEY, tokens.refresh],
    ]);
  } else {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.access);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh);
  }
}

// obtiene el access token
export async function obtenerAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(ACCESS_KEY);
  }

  return SecureStore.getItemAsync(ACCESS_KEY);
}

// obtiene el refresh token
export async function obtenerRefreshToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(REFRESH_KEY);
  }

  return SecureStore.getItemAsync(REFRESH_KEY);
}

// elimina ambos tokens al cerrar sesion
export async function eliminarSesion(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  } else {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  }
}
