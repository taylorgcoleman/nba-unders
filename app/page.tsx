"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [rosters, setRosters] = useState<any>({});
const [openGame, setOpenGame] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      const today = new Date();

      const dateParam =
        today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getDate()).padStart(2, "0");

      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateParam}`
      );

      const data = await res.json();

      setGames(data.events || []);
    }

    loadGames();
  }, []);

  async function loadRoster(teamId: string) {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`
  );

  return await res.json();
}

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: "24px",
      }}
    >
      <h1>NBA Under Dashboard</h1>

      {games.map((game) => {
        const competition = game.competitions?.[0];

        const away = competition?.competitors?.find(
          (c: any) => c.homeAway === "away"
        );

        const home = competition?.competitors?.find(
          (c: any) => c.homeAway === "home"
        );
        const isOpen = openGame === game.id;

        return (
<div
  key={game.id}
  style={{
    background: "#111827",
    border: "1px solid #374151",
    borderRadius: "12px",
    marginBottom: "12px",
    overflow: "hidden",
  }}
>
  <button
onClick={async () => {
  if (isOpen) {
    setOpenGame(null);
    return;
  }

  setOpenGame(game.id);

  if (!rosters[game.id]) {
    const homeRoster = await loadRoster(
      home.team.id
    );

    const awayRoster = await loadRoster(
      away.team.id
    );

    setRosters((prev: any) => ({
      ...prev,
      [game.id]: {
        home: homeRoster?.athletes || [],
        away: awayRoster?.athletes || [],
      },
    }));
  }
}}
    style={{
      width: "100%",
      padding: "16px",
      background: "transparent",
      border: "none",
      color: "white",
      textAlign: "left",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "bold",
    }}
  >
    {away?.team?.displayName} @{" "}
    {home?.team?.displayName}
  </button>

  {openGame === game.id && (
    <div
      style={{
        padding: "16px",
        borderTop: "1px solid #374151",
      }}
    >
<div>
  <h3>Away Team</h3>

  {(rosters[game.id]?.away || []).map(
    (player: any) => (
      <div key={player.id}>
        {player.displayName}
      </div>
    )
  )}

  <h3
    style={{
      marginTop: "24px",
    }}
  >
    Home Team
  </h3>

  {(rosters[game.id]?.home || []).map(
    (player: any) => (
      <div key={player.id}>
        {player.displayName}
      </div>
    )
  )}
</div>
    </div>
  )}
</div>
        );
      })}
    </main>
  );
}