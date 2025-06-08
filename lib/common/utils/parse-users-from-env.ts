/**
 * Converts a comma-delimited list into an object representation.
 * @param input - The comma-delimited string (e.g., "one=TWO,four=FIVE,six=SEVEN").
 * @returns An object where keys are the left-hand side and values are the right-hand side of the "=".
 */
export function parseUsersFromEnv(input: string): Record<string, string> {
  return input.split(',').reduce<Record<string, string>>((result, pair) => {
    const [key, value] = pair.split('=');
    if (key && value) {
      result[key.trim()] = value.trim();
    }
    return result;
  }, {});
}