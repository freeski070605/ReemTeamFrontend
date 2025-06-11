/**
  * Formats a currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Formats a date or timestamp
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncates text with ellipsis if it exceeds max length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formats a username for display
 */
export function formatUsername(username: string, maxLength: number = 12): string {
  return truncateText(username, maxLength);
}

/**
 * Generates a default avatar URL based on username
 */
export function getDefaultAvatar(username: string): string {
  return `https://avatars.dicebear.com/api/initials/${username}.svg`;
}

/**
 * Formats a game ID for display
 */
export function formatGameId(gameId: string): string {
  if (gameId.startsWith('game-')) {
    return gameId.replace('game-', 'G-');
  }
  return gameId;
}

/**
 * Generates a stake display class based on amount
 */
export function getStakeColorClass(amount: number): string {
  switch (amount) {
    case 1: return 'bg-green-700 border-green-500';
    case 5: return 'bg-blue-700 border-blue-500';
    case 10: return 'bg-yellow-700 border-yellow-500';
    case 20: return 'bg-red-700 border-red-500';
    case 50: return 'bg-purple-700 border-purple-500';
    default: return 'bg-gray-700 border-gray-500';
  }
}
 