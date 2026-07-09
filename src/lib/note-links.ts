export interface LinkableNote {
  _id?: string | number;
  id?: string | number;
  title: string;
  content?: string | null;
  folderId?: string | number | { _id?: string | number; id?: string | number };
  pinned?: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  lastViewedAt?: string | Date | null;
}

export interface LinkableFolder {
  _id?: string | number;
  id?: string | number;
  name: string;
}

export interface WikiLink {
  raw: string;
  target: string;
  alias?: string;
  normalizedTarget: string;
}

export interface ResolvedWikiLink extends WikiLink {
  type: "note" | "folder" | "missing";
  note?: LinkableNote;
  folder?: LinkableFolder;
  createTitle: string;
  createFolderId?: string;
}

export interface UnlinkedMention {
  note: LinkableNote;
  count: number;
  excerpt: string;
}

const normalizeId = (value?: string | number | null) => value == null ? "" : String(value);

export const getNoteId = (note: LinkableNote) => normalizeId(note._id || note.id);

export const getFolderId = (folder: LinkableFolder) => normalizeId(folder._id || folder.id);

export const getNoteFolderId = (note: LinkableNote) => {
  if (typeof note.folderId === "object") return normalizeId(note.folderId?._id || note.folderId?.id);
  return normalizeId(note.folderId);
};

export const normalizeNoteTitle = (value: string) =>
  value
    .trim()
    .replace(/\.md$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

const normalizePathPart = (value: string) => normalizeNoteTitle(value).replace(/\s+/g, " ");

export const displayWikiTarget = (value: string) => value.trim().replace(/\.md$/i, "");

export const getWikiTargetParts = (target: string) => {
  const parts = displayWikiTarget(target)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return {
      folderPath: "",
      folderName: "",
      noteTitle: parts[0] || displayWikiTarget(target),
    };
  }

  return {
    folderPath: parts.slice(0, -1).join("/"),
    folderName: parts[parts.length - 2],
    noteTitle: parts[parts.length - 1],
  };
};

const splitWikiLink = (value: string) => {
  const [targetWithHeading, alias] = value.split("|");
  const [target] = targetWithHeading.split("#");
  return {
    target: displayWikiTarget(target),
    alias: alias?.trim(),
  };
};

const textValue = (value?: string | null) => value || "";

export const parseWikiLinks = (content?: string | null): WikiLink[] => {
  const links: WikiLink[] = [];
  const seen = new Set<string>();
  const re = /!?\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;
  const text = textValue(content);

  while ((match = re.exec(text))) {
    const { target, alias } = splitWikiLink(match[1]);
    if (!target) continue;
    const normalizedTarget = normalizeNoteTitle(target);
    const key = `${normalizedTarget}:${alias || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ raw: match[0], target, alias, normalizedTarget });
  }

  return links;
};

export const findFolderByName = (folders: LinkableFolder[], name: string) => {
  const normalized = normalizePathPart(name);
  return folders.find((folder) => normalizePathPart(folder.name) === normalized);
};

export const findNoteByTitle = (notes: LinkableNote[], title: string, folderId?: string) => {
  const normalized = normalizeNoteTitle(title);
  return notes.find((note) => {
    const titleMatches = normalizeNoteTitle(note.title) === normalized;
    if (!titleMatches) return false;
    return folderId ? getNoteFolderId(note) === folderId : true;
  });
};

export const resolveWikiTarget = (
  notes: LinkableNote[],
  folders: LinkableFolder[],
  target: string
): Pick<ResolvedWikiLink, "type" | "note" | "folder" | "createTitle" | "createFolderId"> => {
  const trimmedTarget = displayWikiTarget(target);
  if (trimmedTarget.endsWith("/")) {
    const folderName = trimmedTarget.replace(/\/+$/g, "");
    const folder = findFolderByName(folders, folderName);
    if (folder) return { type: "folder", folder, createTitle: folder.name, createFolderId: getFolderId(folder) };
    return { type: "missing", createTitle: folderName };
  }

  const parts = getWikiTargetParts(trimmedTarget);

  if (!trimmedTarget.includes("/")) {
    const note = findNoteByTitle(notes, trimmedTarget);
    if (note) return { type: "note", note, createTitle: trimmedTarget };

    const folder = findFolderByName(folders, trimmedTarget);
    if (folder) return { type: "folder", folder, createTitle: trimmedTarget };

    return { type: "missing", createTitle: trimmedTarget };
  }

  const folder = findFolderByName(folders, parts.folderPath) || findFolderByName(folders, parts.folderName);
  const folderId = folder ? getFolderId(folder) : undefined;
  const note = findNoteByTitle(notes, parts.noteTitle, folderId);

  if (note) return { type: "note", note, folder, createTitle: parts.noteTitle, createFolderId: folderId };
  if (folder && !parts.noteTitle) return { type: "folder", folder, createTitle: folder.name, createFolderId: folderId };

  return { type: "missing", folder, createTitle: parts.noteTitle || trimmedTarget, createFolderId: folderId };
};

export const resolveWikiLinks = (
  notes: LinkableNote[],
  folders: LinkableFolder[],
  content?: string | null
): ResolvedWikiLink[] =>
  parseWikiLinks(content).map((link) => ({
    ...link,
    ...resolveWikiTarget(notes, folders, link.target),
  }));

export const getBacklinks = (
  notes: LinkableNote[],
  currentNote: LinkableNote,
  folders: LinkableFolder[] = []
) => {
  const currentId = getNoteId(currentNote);
  const currentTitle = normalizeNoteTitle(currentNote.title);
  const currentFolderId = getNoteFolderId(currentNote);

  return notes.filter((note) => {
    if (getNoteId(note) === currentId) return false;
    return parseWikiLinks(note.content).some((link) => {
      const resolved = resolveWikiTarget(notes, folders, link.target);
      if (resolved.note) return getNoteId(resolved.note) === currentId;

      const parts = getWikiTargetParts(link.target);
      if (normalizeNoteTitle(parts.noteTitle) !== currentTitle) return false;
      if (!parts.folderName) return true;

      const folder = findFolderByName(folders, parts.folderPath) || findFolderByName(folders, parts.folderName);
      return currentFolderId && folder ? getFolderId(folder) === currentFolderId : false;
    });
  });
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripCodeAndLinks = (content?: string | null) =>
  textValue(content)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[\[[^\]]+\]\]/g, " ")
    .replace(/!?\[[^\]]*\]\([^)]+\)/g, " ");

const excerptAround = (content: string, index: number, length: number) => {
  const start = Math.max(0, index - 54);
  const end = Math.min(content.length, index + length + 72);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";
  return `${prefix}${content.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`;
};

export const getUnlinkedMentions = (
  notes: LinkableNote[],
  currentNote: LinkableNote,
  folders: LinkableFolder[] = []
): UnlinkedMention[] => {
  const currentId = getNoteId(currentNote);
  const title = displayWikiTarget(currentNote.title).trim();
  if (!title || title.length < 2) return [];

  const linkedBacklinkIds = new Set(getBacklinks(notes, currentNote, folders).map(getNoteId));
  const titlePattern = escapeRegExp(title).replace(/\s+/g, "\\s+");
  const hasWordEdges = /^[\w\s-]+$/.test(title);
  const pattern = hasWordEdges
    ? new RegExp(`(^|[^\\p{L}\\p{N}_])(${titlePattern})(?=$|[^\\p{L}\\p{N}_])`, "giu")
    : new RegExp(`(${titlePattern})`, "giu");

  return notes
    .filter((note) => getNoteId(note) !== currentId && !linkedBacklinkIds.has(getNoteId(note)))
    .map((note) => {
      const searchable = stripCodeAndLinks(note.content);
      let count = 0;
      let firstIndex = -1;
      let match: RegExpExecArray | null;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(searchable))) {
        count += 1;
        if (firstIndex === -1) firstIndex = match.index;
      }
      return count
        ? { note, count, excerpt: excerptAround(searchable, firstIndex, title.length) }
        : null;
    })
    .filter((mention): mention is UnlinkedMention => Boolean(mention))
    .sort((a, b) => b.count - a.count || a.note.title.localeCompare(b.note.title));
};

const encodeWikiHref = (target: string) => `wikilink:${encodeURIComponent(target)}`;

const replaceInlineWikiLinks = (line: string) =>
  line
    .split(/(`[^`]*`)/g)
    .map((segment) => {
      if (segment.startsWith("`") && segment.endsWith("`")) return segment;
      return segment.replace(/!?\[\[([^\]]+)\]\]/g, (_raw, inner) => {
        const { target, alias } = splitWikiLink(inner);
        const label = alias || displayWikiTarget(target);
        return `[${label}](${encodeWikiHref(target)})`;
      });
    })
    .join("");

export const renderableMarkdownWithWikiLinks = (content?: string | null) => {
  let inFence = false;
  return textValue(content)
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      return inFence ? line : replaceInlineWikiLinks(line);
    })
    .join("\n");
};
