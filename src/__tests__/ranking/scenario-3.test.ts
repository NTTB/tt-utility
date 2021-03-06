import { getSetWinner } from "../../helpers";
import { parseSetScore } from "../../parsers";
import { TTMatchRules, TTSetRules } from "../../rules";
import { TTMatch } from "../../tt-match";
import { TTMatchRank, generateMatchRank } from "../../tt-match-rank";

describe("Scenario 3", () => {
  let match: TTMatch<string>;
  let ranking: TTMatchRank<string>;
  const matchRules: TTMatchRules = { defeatPoints: 0, victoryPoints: 1 };
  const setRules: TTSetRules = {
    bestOf: 5,
    gameRules: { scoreDistance: 2, scoreMinimum: 11 },
  };
  beforeAll(() => {
    match = new TTMatch<string>();
    const p1 = match.addPlayer("A");
    const p2 = match.addPlayer("B");
    const p3 = match.addPlayer("C");
    const p4 = match.addPlayer("D");
    const p5 = match.addPlayer("E");
    const p6 = match.addPlayer("F");

    match.addSet(p3, p4, parseSetScore("9-11,8-11,9-11"));
    match.addSet(p2, p5, parseSetScore("7-11,9-11,9-11"));
    match.addSet(p1, p6, parseSetScore("10-12,10-12,10-12"));

    match.addSet(p2, p4, parseSetScore("11-7,11-4,11-6"));
    match.addSet(p3, p6, parseSetScore("11-3,11-7,11-9"));
    match.addSet(p1, p5, parseSetScore("11-7,11-5,11-2"));

    match.addSet(p5, p6, parseSetScore("11-9,11-5,11-8"));
    match.addSet(p2, p3, parseSetScore("6-11,9-11,10-12"));
    match.addSet(p1, p4, parseSetScore("11-3,11-0,11-4"));

    match.addSet(p2, p6, parseSetScore("11-7,11-7,11-8"));
    match.addSet(p4, p5, parseSetScore("11-8,11-9,11-5"));
    match.addSet(p1, p3, parseSetScore("7-11,10-12,8-11"));

    match.addSet(p4, p6, parseSetScore("5-11,4-11,8-11"));
    match.addSet(p3, p5, parseSetScore("11-7,11-5,9-11,10-12,9-11"));
    match.addSet(p1, p2, parseSetScore("11-8,11-7,11-2"));

    ranking = generateMatchRank(match, matchRules, setRules);
  });

  test("All sets have a winner", () => {
    match.getSets().forEach((set) => {
      const winner = getSetWinner(set.set, {
        bestOf: 5,
        gameRules: { scoreDistance: 2, scoreMinimum: 11 },
      });
      if (winner === undefined) {
        fail(`${set.homePlayerId}-${set.awayPlayerId} has no winner`);
      }
    });
  });

  test.each`
    player | points
    ${"A"} | ${3}
    ${"B"} | ${2}
    ${"C"} | ${3}
    ${"D"} | ${2}
    ${"E"} | ${3}
    ${"F"} | ${2}
  `("Player $player has $points points", ({ player, points }) => {
    expect(ranking.ranked.find((x) => x.player === player)?.points).toBe(
      points
    );
  });

  test.each`
    player | rank
    ${"A"} | ${2}
    ${"B"} | ${4}
    ${"C"} | ${1}
    ${"D"} | ${6}
    ${"E"} | ${3}
    ${"F"} | ${5}
  `("Player $player is ranked $rank", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | sameRankPoints
    ${"A"} | ${1}
    ${"B"} | ${2}
    ${"C"} | ${1}
    ${"D"} | ${0}
    ${"E"} | ${1}
    ${"F"} | ${1}
  `(
    "Player $player has $sameRankPoints sub rank points",
    ({ player, sameRankPoints }) => {
      const rank = ranking.ranked.find((x) => x.player === player);
      expect(rank?.sameRankPoints).toBe(sameRankPoints);
    }
  );

  describe.each`
    player | sameRankGameVictories | sameRankGameDefeats
    ${"A"} | ${3}                  | ${3}
    ${"B"} | ${0}                  | ${0}
    ${"C"} | ${5}                  | ${3}
    ${"D"} | ${0}                  | ${0}
    ${"E"} | ${3}                  | ${5}
    ${"F"} | ${0}                  | ${0}
  `(
    "Player $player has $sameRankGameVictories-$sameRankGameDefeats sameRank game victories/defeats",
    ({ player, sameRankGameVictories, sameRankGameDefeats }) => {
      test(`${player} has ${sameRankGameVictories} same rank victories`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatio.won).toBe(sameRankGameVictories);
      });

      test(`${player} has ${sameRankGameDefeats} same rank defeats`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankGameRatio.lost).toBe(sameRankGameDefeats);
      });
    }
  );
});
