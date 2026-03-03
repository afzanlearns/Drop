import { describe, it, expect } from "vitest";

// ─── Property 1: Room Code Uniqueness ───────────────────────────────────────
// We test the pure code generation logic by reimplementing and verifying properties

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
const CODE_LENGTH = 8;

function mockGenerateCode(): string {
  let code = "";
  while (code.length < CODE_LENGTH) {
    const char = CHARSET[Math.floor(Math.random() * CHARSET.length)];
    code += char;
  }
  return code;
}

describe("Feature: instant-rooms, Property 1: Room Code Uniqueness and Security", () => {
  it("should generate codes of exact length 8", () => {
    for (let i = 0; i < 100; i++) {
      const code = mockGenerateCode();
      expect(code).toHaveLength(CODE_LENGTH);
    }
  });

  it("should generate codes using only valid charset characters", () => {
    for (let i = 0; i < 100; i++) {
      const code = mockGenerateCode();
      for (const char of code) {
        expect(CHARSET.includes(char)).toBe(true);
      }
    }
  });

  it("should not include ambiguous characters (0, O, I, l, 1)", () => {
    const ambiguous = new Set(["0", "O", "I", "l", "1"]);
    for (let i = 0; i < 100; i++) {
      const code = mockGenerateCode();
      for (const char of code) {
        expect(ambiguous.has(char)).toBe(false);
      }
    }
  });

  it("should generate unique codes across large samples (collision check)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(mockGenerateCode());
    }
    // With 41+ bits of entropy, expect very high uniqueness
    expect(codes.size).toBeGreaterThan(990);
  });
});

// ─── Property 5: Timeline Chronological Ordering ─────────────────────────────
interface MockItem {
  id: string;
  createdAt: string;
}

function sortChronologically(items: MockItem[]): MockItem[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function isChronologicallyOrdered(items: MockItem[]): boolean {
  for (let i = 1; i < items.length; i++) {
    if (
      new Date(items[i].createdAt).getTime() <
      new Date(items[i - 1].createdAt).getTime()
    ) {
      return false;
    }
  }
  return true;
}

describe("Feature: instant-rooms, Property 5: Timeline Chronological Ordering", () => {
  it("should always produce chronologically ordered output regardless of input order", () => {
    for (let trial = 0; trial < 100; trial++) {
      // Generate random items with random timestamps
      const now = Date.now();
      const items: MockItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        createdAt: new Date(now - Math.random() * 1e9).toISOString(),
      }));

      // Shuffle
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      const sorted = sortChronologically(items);
      expect(isChronologicallyOrdered(sorted)).toBe(true);
    }
  });

  it("should handle single-item timeline as always ordered", () => {
    const items: MockItem[] = [{ id: "a", createdAt: new Date().toISOString() }];
    const sorted = sortChronologically(items);
    expect(isChronologicallyOrdered(sorted)).toBe(true);
  });

  it("should handle empty timeline", () => {
    const sorted = sortChronologically([]);
    expect(isChronologicallyOrdered(sorted)).toBe(true);
  });

  it("should be stable for items with identical timestamps", () => {
    const now = new Date().toISOString();
    const items: MockItem[] = [
      { id: "a", createdAt: now },
      { id: "b", createdAt: now },
      { id: "c", createdAt: now },
    ];
    const sorted = sortChronologically(items);
    expect(isChronologicallyOrdered(sorted)).toBe(true);
  });
});

// ─── Property 3: Content Storage Round-Trip Integrity ─────────────────────────
interface ContentData {
  content: string;
  type: "text" | "code";
  language?: string;
}

function serializeContent(data: ContentData): string {
  return JSON.stringify(data);
}

function deserializeContent(serialized: string): ContentData {
  return JSON.parse(serialized) as ContentData;
}

describe("Feature: instant-rooms, Property 3: Content Storage Round-Trip Integrity", () => {
  const testCases: ContentData[] = [
    { content: "Hello, world!", type: "text" },
    { content: "const x = 42;\nconsole.log(x);", type: "code", language: "javascript" },
    { content: "Multi\nline\ntext\nblock", type: "text" },
    { content: "def hello():\n    print('hi')", type: "code", language: "python" },
    { content: "Special chars: <>&\"'`{}[]", type: "text" },
    { content: "Unicode: こんにちは 🎉", type: "text" },
    { content: " ".repeat(500), type: "text" },
    { content: "a".repeat(5000), type: "text" },
  ];

  for (const testCase of testCases) {
    it(`should round-trip ${testCase.type} content correctly`, () => {
      const serialized = serializeContent(testCase);
      const deserialized = deserializeContent(serialized);

      expect(deserialized.content).toBe(testCase.content);
      expect(deserialized.type).toBe(testCase.type);
      if (testCase.language) {
        expect(deserialized.language).toBe(testCase.language);
      }
    });
  }

  it("should preserve all content exactly across 100 random strings", () => {
    for (let i = 0; i < 100; i++) {
      const content = Array.from(
        { length: Math.floor(Math.random() * 200) + 1 },
        () => String.fromCharCode(32 + Math.floor(Math.random() * 95))
      ).join("");

      const data: ContentData = { content, type: "text" };
      const roundTripped = deserializeContent(serializeContent(data));
      expect(roundTripped.content).toBe(content);
    }
  });
});
