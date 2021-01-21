const canvas = document.getElementById("main");
const ctx = canvas.getContext('2d');

const width = canvas.clientWidth;
const height = canvas.clientHeight;

canvas.width = width;
canvas.height = height;

const seen = document.getElementById('seen');
const queue = document.getElementById('queue');
const toggle = document.getElementById('bejaras');

ctx.font = "50px Arial";
//ctx.translate(width / 2, height / 2);

class Point {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.seen = 0;
        this.was = false;
    }

    draw(color) {
        ctx.beginPath();
        ctx.strokeStyle = color;

        ctx.arc(this.x, this.y, 50, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
        
        ctx.fillText(this.id, this.x - 10, this.y + 15);
    }
}
class Edge {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

    draw() {
        const angle = Math.atan2(this.point2.y - this.point1.y, this.point2.x - this.point1.x);
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.point1.x + cosAngle * (50), this.point1.y + sinAngle * 50);
        ctx.lineTo(this.point2.x - cosAngle * 50, this.point2.y - sinAngle * 50);
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

const points = [];
const edges = [];

const state = {
    currNode: -1,
    nodeQueue: [],
    queueStart: 0,
    zone: 0
}

const gameLoop = () => {
    //ctx.push();
    ctx.clearRect(0, 0, width, height);
    for(point in points) {
        let color;
        if(point == state.currNode) {
            color = 'red';
        }
        else if(points[point].was === true) {
            color = 'purple';
        }
        else if(points[point].seen !== 0) {
            color = 'green';
        }
        else color = 'black';
        points[point].draw(color);
    }
    for(edge in edges) {
        edges[edge].draw();
    }
    //ctx.pop();

    let seenText = "Látott tomb:";
    for(point in points) {
        seenText += ' ' + (points[point].seen);
    }
    seen.innerText = seenText;
    let queueText;
    let iterStart;
    if(!toggle.checked) {
        queueText = "Várakozási sor:";
        iterStart = state.queueStart;
    }
    else {
        queueText = "Stack:";
        iterStart = 0;
    }

    for(let i = iterStart; i < state.nodeQueue.length; i++) {
        queueText += ' ' + (parseInt(state.nodeQueue[i]) + 1);
    }
    queue.innerText = queueText;

    requestAnimationFrame(gameLoop);
}

const propagateBreadthFirst = () => {
    state.currNode = state.nodeQueue[state.queueStart++];
    points[state.currNode].was = true;
    for(edge in edges) {
        if(edges[edge].point1 == points[state.currNode]) {
            if(edges[edge].point2.seen) continue;
            state.nodeQueue.push(edges[edge].point2.id - 1);
            edges[edge].point2.seen = state.zone;
        }
        else if(edges[edge].point2 == points[state.currNode]) {
            if(edges[edge].point1.seen) continue;
            state.nodeQueue.push(edges[edge].point1.id - 1);
            edges[edge].point1.seen = state.zone;
        }
    }
}

const propagateDepthFirst = () => {
    state.currNode = state.nodeQueue[state.nodeQueue.length - 1];
    let already_was = points[state.currNode].was;
    points[state.currNode].was = true;
    for(edge in edges) {
        if(edges[edge].point1 == points[state.currNode]) {
            if(edges[edge].point2.seen) continue;
            state.nodeQueue.push(edges[edge].point2.id - 1);
            edges[edge].point2.seen = state.zone;
            return;
        }
        else if(edges[edge].point2 == points[state.currNode]) {
            if(edges[edge].point1.seen) continue;
            state.nodeQueue.push(edges[edge].point1.id - 1);
            edges[edge].point1.seen = state.zone;
            return;
        }
    }
    if(already_was) {
        state.nodeQueue.pop();
        state.currNode = state.nodeQueue[state.nodeQueue.length - 1];
    }
}

let isDragging = false;
let pointClosest;
let closestDistanceYet = 99999;

let rightClickedOn;

const moveCircles = (event) => {
    if(points.length === 0) return;
    if(isDragging) {
        points[pointClosest].x = event.offsetX;
        points[pointClosest].y = event.offsetY;
    }
}

canvas.addEventListener('mousedown', (event) => {

    if(points.length === 0) return;

    if(event.button === 0)
        isDragging = true;

    closestDistanceYet = 99999;
    
    for(point in points) {
        const distX = points[point].x - event.offsetX;
        const distY = points[point].y - event.offsetY;

        const dist = distX * distX + distY * distY;
        if(closestDistanceYet > dist) {
            closestDistanceYet = dist;
            pointClosest = point;
        }
    }

    if(closestDistanceYet < 15000) {
        rightClickedOn = pointClosest;
    }
});

// const n_point = prompt("Hány darab pont?");

// for(let i = 1; i <= n_point; i++) {
//     points.push(new Point(Math.cos(i) * 250 + width / 2, Math.sin(i) * 250 + height/2, i));
// }
// points[0].seen = true;

// const n_edge = prompt("Hány él?");

// for(let i = 1; i <= n_edge; i++) {
//     const first = prompt(i + ". él első pont:");
//     const second = prompt(i + ". él második pont:");

//     edges.push(new Edge(points[first - 1], points[second - 1]));
// }

canvas.oncontextmenu = (e) => {e.preventDefault(); e.stopPropagation(); };
canvas.addEventListener('mousemove', moveCircles);
canvas.addEventListener('mouseup', (event) => {
    isDragging = false;
    if(event.button === 2) {
        closestDistanceYet = 99999;
    
        for(point in points) {
            const distX = points[point].x - event.offsetX;
            const distY = points[point].y - event.offsetY;

            const dist = distX * distX + distY * distY;
            if(closestDistanceYet > dist) {
                closestDistanceYet = dist;
                pointClosest = point;
            }
        }
        if(closestDistanceYet > 15000) {
            points.push(new Point(event.offsetX, event.offsetY, (points.length + 1)));
        }
        else if(rightClickedOn !== pointClosest){
            edges.push(new Edge(points[rightClickedOn], points[pointClosest]));
        }
        return;
    }
});

document.addEventListener('keydown', () => {
    if(state.queueStart >= state.nodeQueue.length && (!toggle.checked || state.nodeQueue.length === 0)) {
        let ok = true;
        for(point in points) {
            if(points[point].seen === 0) {
                state.nodeQueue.push(point);
                points[point].seen = state.zone + 1;
                ok = false;
                break;
            }
        }
        if(ok) return;
        state.zone++;
    }
    if(!toggle.checked)
        propagateBreadthFirst();
    else propagateDepthFirst();
});

gameLoop();