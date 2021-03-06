import { getSetWinner } from "../../helpers";
import { parseSetScore } from "../../parsers";
import { TTMatchRules, TTSetRules } from "../../rules";
import { TTMatch } from "../../tt-match";
import { TTMatchRank, generateMatchRank } from "../../tt-match-rank";

// Please note that player C and F have been swapped in the order they were added to the match.
// This is because otherwise the stable stable sort determines the order.
// It however has no effect on the input.
describe("Scenario 4", () => {
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
    const p6 = match.addPlayer("F");
    const p4 = match.addPlayer("D");
    const p5 = match.addPlayer("E");
    const p3 = match.addPlayer("C");

    match.addSet(p3, p4, parseSetScore("11-7,10-12,6-11,11-9,8-11"));
    match.addSet(p2, p5, parseSetScore("7-11,9-11,9-11"));
    match.addSet(p1, p6, parseSetScore("10-12,10-12,10-12"));

    match.addSet(p2, p4, parseSetScore("8-11,9-11,6-11"));
    match.addSet(p3, p6, parseSetScore("11-3,6-11,11-7,9-11,11-8"));
    match.addSet(p1, p5, parseSetScore("7-11,5-11,2-11"));

    match.addSet(p5, p6, parseSetScore("11-9,11-5,8-11,11-7"));
    match.addSet(p2, p3, parseSetScore("6-11,9-11,10-12"));
    match.addSet(p1, p4, parseSetScore("11-3,0-11,11-4,9-11,11-8"));

    match.addSet(p2, p6, parseSetScore("11-7,11-7,11-8"));
    match.addSet(p4, p5, parseSetScore("8-11,9-11,5-11"));
    match.addSet(p1, p3, parseSetScore("11-7,10-12,11-8,11-9"));

    match.addSet(p4, p6, parseSetScore("7-11,11-6,7-11,11-6,10-12"));
    match.addSet(p3, p5, parseSetScore("7-11,5-11,9-11"));
    match.addSet(p1, p2, parseSetScore("11-8,11-7,9-11,11-2"));

    ranking = generateMatchRank(match, matchRules, setRules);
  });

  test("All sets have a winner", () => {
    match.getSets().forEach((set) => {
      const winner = getSetWinner(set.set, setRules);
      if (winner === undefined) {
        fail(`${set.homePlayerId}-${set.awayPlayerId} has no winner`);
      }
    });
  });

  test.each`
    player | points
    ${"A"} | ${3}
    ${"B"} | ${1}
    ${"C"} | ${2}
    ${"D"} | ${2}
    ${"E"} | ${5}
    ${"F"} | ${2}
  `("Player $player has $points points", ({ player, points }) => {
    expect(ranking.ranked.find((x) => x.player === player)?.points).toBe(
      points
    );
  });

  test.each`
    player | rank
    ${"A"} | ${2}
    ${"B"} | ${6}
    ${"C"} | ${3}
    ${"D"} | ${4}
    ${"E"} | ${1}
    ${"F"} | ${5}
  `("Player $player is ranked $rank", ({ player, rank }) => {
    expect(ranking.ranked[rank - 1].player).toBe(player);
  });

  test.each`
    player | sameRankPoints
    ${"A"} | ${0}
    ${"B"} | ${0}
    ${"C"} | ${1}
    ${"D"} | ${1}
    ${"E"} | ${0}
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
    ${"A"} | ${0}                  | ${0}
    ${"B"} | ${0}                  | ${0}
    ${"C"} | ${5}                  | ${5}
    ${"D"} | ${5}                  | ${5}
    ${"E"} | ${0}                  | ${0}
    ${"F"} | ${5}                  | ${5}
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

  describe.each`
    player | sameRankGamePointsWon | sameRankGamePointsLost
    ${"A"} | ${0}                  | ${0}
    ${"B"} | ${0}                  | ${0}
    ${"C"} | ${94}                 | ${90}
    ${"D"} | ${96}                 | ${92}
    ${"E"} | ${0}                  | ${0}
    ${"F"} | ${86}                 | ${94}
  `(
    "Player $player has $sameRankGamePointsWon-$sameRankGamePointsLost sameRank game points won/lost",
    ({ player, sameRankGamePointsWon, sameRankGamePointsLost }) => {
      test(`${player} has ${sameRankGamePointsWon} same rank points won`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatio.won).toBe(sameRankGamePointsWon);
      });

      test(`${player} has ${sameRankGamePointsLost} same rank points lost`, () => {
        const rank = ranking.ranked.find((x) => x.player === player);
        expect(rank?.sameRankScoreRatio.lost).toBe(sameRankGamePointsLost);
      });
    }
  );
});
