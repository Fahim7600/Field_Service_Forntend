const SKILLS_KEY_PREFIX = "fs_skills_";

/**
 * Saves technician skills to localStorage under a user-specific key.
 */
export function saveSkills(userId: string, skillIds: string[]): void {
  if (typeof window === "undefined" || !userId) return;

  try {
    localStorage.setItem(
      `${SKILLS_KEY_PREFIX}${userId}`,
      JSON.stringify(skillIds),
    );
  } catch {
    // Gracefully handle storage quota or privacy mode errors
  }
}

/**
 * Loads technician skills from localStorage for the given user.
 * Returns null if no cache is found or if parsing fails.
 */
export function loadSkills(userId: string): string[] | null {
  if (typeof window === "undefined" || !userId) return null;

  try {
    const raw = localStorage.getItem(`${SKILLS_KEY_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return parsed as string[];
    }
    return null;
  } catch {
    return null;
  }
}
