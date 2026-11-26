export async function getPlayerLogs(
  playerId: string
) {
  const res = await fetch(
    `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${playerId}/gamelog`
  );

  const data = await res.json();

  const games =
    data?.seasonTypes?.[0]?.categories?.flatMap(
      (category: any) => category.events || []
    ) || [];

  return games.map((game: any) => ({
    min: Number(game.stats?.[0] || 0),
    reb: Number(game.stats?.[7] || 0),
    ast: Number(game.stats?.[8] || 0),
    pts: Number(game.stats?.[13] || 0),
    threes: Number(
      game.stats?.[3]?.split("-")[0] || 0
    ),
  }));
}