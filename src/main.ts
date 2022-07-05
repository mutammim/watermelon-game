import kaboom from "kaboom";

/* ---------------------------------- Setup --------------------------------- */

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

/* ---------------------------------- Score --------------------------------- */

let score = 0;

const scoreText = add([text(score.toString()), pos(24, 24), fixed()]);

function updateScore(newScore: number) {
  score = newScore;
  scoreText.text = score.toString();
}

/* --------------------------------- Player --------------------------------- */

const player = add([sprite(SPRITES.player), pos(100, 100), area()]);

/* ----------------------------- Player movement ---------------------------- */

onKeyDown("left", () => {
  player.move(-SPEED, 0);
});

onKeyDown("right", () => {
  player.move(SPEED, 0);
});

onKeyDown("up", () => {
  player.move(0, -SPEED);
});

onKeyDown("down", () => {
  player.move(0, SPEED);
});

/* -------------------------- Generate watermelons -------------------------- */

for (let i = 0; i < 7; i++) {
  add([
    sprite(SPRITES.watermelon),
    pos(Math.random() * 400, Math.random() * 400),
    area(),
    "watermelon",
  ]);
}

/* ----------------------- Collision with watermelons ----------------------- */

player.onCollide(SPRITES.watermelon, (watermelon) => {
  destroy(watermelon);
  updateScore(score + 1);
});

/* ----------------------------- Generate ghosts ---------------------------- */

for (let i = 0; i < 2; i++) {
  add([
    sprite(SPRITES.ghost),
    pos(200 * (i + 1), Math.random() * 500),
    area(),
    "ghost",
    state("down", ["up", "down"]),
  ]);
}

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
});
