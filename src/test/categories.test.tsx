import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLegacyTaskCategoryMap,
  readLegacyTaskCategoryMap,
  useCategories,
  type Category,
} from "@/hooks/use-categories";

const LEGACY_CATEGORIES_KEY = "focus.taskCategories.v1";
const LEGACY_TASK_MAP_KEY = "focus.taskCategoryMap.v1";

type RecordedRequest = {
  method: string;
  path: string;
  body?: Record<string, unknown>;
};

const jsonResponse = (data: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? "Not Found" : "OK",
    json: vi.fn().mockResolvedValue(data),
  }) as unknown as Response;

const createCategoryServer = (initialCategories: Category[]) => {
  let categories = initialCategories.map((category) => ({ ...category }));
  let nextId = 1;
  const requests: RecordedRequest[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const method = (init.method || "GET").toUpperCase();
    const body = typeof init.body === "string"
      ? (JSON.parse(init.body) as Record<string, unknown>)
      : undefined;
    requests.push({ method, path: url.pathname, body });

    if (url.pathname === "/api/categories" && method === "GET") {
      return jsonResponse(categories.map((category) => ({ ...category })));
    }

    if (url.pathname === "/api/categories" && method === "POST") {
      const category: Category = {
        id: typeof body?.id === "string" ? body.id : `cat-server-${nextId++}`,
        name: String(body?.name || ""),
        color: String(body?.color || ""),
      };
      categories.push(category);
      return jsonResponse({ ...category }, 201);
    }

    const categoryMatch = url.pathname.match(/^\/api\/categories\/([^/]+)$/);
    if (categoryMatch && method === "PUT") {
      const id = decodeURIComponent(categoryMatch[1]);
      const index = categories.findIndex((category) => category.id === id);
      if (index === -1) return jsonResponse({ error: "Category not found" }, 404);
      categories[index] = {
        ...categories[index],
        ...(typeof body?.name === "string" ? { name: body.name } : {}),
        ...(typeof body?.color === "string" ? { color: body.color } : {}),
      };
      return jsonResponse({ ...categories[index] });
    }

    if (categoryMatch && method === "DELETE") {
      const id = decodeURIComponent(categoryMatch[1]);
      categories = categories.filter((category) => category.id !== id);
      return jsonResponse(null, 204);
    }

    return jsonResponse({ error: "Not found" }, 404);
  });

  return { fetchMock, requests };
};

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    key: vi.fn((index: number) => [...values.keys()][index] ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, String(value));
    }),
  };
};

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("backend-backed task categories", () => {
  it("imports valid legacy categories through the categories API and clears the legacy payload", async () => {
    window.localStorage.setItem(
      LEGACY_CATEGORIES_KEY,
      JSON.stringify([
        { id: "cat-work", name: "Deep Work", color: "#111111" },
        { id: "cat-custom", name: "  Custom  ", color: "#222222" },
        { id: "", name: "Ignored", color: "#333333" },
        { id: "cat-invalid", name: "", color: "#444444" },
      ])
    );

    const server = createCategoryServer([
      { id: "cat-work", name: "Work", color: "#5ca8e0" },
      { id: "cat-study", name: "Study", color: "#e09746" },
    ]);
    vi.stubGlobal("fetch", server.fetchMock);

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.categories).toEqual(
      expect.arrayContaining([
        { id: "cat-work", name: "Deep Work", color: "#111111" },
        { id: "cat-custom", name: "Custom", color: "#222222" },
        { id: "cat-study", name: "Study", color: "#e09746" },
      ])
    );
    expect(window.localStorage.getItem(LEGACY_CATEGORIES_KEY)).toBeNull();
    expect(server.requests).toContainEqual({
      method: "PUT",
      path: "/api/categories/cat-work",
      body: { name: "Deep Work", color: "#111111" },
    });
    expect(server.requests).toContainEqual({
      method: "POST",
      path: "/api/categories",
      body: { id: "cat-custom", name: "Custom", color: "#222222" },
    });
    expect(server.requests.filter((request) => request.method === "GET")).toHaveLength(2);
  });

  it("refreshes hook state after category create, update, and delete operations", async () => {
    const server = createCategoryServer([
      { id: "cat-work", name: "Work", color: "#5ca8e0" },
    ]);
    vi.stubGlobal("fetch", server.fetchMock);

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.categories).toHaveLength(1));

    let created: Category | undefined;
    await act(async () => {
      created = await result.current.createCategory("  Personal  ", "#9b7ed9");
    });
    expect(created).toEqual({ id: "cat-server-1", name: "Personal", color: "#9b7ed9" });
    await waitFor(() =>
      expect(result.current.categories).toContainEqual({
        id: "cat-server-1",
        name: "Personal",
        color: "#9b7ed9",
      })
    );

    await act(async () => {
      await result.current.updateCategory("cat-server-1", {
        name: "Home",
        color: "#d96aa3",
      });
    });
    await waitFor(() =>
      expect(result.current.categories).toContainEqual({
        id: "cat-server-1",
        name: "Home",
        color: "#d96aa3",
      })
    );

    await act(async () => {
      await result.current.deleteCategory("cat-server-1");
    });
    await waitFor(() =>
      expect(result.current.categories.find((category) => category.id === "cat-server-1")).toBeUndefined()
    );

    expect(server.requests).toContainEqual({
      method: "POST",
      path: "/api/categories",
      body: { name: "Personal", color: "#9b7ed9" },
    });
    expect(server.requests).toContainEqual({
      method: "PUT",
      path: "/api/categories/cat-server-1",
      body: { name: "Home", color: "#d96aa3" },
    });
    expect(server.requests).toContainEqual({
      method: "DELETE",
      path: "/api/categories/cat-server-1",
      body: undefined,
    });
    expect(server.requests.filter((request) => request.method === "GET")).toHaveLength(4);
  });

  it("parses only string-valued legacy task assignments and clears them explicitly", () => {
    window.localStorage.setItem(
      LEGACY_TASK_MAP_KEY,
      JSON.stringify({
        "42": "cat-work",
        "77": "cat-study",
        "": "cat-personal",
        "88": 123,
        "99": null,
      })
    );

    expect(readLegacyTaskCategoryMap()).toEqual({
      "42": "cat-work",
      "77": "cat-study",
    });

    clearLegacyTaskCategoryMap();
    expect(window.localStorage.getItem(LEGACY_TASK_MAP_KEY)).toBeNull();

    window.localStorage.setItem(LEGACY_TASK_MAP_KEY, "{not-json");
    expect(readLegacyTaskCategoryMap()).toEqual({});
  });
});
