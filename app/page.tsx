"use client";

import { useEffect, useState } from "react";
import { getPlayerLogs } from "../lib/playerLogs";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [rosters, setRosters] = useState<any>({});
  const [playerLogs, setPlayerLogs] = useState<any>({});
  const [loadingLogs, setLoadingLogs] = useState(false);
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

    const players = [
  ...(homeRoster?.athletes || []),
  ...(awayRoster?.athletes || []),
];

const results = await Promise.all(
  players.map(async (player: any) => {
    try {
      const logs = await getPlayerLogs(
        String(player.id)
      );

      return {
        id: player.id,
        logs,
      };
    } catch {
      return {
        id: player.id,
        logs: [],
      };
    }
  })
);

const logsMap: any = {};

results.forEach((result) => {
  logsMap[result.id] = result.logs;
});

setPlayerLogs((prev: any) => ({
  ...prev,
  ...logsMap,
}));

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

  {(rosters[game.id]?.away || [])
.filter((player: any) => {
  const logs = playerLogs[player.id];
  const recentLogs = logs.slice(0, 10);

  if (!logs?.length) {
    return false;
  }

  const avgMinutes =
    logs.reduce(
      (sum: number, game: any) =>
        sum + game.min,
      0
    ) / logs.length;

  return avgMinutes >= 30;
})
  .map(
    (player: any) => (


<div
  key={player.id}
  style={{
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #374151",
    borderRadius: "8px",
  }}
>

<div key={player.id}>
  {(() => {
    const logs = playerLogs[player.id] || [];
    const recentLogs = logs.slice(0, 10);

    const avgMinutes = recentLogs.length
      ? (
          recentLogs.reduce(
            (sum: number, game: any) =>
              sum + game.min,
            0
          ) / recentLogs.length
        ).toFixed(1)
      : "0.0";

    return (
      <>
        {player.displayName} | {avgMinutes} MPG
      </>
    );
  })()}
</div>

<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  PTS

  {[
    20, 25, 30, 35, 40,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.pts >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (

      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  REB

  {[
    8, 10, 12, 14, 16,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.reb >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  AST

  {[
    8, 10, 12, 14,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.ast >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  3PM

  {[
    4, 5, 6, 7,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.threes >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  PRA

  {[
    40, 45, 50, 55, 60,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.pts +
              game.reb +
              game.ast >=
            line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
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

  {(rosters[game.id]?.home || [])
  .filter((player: any) => {
    const logs = playerLogs[player.id];
    const recentLogs = logs.slice(0, 10);

    if (!logs?.length) {
      return false;
    }

    const avgMinutes =
      logs.reduce(
        (sum: number, game: any) =>
          sum + game.min,
        0
      ) / logs.length;

    return avgMinutes >= 30;
  })
  .map(
    (player: any) => (

<div
  key={player.id}
  style={{
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #374151",
    borderRadius: "8px",
  }}
>

<div key={player.id}>
  {(() => {
    const logs = playerLogs[player.id] || [];
    const recentLogs = logs.slice(0, 10);

    const avgMinutes = recentLogs.length
      ? (
          recentLogs.reduce(
            (sum: number, game: any) =>
              sum + game.min,
            0
          ) / recentLogs.length
        ).toFixed(1)
      : "0.0";

    return (
      <>
        {player.displayName} | {avgMinutes} MPG
      </>
    );
  })()}
</div>

<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  PTS

  {[
    20, 25, 30, 35, 40,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.pts >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (

      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  REB

  {[
    8, 10, 12, 14, 16,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.reb >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  AST

  {[
    8, 10, 12, 14,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.ast >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  3PM

  {[
    4, 5, 6, 7,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.threes >= line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
<div
  style={{
    marginTop: "8px",
    fontWeight: "bold",
  }}
>
  PRA

  {[
    40, 45, 50, 55, 60,
  ]
    .map((line) => {
      const recentLogs =
        playerLogs[player.id]
          ?.slice(0, 10) || [];

      const hits =
        recentLogs.filter(
          (game: any) =>
            game.pts +
              game.reb +
              game.ast >=
            line
        ).length;

      return {
        line,
        hits,
      };
    })
.filter(
  (stat) =>
    stat.hits === 0 ||
    stat.hits === 1
)
.filter((stat, index, arr) => {
  if (stat.hits === 1) {
    return (
      stat ===
      arr.filter(
        (s) => s.hits === 1
      ).slice(-1)[0]
    );
  }

  const highestOne =
    arr.filter(
      (s) => s.hits === 1
    ).slice(-1)[0];

  if (!highestOne) {
    return (
      stat ===
      arr.find(
        (s) => s.hits === 0
      )
    );
  }

  return (
    stat.hits === 0 &&
    stat.line > highestOne.line &&
    stat ===
      arr.find(
        (s) =>
          s.hits === 0 &&
          s.line > highestOne.line
      )
  );
})
.map((stat) => (
      <div key={stat.line}>
        {stat.line}+ : {stat.hits}/10
      </div>
    ))}
</div>
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