import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import { RefreshCw, Search, Filter, LocateFixed, CircleDot } from "lucide-react";

interface Note {
  _id?: string | number;
  id?: string | number;
  title: string;
  content?: string;
  folderId?: string | number | { _id?: string | number; id?: string | number };
}

interface Folder {
  _id?: string | number;
  id?: string | number;
  name: string;
}

interface GraphNode {
  id: string;
  noteId?: string;
  folderId?: string;
  title: string;
  group: "hub" | "topic" | "note" | "ghost";
  val: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  pinned?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
}

interface ResolvedGraphLink {
  source: GraphNode;
  target: GraphNode;
}

interface Transform {
  x: number;
  y: number;
  k: number;
}

interface GraphViewProps {
  selectedNoteId?: string | null;
  notes?: Note[];
  folders?: Folder[];
  onSelectNote?: (noteId: string, folderId?: string) => void;
}

const WIKILINK_RE = /!?\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const MARKDOWN_LINK_RE = /\[[^\]]+\]\((?!https?:\/\/|mailto:|#)([^)]+)\)/g;

const normalizeTitle = (value: string) =>
  value
    .trim()
    .replace(/\.md$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

const displayTitle = (value: string) => value.trim().replace(/\.md$/i, "");

const normalizeId = (value?: string | number | null) => value == null ? "" : String(value);

const getFolderId = (note: Note) =>
  typeof note.folderId === "object" ? normalizeId(note.folderId?._id || note.folderId?.id) : normalizeId(note.folderId);

const getNoteId = (note: Note) => normalizeId(note._id || note.id) || note.title;

const extractLinks = (content = "") => {
  const links = new Set<string>();
  let match: RegExpExecArray | null;

  WIKILINK_RE.lastIndex = 0;
  while ((match = WIKILINK_RE.exec(content))) {
    links.add(normalizeTitle(match[1]));
  }

  MARKDOWN_LINK_RE.lastIndex = 0;
  while ((match = MARKDOWN_LINK_RE.exec(content))) {
    const target = decodeURIComponent(match[1])
      .split("#")[0]
      .split("/")
      .pop();
    if (target) links.add(normalizeTitle(target));
  }

  return [...links].filter(Boolean);
};

const buildGraph = (notes: Note[], options?: { selectedNoteId?: string | null; localOnly?: boolean; showOrphans?: boolean; query?: string; folderId?: string }) => {
  const titleToNote = new Map<string, Note>();
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  const linkKeys = new Set<string>();
  const links: GraphLink[] = [];

  notes.forEach((note) => {
    titleToNote.set(normalizeTitle(note.title), note);
    incoming.set(normalizeTitle(note.title), 0);
    outgoing.set(normalizeTitle(note.title), 0);
  });

  notes.forEach((note) => {
    const source = normalizeTitle(note.title);
    extractLinks(note.content).forEach((target) => {
      if (!target || target === source) return;
      const key = `${source}->${target}`;
      if (linkKeys.has(key)) return;
      linkKeys.add(key);
      links.push({ source, target });
      outgoing.set(source, (outgoing.get(source) || 0) + 1);
      incoming.set(target, (incoming.get(target) || 0) + 1);
    });
  });

  const selectedTitle = options?.selectedNoteId
    ? normalizeTitle(notes.find((note) => getNoteId(note) === normalizeId(options.selectedNoteId))?.title || "")
    : "";
  const localIds = new Set<string>();
  if (options?.localOnly && selectedTitle) {
    localIds.add(selectedTitle);
    links.forEach((link) => {
      if (link.source === selectedTitle) localIds.add(link.target);
      if (link.target === selectedTitle) localIds.add(link.source);
    });
  }

  const folderFilter = normalizeId(options?.folderId);
  const query = normalizeTitle(options?.query || "");
  const noteMatches = (note?: Note) => {
    if (!note) return !folderFilter && !query;
    if (folderFilter && getFolderId(note) !== folderFilter) return false;
    if (query && !normalizeTitle(note.title).includes(query) && !normalizeTitle(note.content || "").includes(query)) return false;
    return true;
  };

  const nodeKeys = new Set<string>();
  notes.forEach((note) => nodeKeys.add(normalizeTitle(note.title)));
  links.forEach((link) => nodeKeys.add(link.target));

  let nodes = [...nodeKeys].map((key, index) => {
    const note = titleToNote.get(key);
    const degree = (incoming.get(key) || 0) + (outgoing.get(key) || 0);
    const group = !note ? "ghost" : degree >= 5 ? "hub" : degree >= 2 ? "topic" : "note";

    return {
      id: key,
      noteId: note ? getNoteId(note) : undefined,
      folderId: note ? getFolderId(note) : undefined,
      title: note ? note.title : displayTitle(key),
      group,
      val: Math.max(1, degree),
      x: Math.cos(index) * 120,
      y: Math.sin(index) * 120,
      vx: 0,
      vy: 0,
    } satisfies GraphNode;
  });

  nodes = nodes.filter((node) => {
    if (options?.localOnly && !localIds.has(node.id)) return false;
    if (options?.showOrphans === false && node.val === 0) return false;
    return noteMatches(titleToNote.get(node.id));
  });

  const visible = new Set(nodes.map((node) => node.id));
  const visibleLinks = links.filter((link) => visible.has(link.source) && visible.has(link.target));

  return { nodes, links: visibleLinks };
};

const getRadius = (node: GraphNode) => Math.sqrt(node.val) * 3.2 + 5;

const hslaFromVar = (styles: CSSStyleDeclaration, name: string, alpha = 1) => {
  const value = styles.getPropertyValue(name).trim();
  const [h, s, l] = value.split(/\s+/);
  return h && s && l ? `hsla(${h}, ${s}, ${l}, ${alpha})` : `rgba(120, 120, 120, ${alpha})`;
};

const GraphView = ({ selectedNoteId, notes: externalNotes, folders = [], onSelectNote }: GraphViewProps) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<ResolvedGraphLink[]>([]);
  const transformRef = useRef<Transform>({ x: 0, y: 0, k: 1 });
  const hoveredIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const focusBlendRef = useRef(0);
  const activeIdsRef = useRef<Set<string>>(new Set());
  const pointerRef = useRef({ draggingNode: null as GraphNode | null, panning: false, moved: false, x: 0, y: 0 });
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [folderId, setFolderId] = useState("");
  const [localOnly, setLocalOnly] = useState(false);
  const [showOrphans, setShowOrphans] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);

  const loadNotes = useCallback(async () => {
    if (externalNotes) {
      setNotes(externalNotes);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/notes`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      setNotes(await response.json());
    } catch (error) {
      console.error("Error loading graph notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [externalNotes]);

  useEffect(() => {
    if (externalNotes) {
      setNotes(externalNotes);
      setLoading(false);
    } else {
      loadNotes();
    }
  }, [externalNotes, loadNotes]);

  const graph = useMemo(
    () => buildGraph(notes, { selectedNoteId, localOnly, showOrphans, query, folderId }),
    [notes, selectedNoteId, localOnly, showOrphans, query, folderId]
  );

  useEffect(() => {
    if (!selectedNoteId) return;
    const selected = nodesRef.current.find((node) => node.noteId === normalizeId(selectedNoteId));
    if (selected) setSelectedId(selected.id);
  }, [selectedNoteId, graph]);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const nodeById = new Map<string, GraphNode>();
    graph.nodes.forEach((node, index) => {
      const angle = (index / Math.max(1, graph.nodes.length)) * Math.PI * 2;
      node.x = rect.width / 2 + Math.cos(angle) * Math.min(220, rect.width / 3);
      node.y = rect.height / 2 + Math.sin(angle) * Math.min(220, rect.height / 3);
      nodeById.set(node.id, node);
    });

    nodesRef.current = graph.nodes;
    linksRef.current = graph.links
      .map((link) => ({ source: nodeById.get(link.source), target: nodeById.get(link.target) }))
      .filter((link): link is ResolvedGraphLink => Boolean(link.source && link.target));
    transformRef.current = { x: 0, y: 0, k: 1 };
    activeIdsRef.current = new Set();
    focusBlendRef.current = 0;
  }, [graph]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    const styles = getComputedStyle(document.documentElement);
    const palette = {
      primary: hslaFromVar(styles, "--primary"),
      active: hslaFromVar(styles, "--accent"),
      foreground: hslaFromVar(styles, "--foreground"),
      foregroundSoft: hslaFromVar(styles, "--foreground", 0.28),
      mutedForeground: hslaFromVar(styles, "--muted-foreground"),
      mutedForegroundDim: hslaFromVar(styles, "--muted-foreground", 0.35),
      hub: hslaFromVar(styles, "--contribution-high"),
      topic: hslaFromVar(styles, "--contribution-medium"),
      ghost: hslaFromVar(styles, "--contribution-low"),
    };

    const adjacency = () => {
      const map = new Map<string, Set<string>>();
      nodesRef.current.forEach((node) => map.set(node.id, new Set()));
      linksRef.current.forEach((link) => {
        map.get(link.source.id)?.add(link.target.id);
        map.get(link.target.id)?.add(link.source.id);
      });
      return map;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const colorFor = (node: GraphNode, active: Set<string>, focusId?: string | null) => {
      if (focusId) {
        if (node.id === focusId) return palette.primary;
        if (active.has(node.id)) return palette.active;
        return palette.mutedForegroundDim;
      }
      if (node.group === "hub") return palette.hub;
      if (node.group === "topic") return palette.topic;
      if (node.group === "ghost") return palette.ghost;
      return palette.mutedForeground;
    };

    const step = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const alpha = 0.08;

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x || 0.01;
          const dy = a.y - b.y || 0.01;
          const distanceSq = Math.max(80, dx * dx + dy * dy);
          const force = ((120 + a.val * 20 + b.val * 20) / distanceSq) * alpha;
          a.vx += dx * force;
          a.vy += dy * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
        }
      }

      links.forEach((link) => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const desired = 80 + (link.source.val + link.target.val) * 5;
        const force = ((distance - desired) / distance) * 0.02;
        const fx = dx * force;
        const fy = dy * force;
        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      });

      nodes.forEach((node) => {
        node.vx += (width / 2 - node.x) * 0.0009;
        node.vy += (height / 2 - node.y) * 0.0009;
        if (node.fx != null && node.fy != null) {
          node.x = node.fx;
          node.y = node.fy;
          node.vx = 0;
          node.vy = 0;
        } else {
          node.vx *= 0.86;
          node.vy *= 0.86;
          node.x += node.vx;
          node.y += node.vy;
        }
      });
    };

    const draw = () => {
      step();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const transform = transformRef.current;
      const focusId = hoveredIdRef.current || selectedIdRef.current;
      const nextActive = focusId ? adjacency().get(focusId) || new Set<string>() : new Set<string>();
      if (focusId) {
        activeIdsRef.current = nextActive;
      }
      const active = activeIdsRef.current;
      const desiredBlend = focusId ? 1 : 0;
      focusBlendRef.current += (desiredBlend - focusBlendRef.current) * 0.14;
      const focusBlend = focusBlendRef.current;

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      linksRef.current.forEach((link) => {
        const isActive = focusId && (link.source.id === focusId || link.target.id === focusId);
        const idleAlpha = 0.62;
        const focusedAlpha = isActive ? 0.9 : 0.14;
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = isActive
          ? hslaFromVar(styles, "--primary", 0.45 + 0.45 * focusBlend)
          : hslaFromVar(styles, "--border", idleAlpha + (focusedAlpha - idleAlpha) * focusBlend);
        ctx.lineWidth = 0.8 + (isActive ? 1 : 0) * focusBlend;
        ctx.stroke();
      });

      nodesRef.current.forEach((node) => {
        const radius = getRadius(node);
        const activeNode = node.id === focusId || active.has(node.id);
        ctx.globalAlpha = activeNode ? 1 : 1 - 0.65 * focusBlend;
        if (node.id === focusId) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 6 + 4 * focusBlend, 0, Math.PI * 2);
          ctx.fillStyle = hslaFromVar(styles, "--primary", 0.18 * focusBlend);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = colorFor(node, active, focusId);
        ctx.fill();
        ctx.lineWidth = node.pinned ? 2 : 0.8;
        ctx.strokeStyle = node.pinned ? palette.foreground : palette.foregroundSoft;
        ctx.stroke();

        if (transform.k > 0.65 || activeNode) {
          const size = Math.max(9, Math.min(13, 11 / transform.k));
          ctx.font = node.id === focusId ? `bold ${size}px sans-serif` : `${size}px sans-serif`;
          ctx.fillStyle = node.id === focusId ? palette.foreground : palette.mutedForeground;
          ctx.fillText(node.title, node.x + radius + 7, node.y + 4);
        }
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    animationRef.current = requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [theme]);

  const graphPoint = (clientX: number, clientY: number, element: HTMLCanvasElement) => {
    const rect = element.getBoundingClientRect();
    const transform = transformRef.current;
    return {
      x: (clientX - rect.left - transform.x) / transform.k,
      y: (clientY - rect.top - transform.y) / transform.k,
    };
  };

  const findNode = (clientX: number, clientY: number, element: HTMLCanvasElement, padding = 8) => {
    const point = graphPoint(clientX, clientY, element);
    for (let i = nodesRef.current.length - 1; i >= 0; i -= 1) {
      const node = nodesRef.current[i];
      const radius = getRadius(node) + padding;
      if ((point.x - node.x) ** 2 + (point.y - node.y) ** 2 <= radius ** 2) return node;
    }
    return null;
  };

  return (
    <div ref={containerRef} className="relative h-full overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab active:cursor-grabbing"
        onWheel={(event) => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const transform = transformRef.current;
          const nextK = Math.min(5, Math.max(0.15, transform.k * (event.deltaY > 0 ? 0.9 : 1.1)));
          const mx = event.clientX - rect.left;
          const my = event.clientY - rect.top;
          transformRef.current = {
            k: nextK,
            x: mx - ((mx - transform.x) / transform.k) * nextK,
            y: my - ((my - transform.y) / transform.k) * nextK,
          };
        }}
        onPointerDown={(event) => {
          const node = findNode(event.clientX, event.clientY, event.currentTarget, 12);
          pointerRef.current = { draggingNode: node, panning: !node, moved: false, x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
          if (node) {
            node.fx = node.x;
            node.fy = node.y;
          }
        }}
        onPointerMove={(event) => {
          const pointer = pointerRef.current;
          if (pointer.draggingNode) {
            const point = graphPoint(event.clientX, event.clientY, event.currentTarget);
            pointer.draggingNode.fx = point.x;
            pointer.draggingNode.fy = point.y;
            return;
          }
          if (pointer.panning) {
            if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 1) {
              pointer.moved = true;
            }
            transformRef.current.x += event.clientX - pointer.x;
            transformRef.current.y += event.clientY - pointer.y;
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            return;
          }
          const node = findNode(event.clientX, event.clientY, event.currentTarget);
          setHoveredId(node?.id || null);
          setTooltip(node ? { x: event.clientX + 14, y: event.clientY + 14, node } : null);
        }}
        onPointerUp={(event) => {
          const pointer = pointerRef.current;
          const node = pointer.draggingNode;
          if (node) {
            const moved = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 4;
            if (!moved) {
              node.pinned = !node.pinned;
              setSelectedId(node.pinned ? node.id : null);
            }
            if (!node.pinned) {
              node.fx = null;
              node.fy = null;
            }
          } else if (!pointer.moved) {
            setSelectedId(null);
          }
          pointerRef.current = { draggingNode: null, panning: false, moved: false, x: 0, y: 0 };
        }}
        onPointerLeave={() => {
          setHoveredId(null);
          setTooltip(null);
        }}
        onDoubleClick={(event) => {
          const node = findNode(event.clientX, event.clientY, event.currentTarget, 12);
          if (node?.noteId && onSelectNote) {
            onSelectNote(node.noteId, node.folderId);
            return;
          }
          transformRef.current = { x: 0, y: 0, k: 1 };
        }}
      />

      <div className="absolute left-4 top-4 w-80 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-foreground shadow-lg backdrop-blur">
        <div className="mb-1 flex items-center gap-2">
          <strong className="text-sm">Graph View</strong>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadNotes} title="Refresh graph" disabled={Boolean(externalNotes)}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="mb-2 text-muted-foreground">{graph.nodes.length} nodes / {graph.links.length} links</div>
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search graph"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          >
            <option value="">All folders</option>
            {folders.map((folder) => (
              <option key={normalizeId(folder._id || folder.id)} value={normalizeId(folder._id || folder.id)}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          <Button variant={localOnly ? "default" : "outline"} size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setLocalOnly(prev => !prev)}>
            <LocateFixed className="h-3.5 w-3.5" />
            Local
          </Button>
          <Button variant={showOrphans ? "default" : "outline"} size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setShowOrphans(prev => !prev)}>
            <CircleDot className="h-3.5 w-3.5" />
            Orphans
          </Button>
        </div>
        <div className="mt-1 text-muted-foreground">Scroll zoom / Drag pan / Click pin / Double click open</div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 text-sm text-muted-foreground">
          Loading graph...
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          No notes to map yet.
        </div>
      )}

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-medium">{tooltip.node.title}</div>
          <div className="text-muted-foreground">{tooltip.node.group} / {tooltip.node.val} links</div>
          {tooltip.node.noteId && (
            <div className="mt-1 max-w-64 line-clamp-3 text-muted-foreground">
              {notes.find((note) => getNoteId(note) === tooltip.node.noteId)?.content || "No preview content"}
            </div>
          )}
          {tooltip.node.pinned && <div className="text-muted-foreground">Pinned</div>}
        </div>
      )}
    </div>
  );
};

export default GraphView;
