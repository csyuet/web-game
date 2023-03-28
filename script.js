const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

let restart = document.getElementById('restartbtn');
let pause = document.getElementById('pausebtn');
document.getElementById('bestscore').innerText = 'Best: 0';
canvas.width = 800;
canvas.height = 500;

let score = 0;
let best = 0;
let scale = 1;
let gameFrame = 0;
let thread = -1;
let gameOver = false;
let gamePause = false;
ctx.font = '50px Helvetica';

let canvasPos = canvas.getBoundingClientRect();
let mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false
}

canvas.addEventListener('mousedown', function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPos.left;
    mouse.y = event.y - canvasPos.top;
    
})
canvas.addEventListener('mouseup', function(){
    mouse.click = false;
})

class Player{
    constructor(){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.r = 10;
        this.angle = 0;
        this.speed = this.r * 2;   

    }
    update(){
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        if (mouse.x != this.x){
            this.x -= dx/this.speed;
        }
        if (mouse.y != this.y){
            this.y -= dy/this.speed;
        }
    }
    draw(){

        if (mouse.click){
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

class Entity{
    distcal(){
        const rx = Math.random() * canvas.width;
        const ry = Math.random() * canvas.height;
        const rdx = rx - this.x;
        const rdy = ry - this.y;
        if (Math.sqrt(rdx*rdx + rdy*rdy) > 4*this.r)
        {
            const v = 8 * this.r/Math.sqrt(rdx*rdx + rdy*rdy);
            this.nx = this.x + v*rdx;
            this.ny = this.y + v*rdy;
        }
        else{
            this.nx = rx;
            this.ny = ry;
        }
    }
    constructor(){
        if (Math.random() <= 0.5){
            this.x = Math.random() <= 0.5 ? 0 : canvas.width;
            this.y = Math.random() * canvas.height;
        }
        else{
            this.x = Math.random() * canvas.width;
            this.y = Math.random() <= 0.5 ? 0 : canvas.height;
        }
        
        this.r = Math.random() * 10 + Math.round(player.r) - 5;
        this.speed = this.r * 2;
        this.distance;
        this.distcal();
        this.color = 'blue';
        
    }
    move(){
        const dx = this.x - this.nx;
        const dy = this.y - this.ny;

        if (Math.sqrt(dx*dx + dy*dy) < 1){
            this.distcal();
        }
        else{
            if (this.nx != this.x){
                this.x -= dx/this.speed;
            }
            if (this.ny != this.y){
                this.y -= dy/this.speed;
            }
        }
        const px = this.x - player.x;
        const py = this.y - player.y;
        this.distance = Math.sqrt(px*px + py*py);
    }
    update(){
        this.move();        
        
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x,this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        
    }
}

const eaten1 = document.createElement('audio');
eaten1.src = 'sound/bite1.ogg';
const eaten2 = document.createElement('audio');
eaten2.src = 'sound/bite2.ogg';

function entitySpawn(){
    if (gameFrame % 50 == 0 && entities.length<20){
        entities.push(new Entity());
    }
    for (let i = 0; i < entities.length; i++){
        entities[i].update();
        entities[i].draw();
        
        if (entities[i].distance < entities[i].r + player.r){
            if (entities[i].r>player.r) gameOver = true;
            
            else if (entities[i].r < player.r){
                if (Math.random() <= 0.5) eaten1.play();
                else eaten2.play();
                
                player.r += entities[i].r/player.r;
                console.log(player.r);
                entities.splice(i, 1);
                score++;
                i--;
                player.speed = player.r * 2;
                dummy.r = player.r;
                dummy.speed = player.speed;
            }
            
        }
    }
}

const entities = [];
let player = new Player();

function scaleup(){
    
    scale++;
    
    player.r /= 5;
    player.speed = player.r*2;
    for (let i = 0; i < entities.length; i++){
        entities[i].r /= 5;
        entities.speed = entities[i].r*2;
    }
    
   
}

function lose(){
    //console.log(best);
    if (score > best){
        best = score;
        document.getElementById('bestscore').innerText = 'Best:' + best;
    } 
    pause.removeEventListener('click', stop);
    ctx.fillStyle = 'black';
    ctx.fillText('You lose!', canvas.width/2 - 75, canvas.height/2);
}

function animate(){

    if (gameOver) lose();

    else if (gamePause) ;

    else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        entitySpawn();
        player.update();
        player.draw();
        test();
        ctx.fillStyle = 'black';
        ctx.fillText('Score: ' + score, 10, 50);
        gameFrame++;

        if (score>0 && score%50==0 && thread == -1){
            thread = gameFrame + 250;
            scaleup();
        }
        if (thread != gameFrame && thread!=-1){
            ctx.fillText("Scale up!", canvas.width/2 - 75, 50);
        }
        else if (thread == gameFrame) thread = -1;
        
    }
    
    requestAnimationFrame(animate);
}

function reset(){
    score = 0;
    gameFrame = 0;
    gameOver = false;
    entities.splice(0, entities.length);
    delete player;
    mouse.x = canvas.width/2;
    mouse.y = canvas.height/2;
    player = new Player();
    console.log(player);
    pause.addEventListener('click', stop);
}

function stop(){
    gamePause = !gamePause;
    if (gamePause){
        document.getElementById('pauseimg').src = 'images/resume.png';
        ctx.fillText("Paused", canvas.width/2 - 75, canvas.height/2);
    }
    else{
        document.getElementById('pauseimg').src = 'images/pause.png';
    } 
}

window.addEventListener('resize', function(){
    canvasPos = canvas.getBoundingClientRect();
})

pause.addEventListener('click', stop);
restart.addEventListener('click', reset);
console.log(player);


animate();



