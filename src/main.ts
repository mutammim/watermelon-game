import kaboom, { GameObj } from "kaboom";

/* -------------------------------------------------------------------------- */
/*                                    Setup                                   */
/* -------------------------------------------------------------------------- */

const k = kaboom({
  width: 500,
  height: 500,
});

k.canvas.focus();

const SPEED = 200;
const SPRITES = {
  player: "player",
  ghost: "ghost",
  watermelon: "watermelon",
};

/* ----------------------------- Sprite-loading ----------------------------- */

loadSprite(SPRITES.player, "https://kaboomjs.com/sprites/bean.png");
loadSprite(SPRITES.ghost, "https://kaboomjs.com/sprites/ghosty.png");
loadSprite(SPRITES.watermelon, "https://kaboomjs.com/sprites/watermelon.png");

/* --------------------------------- Levels --------------------------------- */

const LEVELS = [
  [
    "w     w   ",
    "   g      ",
    "          ",
    "      w   ",
    "          ",
    "          ",
    "   w      ",
    "          ",
    "        gw",
    "w         ",
  ],
  [
    "w     w   ",
    "   g    w ",
    "          ",
    "      w   ",
    " g  g     ",
    "          ",
    "   w      ",
    "     w    ",
    "        gw",
    "w         ",
  ],
];

const levelConfiguration = {
  width: 50,
  height: 50,
  pos: vec2(0, 0),
  w: () => [sprite(SPRITES.watermelon), area(), z(0), "watermelon"],
  g: () => [
    sprite(SPRITES.ghost),
    area(),
    state("down", ["up", "down"]),
    z(1),
    "ghost",
  ],
  p: () => [sprite(SPRITES.player), area(), z(2), "player"],
};

/* -------------------------------------------------------------------------- */
/*                                 Start scene                                */
/* -------------------------------------------------------------------------- */

scene("start", () => {
  add([
    text("Press space to start!", {
      size: 36,
    }),
    pos(center()),
    k.origin("center"),
    color(0, 255, 255),
  ]);

  add([
    text(
      "Move with WASD or arrow keys. Avoid the ghosts and eat the watermelons to win!",
      {
        size: 24,
        width: 400,
      }
    ),
    pos(center().add(0, 100)),
    k.origin("center"),
    color(100, 100, 200),
  ]);

  onKeyRelease("space", () => {
    go("game");
  });
});

/* -------------------------------------------------------------------------- */
/*                                 Game scene                                 */
/* -------------------------------------------------------------------------- */

scene("game", (levelNumber = 0) => {
  const level = addLevel(LEVELS[levelNumber], levelConfiguration);
  const player = level.spawn("p", 0, 0);

  /* ---------------------------------- Score --------------------------------- */

  let score = 0;

  const scoreText = add([text(score.toString()), pos(24, 24), fixed(), z(3)]);

  function updateScore(newScore: number) {
    score = newScore;
    scoreText.text = score.toString();
  }

  /* ------------------------------- Level count ------------------------------ */

  add([
    text(`Level ${levelNumber + 1}/2`, {
      size: 24,
    }),
    pos(360, 20),
    fixed(),
    z(3),
  ]);

  /* ----------------------------- Player movement ---------------------------- */

  onKeyDown(["left", "a"], () => {
    player.pos.x > 0 ? player.move(-SPEED, 0) : null;
  });

  onKeyDown(["right", "d"], () => {
    player.pos.x < 435 ? player.move(SPEED, 0) : null;
  });

  onKeyDown(["up", "w"], () => {
    player.pos.y > 0 ? player.move(0, -SPEED) : null;
  });

  onKeyDown(["down", "s"], () => {
    player.pos.y < 440 ? player.move(0, SPEED) : null;
  });

  /* ----------------------- Collision with watermelons ----------------------- */

  player.onCollide(SPRITES.watermelon, (watermelon: GameObj<any>) => {
    destroy(watermelon);
    updateScore(score + 1);
  });

  /* ----------------------------- Ghost movement ----------------------------- */

  onUpdate("ghost", (ghost) => {
    if (ghost.pos.y >= height() - ghost.height) ghost.enterState("up");

    if (ghost.pos.y <= 0) ghost.enterState("down");

    if (ghost.state === "up") ghost.move(0, -SPEED);

    if (ghost.state === "down") ghost.move(0, SPEED);
  });

  /* ----------------------------- Ghost collision ---------------------------- */

  player.onCollide("ghost", () => {
    destroy(player);
    go("lose");
  });

  /* ------------------------------ Win scenario ------------------------------ */

  onUpdate(() => {
    if (get(SPRITES.watermelon).length === 0) {
      levelNumber < 1 ? go("game", levelNumber + 1) : go("win");
    }
  });
});

/* -------------------------------------------------------------------------- */
/*                                  Win scene                                 */
/* -------------------------------------------------------------------------- */

scene("win", () => {
  add([
    text("You win :D", {
      size: 36,
    }),
    pos(center()),
    k.origin("center"),
    color(0, 255, 255),
  ]);

  add([
    text("Press space to restart!", {
      size: 24,
      width: 400,
    }),
    pos(center().add(0, 100)),
    k.origin("center"),
    color(100, 100, 200),
  ]);

  onKeyRelease("space", () => {
    go("game", 0);
  });
});

/* -------------------------------------------------------------------------- */
/*                                 Lose scene                                 */
/* -------------------------------------------------------------------------- */

scene("lose", () => {
  add([
    text("You lose :(", {
      size: 36,
    }),
    pos(center()),
    k.origin("center"),
    color(0, 255, 255),
  ]);

  add([
    text("Press space to restart!", {
      size: 24,
      width: 400,
    }),
    pos(center().add(0, 100)),
    k.origin("center"),
    color(100, 100, 200),
  ]);

  onKeyRelease("space", () => {
    go("game", 0);
  });
});

/* -------------------------------------------------------------------------- */
/*                                 Start game                                 */
/* -------------------------------------------------------------------------- */

go("start");
