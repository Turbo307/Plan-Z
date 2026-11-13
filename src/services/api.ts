const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export type Usuario = {
  id: number;
  username: string;
  email: string;
};

export type Tokens = {
  access: string;
  refresh: string;
};
export type RegistroDatos = {
  username: string;
  email: string;
  password: string;
};

export type LoginDatos = {
  username: string;
  password: string;
};

// Funcion para enviar solicitudes a Django
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("No está configurada EXPO_PUBLIC_API_URL");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    let mensaje = `Error HTTP ${response.status}`;

    if (data && typeof data === "object") {
      const errores = Object.entries(data).map(([campo, valor]) => {
        const detalle = Array.isArray(valor) ? valor.join(", ") : String(valor);

        return `${campo}: ${detalle}`;
      });

      if (errores.length > 0) {
        mensaje = errores.join("\n");
      }
    }

    throw new Error(mensaje);
  }

  return data as T;
}

// Registrar usuario
export async function registrarUsuario(datos: RegistroDatos): Promise<Usuario> {
  return apiRequest<Usuario>("/api/register/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Iniciar sesión
export async function iniciarSesion(datos: LoginDatos): Promise<Tokens> {
  return apiRequest<Tokens>("/api/login/", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Obtener perfil autenticado
export async function obtenerPerfil(accessToken: string): Promise<Usuario> {
  return apiRequest<Usuario>("/api/profile/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
