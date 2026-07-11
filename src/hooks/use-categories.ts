import { useCallback, useEffect, useState } from "react";
import { categoriesAPI } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  color: string;
}

const LEGACY_CATEGORIES_KEY = "focus.taskCategories.v1";
const LEGACY_TASK_MAP_KEY = "focus.taskCategoryMap.v1";

export const CATEGORY_COLORS = [
  "#5ca8e0",
  "#9b7ed9",
  "#d96aa3",
  "#e09746",
  "#6bcf7f",
  "#e0c85c",
  "#5cd0d0",
  "#e07171",
];

const isCategory = (value: unknown): value is Category => {
  if (!value || typeof value !== "object") return false;
  const category = value as Partial<Category>;
  return (
    typeof category.id === "string" &&
    category.id.length > 0 &&
    typeof category.name === "string" &&
    category.name.trim().length > 0 &&
    typeof category.color === "string"
  );
};

const readLegacyCategories = (): Category[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LEGACY_CATEGORIES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCategory) : [];
  } catch {
    return [];
  }
};

export const readLegacyTaskCategoryMap = (): Record<string, string> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(LEGACY_TASK_MAP_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([taskId, categoryId]) => taskId.length > 0 && typeof categoryId === "string"
      )
    );
  } catch {
    return {};
  }
};

export const clearLegacyTaskCategoryMap = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LEGACY_TASK_MAP_KEY);
  }
};

type Listener = () => void;
const listeners = new Set<Listener>();
const notifyCategoriesChanged = () => listeners.forEach((listener) => listener());

const responseData = <T,>(response: { success: boolean; data?: T; error?: string }): T => {
  if (!response.success) {
    throw new Error(response.error || "Category request failed");
  }
  return response.data as T;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await categoriesAPI.getAll();
  return responseData<Category[]>(response) || [];
};

const loadAndMigrateCategories = async (): Promise<Category[]> => {
  let categories = await fetchCategories();
  const legacyCategories = readLegacyCategories();

  if (legacyCategories.length === 0) return categories;

  const existingById = new Map(categories.map((category) => [category.id, category]));
  let changed = false;

  for (const legacyCategory of legacyCategories) {
    const existing = existingById.get(legacyCategory.id);

    if (!existing) {
      responseData(
        await categoriesAPI.create(
          legacyCategory.name.trim(),
          legacyCategory.color,
          legacyCategory.id
        )
      );
      changed = true;
      continue;
    }

    if (existing.name !== legacyCategory.name.trim() || existing.color !== legacyCategory.color) {
      responseData(
        await categoriesAPI.update(legacyCategory.id, {
          name: legacyCategory.name.trim(),
          color: legacyCategory.color,
        })
      );
      changed = true;
    }
  }

  window.localStorage.removeItem(LEGACY_CATEGORIES_KEY);
  if (changed) categories = await fetchCategories();
  return categories;
};

let categoriesLoadInFlight: Promise<Category[]> | null = null;
const loadCategories = () => {
  if (!categoriesLoadInFlight) {
    categoriesLoadInFlight = loadAndMigrateCategories().finally(() => {
      categoriesLoadInFlight = null;
    });
  }
  return categoriesLoadInFlight;
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await loadCategories();
      setCategories(next);
      setError(null);
      return next;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load categories";
      setError(message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void refreshCategories().catch(() => {
        // The exposed error state lets the UI report backend failures.
      });
    };
    const listener = () => {
      if (active) refresh();
    };

    listeners.add(listener);
    refresh();

    return () => {
      active = false;
      listeners.delete(listener);
    };
  }, [refreshCategories]);

  const createCategory = useCallback(async (name: string, color: string) => {
    const category = responseData<Category>(await categoriesAPI.create(name.trim(), color));
    notifyCategoriesChanged();
    return category;
  }, []);

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Omit<Category, "id">>) => {
      const category = responseData<Category>(await categoriesAPI.update(id, updates));
      notifyCategoriesChanged();
      return category;
    },
    []
  );

  const deleteCategory = useCallback(async (id: string) => {
    responseData<void>(await categoriesAPI.delete(id));
    notifyCategoriesChanged();
  }, []);

  const getTaskCategory = useCallback(
    (categoryId?: string | null): Category | undefined => {
      if (!categoryId) return undefined;
      return categories.find((category) => category.id === categoryId);
    },
    [categories]
  );

  return {
    categories,
    isLoading,
    error,
    refreshCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getTaskCategory,
  };
};
