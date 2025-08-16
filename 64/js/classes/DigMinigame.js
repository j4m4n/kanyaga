class DigMinigame {
  constructor(canvas, onQuit) {
    this.canvas = canvas; 
    this.onQuit = onQuit;

    this.ctx = this.canvas.getContext('2d');

    for (let x = 0; x < 8; x++) {
      for (let y = 2; y < 8; y++) {
        this.dirtBlocks.push({ x, y }); 
      }
    }

    this.mcImg = document.getElementById('diggingDude');
  }

  player = { x: 4, y: 1, speed: 0.05 };

  dirtBlocks = [];

  update(time, keyboard) {
    //this.onQuit();
    this.time = time;
    let player = this.player;

    if (keyboard.isDown(keyboard.DOWN) && player.y < 7 ) {  
      player.y += player.speed;
    }
    if (keyboard.isDown(keyboard.UP) && player.y > 0) {
      player.y -= player.speed;  
    } 
    if (keyboard.isDown(keyboard.LEFT) && player.x > 0)   {
      player.x -= player.speed;
    }
    if (keyboard.isDown(keyboard.RIGHT) && player.x < 7)   {
      player.x += player.speed;
    }

    this.draw();
  }

  tinyChunks = [];
  draw() {
    let canvas = this.canvas;
    let ctx = this.ctx;
    let player = this.player;

    let GRIDPX = 8;

    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#08f';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //ctx.fillStyle = 'green';
    //ctx.fillRect(player.x * GRIDPX, player.y * GRIDPX, GRIDPX, GRIDPX);
    let px = Math.floor(player.x * GRIDPX);
    let py = Math.floor(player.y * GRIDPX);

    let t = this.time % 1;
    t *= 2;
    let spriteIndex = 0;
    if (t > 1) spriteIndex = 1;
    if (t < 0.1 || (t > 0.9 && t < 1.1) || t > 1.9) spriteIndex = 2;

    ctx.drawImage(this.mcImg, 8 * spriteIndex, 0, 8, 8, px, py, GRIDPX, GRIDPX);

    ctx.fillStyle = '#822';
    this.dirtBlocks.forEach(block => {
      // Check each corner and break the blocks we're touching
      let wasDead = block.dead;
      if (Math.floor(player.x) == block.x && Math.floor(player.y) == block.y) {
        block.dead = true;
      }
      if (Math.floor(player.x) == block.x && Math.ceil(player.y) == block.y) {
        block.dead = true;
      }
      if (Math.ceil(player.x) == block.x && Math.floor(player.y) == block.y) {
        block.dead = true;
      }
      if (Math.ceil(player.x) == block.x && Math.ceil(player.y) == block.y) {
        block.dead = true;
      }

      if (block.dead && !wasDead) {
        for (let i = 0; i < 10; i++) {
          this.tinyChunks.push({ color: `rgba(${50 + Math.random() * 40}, 20, 0, 1)`, x: GRIDPX * block.x + 0.5 * GRIDPX, y: GRIDPX * block.y + 0.5 * GRIDPX, dx: 0.5 - Math.random(), dy: 0.5 - Math.random() });
        }
      }

      if (!block.dead) ctx.fillRect(block.x * GRIDPX, block.y * GRIDPX, GRIDPX, GRIDPX);
    });

    this.tinyChunks.forEach(chunk => {
      ctx.filLStyle = chunk.color;
      ctx.fillRect(Math.floor(chunk.x),Math.floor(chunk.y),2,2);

      chunk.x += 2 * chunk.dx;
      chunk.y += 2 * chunk.dy;
    });

    if (!this.dirtBlocks.filter(db => !db.dead).length) this.onQuit();
  }
};
