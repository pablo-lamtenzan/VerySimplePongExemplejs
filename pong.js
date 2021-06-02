

// Create a 2D vector class

// Need some data from the canvas
const canvas = document.getElementById("pong");

// Get class that allow 2d writing
const ctx = canvas.getContext("2d");

class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

// Create a ball

const default_pos = new Point(canvas.clientWidth / 2, canvas.clientHeight / 2);
const defualt_dir = new Point(5, 5);

class Ball
{
    constructor(pos = default_pos, dir = defualt_dir, rad = 10, speed = 7, color = "WHITE")
    {
        this.pos = pos;
        this.dir = dir;
        this.rad = rad;
        this.speed = speed;
        this.color = color;
    }

    reset()
    {
        this.pos = default_pos;
        this.dir = defualt_dir;
        this.rad = 10;
        this.speed = 7;
        this.inverse_dir();
    }

    inverse_dir() // // Macth's point winner is the first one to hit the ball 
    {
        this.dir.x = -this.dir.x;
    }

    draw()
    {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.rad, 0, Math.PI * 2, true);
        // 2k PI rads is a circle (0 < k < +inf)
        ctx.closePath();
        ctx.fill();
    }
}

class Player
{
    constructor(pos, width = 10, height = 100, score = 0, color = "WHITE")
    {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.score = score;
        this.color = color;
    }

    draw()
    {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
}

class Player_left extends Player
{
    constructor()
    {
        super(new Point(0, (canvas.clientHeight - 100) / 2));
    }
}

class Player_right extends Player
{
    constructor()
    {
        super(new Point(canvas.clientWidth - 10, (canvas.clientHeight - 100) / 2));
    }
}

// middle line that split in 2 the canvas
const middle_line = {
    pos : new Point((canvas.clientWidth - 2) / 2, 0),
    height : 10,
    width : 2,
    color : "WHITE"
}

// Draw middle line (better if i use an generator)
function draw_middle_line()
{
    for (let i = 0 ; i < canvas.height ; i += 15)
    {
        const pos = new Point(middle_line.pos.x, middle_line.pos.y + i);
        ctx.fillStyle = middle_line.color;
        ctx.fillRect(pos.x, pos.y, middle_line.width, middle_line.height);
    }
}

// Write test as pos
function draw_text(text, pos)
{
    ctx.fillStyle = "#FFF";
    ctx.font = "75px Arial";
    ctx.fillText(text, pos.x, pos.y);
}

// Return true of a collision is performed
function handle_collsion(ball, player)
{
    return (player.pos.x < ball.pos.x + ball.rad
        && player.pos.y < ball.pos.y + ball.rad
        && player.pos.x + player.width > ball.pos.x - ball.rad
        && player.pos.y + player.height > ball.pos.y - ball.rad);
} 

// Instances for work with:
const player_left = new Player_left();
const player_right = new Player_right();
const ball = new Ball();

// Scrap mouse data using a hook and a handler
canvas.addEventListener("mousemove", getMousePos);

// here's the handler
function getMousePos(event)
{
    const rect = canvas.getBoundingClientRect();

    player_left.pos.y = event.clientY - rect.top - player_left.height / 2;
    // Just updates the position of the paddle to the mouses's pos.
}

// This function does all the cals
function update()
{
    if (ball.pos.x - ball.rad < 0) // ball is at the left fo the canvas
    {
        player_right.score++;
        ball.reset();
    }
    else if (ball.pos.x + ball.rad > canvas.clientWidth) // ball is at the right of the canvas
    {
        player_left.score++;
        ball.reset();
    }

    // Update ball position using the dirrection to calc it trajectory
    ball.pos.x += ball.dir.x;
    ball.pos.y += ball.dir.y;

    // player left is a very simple bot
    // The difficulty is handle by this var:
    const level = 0.1

    // Bot just follows the y axis of the ball, level is used to "lag" the bot.
    player_right.pos.y += ((ball.pos.y - (player_right.pos.y + player_right.height / 2))) * level;

    // If the ball collides TOP canvas or BOT canvas, inverse the y axis dir
    if (ball.pos.y - ball.rad < 0 || ball.pos.y + ball.rad > canvas.clientHeight)
        ball.dir.y = -ball.dir.y;

    // If the ball collides LEFT canvas or RIGHT canvas, it hitted with a player paddle
    let player = (ball.pos.x + ball.rad < canvas.clientWidth / 2) ? player_left : player_right;

    // Check for a collions
    if (handle_collsion(ball, player))
    {
        // Check if the ball hit the paddle
        let collidePoint = (ball.pos.y - (player.pos.y + player.height / 2));
        // Normalize to work with a -1 <= N < 1 interval
        collidePoint = collidePoint / (player.height / 2);

        // Ball hit top: -45 (PI/4) degrees angle
        // Ball hit middle: 0 degrees angle
        // Ball hit bot: 45 (PI/4) degrees angle
        let angle = (Math.PI / 4) * collidePoint;

        // Change dirrection right == -left && left == -right
        let direction = (ball.pos.x + ball.rad < canvas.clientWidth / 2) ? 1 : -1;
        ball.dir.x = direction * ball.speed * Math.cos(angle);
        ball.dir.y = ball.speed * Math.sin(angle);

        // Increment the speed to force to end the game at some point
        ball.speed += 1;
    }
}

 // A render function that will just display object at their position in a canvas
function render()
{
    // Clear the canvas for each call (frame)
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Draw scores
    draw_text(player_left.score, new Point(3 * canvas.clientWidth / 4, canvas.clientHeight / 5));
    draw_text(player_right.score, new Point (canvas.clientWidth / 4, canvas.clientHeight / 5));

    // Draw the middle line
    draw_middle_line();

    // Draw the paddles
    player_left.draw();
    player_right.draw();

    // Draw the ball
    ball.draw();
}

// Function the perform a frame of the game
function game_frame()
{
    update();
    render();
}

const framePerSec = 50;
// Function that make the frames
setInterval(game_frame, 1000 / framePerSec);
