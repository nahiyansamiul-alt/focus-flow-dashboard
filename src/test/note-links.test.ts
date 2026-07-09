import { describe, expect, it } from "vitest";
import {
  getBacklinks,
  getUnlinkedMentions,
  resolveWikiLinks,
  type LinkableNote,
} from "@/lib/note-links";

const notes: LinkableNote[] = [
  { id: 1, title: "Alpha", content: "Core idea" },
  { id: 2, title: "Beta", content: "Links to [[Alpha]] and [[Missing Page]]" },
  { id: 3, title: "Gamma", content: "Alpha is mentioned here without a wiki link." },
  { id: 4, title: "Delta", content: "```md\nAlpha inside code should not count\n```" },
  { id: 5, title: "Empty", content: null },
];

describe("note link analysis", () => {
  it("resolves outgoing and missing wiki links", () => {
    const links = resolveWikiLinks(notes, [], notes[1].content);

    expect(links.find((link) => link.target === "Alpha")?.type).toBe("note");
    expect(links.find((link) => link.target === "Missing Page")?.type).toBe("missing");
  });

  it("finds linked backlinks", () => {
    const backlinks = getBacklinks(notes, notes[0], []);

    expect(backlinks.map((note) => note.title)).toEqual(["Beta"]);
  });

  it("finds unlinked mentions outside code and existing wiki links", () => {
    const mentions = getUnlinkedMentions(notes, notes[0], []);

    expect(mentions.map((mention) => mention.note.title)).toEqual(["Gamma"]);
    expect(mentions[0].count).toBe(1);
  });

  it("ignores null note content while scanning mentions", () => {
    expect(() => getUnlinkedMentions(notes, notes[0], [])).not.toThrow();
  });
});
