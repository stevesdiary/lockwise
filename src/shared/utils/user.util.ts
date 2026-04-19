/**
 * Returns the polite display name to use when addressing a user.
 * If the user has a title (Dr., Prof., Mr., etc.) the title + last name is returned
 * so that greetings read naturally: "Hello Dr. Zuma" / "Good morning Dr. Zuma".
 * Falls back to first name when no title is set.
 */
export const formatDisplayName = (user: {
  title?: string | null;
  first_name: string;
  last_name?: string | null;
}): string => {
  if (user.title?.trim()) {
    return `${user.title.trim()} ${(user.last_name || user.first_name).trim()}`.trim();
  }
  return user.first_name;
};
