import { describe, expect, it } from "vitest";
import { readMarkdownImportFiles, uniqueImportTitle } from "@/lib/markdown-vault";
import type { LinkableNote } from "@/lib/note-links";

const markdownFile = (content: string, name: string, webkitRelativePath = name) => ({
  name,
  webkitRelativePath,
  text: async () => content,
});

describe("markdown vault import", () => {
  it("preserves folder names from markdown folder imports", async () => {
    const imports = await readMarkdownImportFiles([
      markdownFile("# Alpha", "Alpha.md", "Projects/Research/Alpha.md"),
      markdownFile("# Beta", "Beta.md", "Daily/Beta.md"),
      markdownFile("Ignore me", "notes.txt", "Daily/notes.txt"),
    ] as unknown as File[]);

    expect(imports).toEqual([
      { title: "Alpha", content: "# Alpha", folderName: "Research" },
      { title: "Beta", content: "# Beta", folderName: "Daily" },
    ]);
  });

  it("generates stable titles when imported notes collide", () => {
    const existing: LinkableNote[] = [
      { id: 1, title: "Alpha" },
      { id: 2, title: "Alpha 2" },
    ];

    expect(uniqueImportTitle("Alpha", existing)).toBe("Alpha 3");
    expect(uniqueImportTitle("Beta", existing)).toBe("Beta");
  });
});
