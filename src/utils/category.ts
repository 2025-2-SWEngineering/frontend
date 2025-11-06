export function getGroupCategories(groupId: number): string[] {
  try {
    const raw = localStorage.getItem(`group_categories_${groupId}`);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(parsed)) {
      return parsed.filter((v) => typeof v === "string").slice(0, 200);
    }
    return [];
  } catch {
    return [];
  }
}

export function setGroupCategories(groupId: number, categories: string[]): void {
  const uniq = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
  localStorage.setItem(`group_categories_${groupId}`, JSON.stringify(uniq));
  try {
    const event = new CustomEvent("group-categories-updated", { detail: { groupId } });
    window.dispatchEvent(event);
  } catch {
    // ignore
  }
}

