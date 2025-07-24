import { createHash } from 'crypto';

function generatePlayerId(email) {
  return createHash('sha256').update(email).digest('hex');
}

export async function generatePlayersByDate(log) {
  const playersByDate = new Map();

  // Assuming 'log' is the result of simpleGit().log()
  for (const commit of log.all) {
    const authorEmail = commit.author.email;
    const commitDay = new Date(commit.date).toDateString();
    const playerId = generatePlayerId(authorEmail);

    if (!playersByDate.has(commitDay)) {
      playersByDate.set(commitDay, []);
    }

    const playersForDay = playersByDate.get(commitDay);

    // Check if player already exists for this day to avoid duplicates
    if (!playersForDay.some(player => player.id === playerId)) {
      playersForDay.push({ id: playerId });
    }
  }

  return playersByDate;
}