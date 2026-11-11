import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { SavedActivity } from "@/utils/activity";

const STORAGE_KEY = "plan-z.activities.v1";
type ActivitiesContextValue = {
  activities: SavedActivity[];
  ready: boolean;
  error: string | null;
  addActivity: (activity: Omit<SavedActivity, "id">) => Promise<void>;
};
const ActivitiesContext = createContext<ActivitiesContextValue | null>(null);

export function ActivitiesProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState<SavedActivity[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      const saved = value ? JSON.parse(value) : [];
      if (!Array.isArray(saved)) throw new Error("Invalid activities");
      if (active) { setActivities(saved); setReady(true); }
    }).catch(() => {
      if (active) setError("No se pudieron cargar las actividades. Vuelve a abrir la aplicación para intentarlo de nuevo.");
    });
    return () => { active = false; };
  }, []);

  async function addActivity(activity: Omit<SavedActivity, "id">) {
    if (!ready || saving.current) throw new Error("Activities unavailable");
    saving.current = true;
    try {
      const next = [...activities, { ...activity, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setActivities(next);
    } finally { saving.current = false; }
  }

  return <ActivitiesContext.Provider value={{ activities, ready, error, addActivity }}>{children}</ActivitiesContext.Provider>;
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (!context) throw new Error("useActivities requiere ActivitiesProvider");
  return context;
}
