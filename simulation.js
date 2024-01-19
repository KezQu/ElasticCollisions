class Ball{
	constructor(x, y, dx, dy, m, color){
		this.x = this.x0 = parseFloat(x);
		this.y = this.y0 = parseFloat(y);
		this.dx0 = this.dx = parseFloat(dx);
		this.dy0 = this.dy = parseFloat(dy);
		this.v0 = this.v = Math.sqrt(this.dx0 * this.dx0 + this.dy0 * this.dy0);
		this.m = parseInt(m);
		this.color = color;
		this.radius = 25;
	}
};

let simulationsArr = Array();
let ballArray = Array();
let runAnimation = false;

function CreateBall(){
	ballArray.push(new Ball(
		document.getElementById("x").value * 25,
		document.getElementById("y").value * 25,
		document.getElementById("dx").value / 10,
		document.getElementById("dy").value / 10,
		document.getElementById("mass").value,
		document.getElementById("color").value));
	ListBall();
}
function DeleteBall(id){
	ballArray.splice(id, 1);
	ListBall();
}
function ListBall(){
	let txt = "";
	for(let i =0; i < ballArray.length; i++){
		txt += "<tr>";
		txt += "<td style=\"width:5px; border-radius:5px; background-color:" + ballArray[i].color + ";\" />";
		txt += "<td class=\"input_type\" style=\"font-size: small !important; padding:5px;\">x = " + ballArray[i].x0 + ", ";
		txt += "y = " + ballArray[i].y0 + ", ";
		txt += "v_x = " + ballArray[i].dx0 * 50 + ", ";
		txt += "v_y = " + ballArray[i].dy0 * 50 + " ";
		txt += "</td>";
		txt += "<td>";
		txt += "<input type=\"button\" class=\"input_type\" style=\"font-size: small !important; padding:5px;\" value=\"Delete\" onclick=\"DeleteBall(" + i + ")\">"
		txt += "</td>";
		txt += "</tr>";
	}
	document.getElementById("ball_select").innerHTML = txt;
}
function LoadSimulation(name){
	ballArray = [...simulationsArr.filter(sim => sim.name === name)[0].data];
	ListBall();
}
function ListSimulations(data){
	let txt = '';
	simulationsArr = Array();
	if(data != null){
		for(let i = 0; i < data.length; i++){
			simulationsArr.push(data[i]);
			txt += "<tr>";
			txt += "<td class=\"input_type\" style=\"font-size: small !important; padding:5px;\">" + data[i].name;
			txt += "</td>";
			txt += "<td>";
			txt += "<input type=\"button\" class=\"input_type\" style=\"font-size: small !important; padding:5px;\" value=\"Load\" onclick=\"LoadSimulation('" + data[i].name + "')\">"
			txt += "</td>";
			txt += "<td>";
			txt += "<input type=\"button\" class=\"input_type\" style=\"font-size: small !important; padding:5px;\" value=\"Delete\" onclick=\"DeleteSimulation('" + data[i].name + "')\">"
			txt += "</td>";
			txt += "</tr>";
		}
	}
	document.getElementById("saved_simulations").innerHTML = txt;
}
function UpdateKnobsValueDisplay(){
	document.getElementById("x_val").innerHTML = document.getElementById("x").value * 25;
	document.getElementById("y_val").innerHTML = document.getElementById("y").value * 25;
	document.getElementById("dx_val").innerHTML = document.getElementById("dx").value * 5;
	document.getElementById("dy_val").innerHTML = document.getElementById("dy").value * 5;
	document.getElementById("mass_val").innerHTML = document.getElementById("mass").value;
}
function animate(){
	requestAnimationFrame(animate);
	UpdateKnobsValueDisplay();
	let canvas = document.getElementById("interactive");
	if (canvas.getContext)
	{
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.translate(0, canvas.height);
		for(let i = 0; i <= canvas.width; i+= 50){
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#cccccc';
			ctx.moveTo(i, 0);
			ctx.lineTo(i, - canvas.height);
			ctx.stroke();
		}
		for(let i = 0; i >= -canvas.height; i-= 50){
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#cccccc';
			ctx.moveTo(0, i);
			ctx.lineTo(canvas.width, i);
			ctx.stroke();
		}
		for(let i = 0; i < ballArray.length; i++){
			DrawBall(ctx, ballArray[i]);
		}
		let vidmoBall = new Ball(
			document.getElementById("x").value * 25,
			document.getElementById("y").value * 25,
			document.getElementById("dx").value / 10,
			document.getElementById("dy").value / 10,
			document.getElementById("mass").value,
			document.getElementById("color").value + "a0");
		DrawBall(ctx, vidmoBall);
		ctx.translate(0, - canvas.height);
	}
	if(runAnimation){
		for(let i = 0; i < ballArray.length; i++){
			ballArray[i].x += ballArray[i].dx;
			ballArray[i].y += ballArray[i].dy;
		}
		for(let i = 0; i < ballArray.length; i++){
			for(let j = i+1; j < ballArray.length; j++){
				let overlap = Math.sqrt((ballArray[i].x - ballArray[j].x) * (ballArray[i].x - ballArray[j].x) + (ballArray[i].y - ballArray[j].y) * (ballArray[i].y - ballArray[j].y));
				if(overlap <= (ballArray[i].radius + ballArray[j].radius)){

					let tmp_dxi = ballArray[i].dx - 
					(2 * ballArray[j].m / (ballArray[i].m + ballArray[j].m)) * 
					(((ballArray[i].dx - ballArray[j].dx) * (ballArray[i].x - ballArray[j].x) + (ballArray[i].dy - ballArray[j].dy) * (ballArray[i].y - ballArray[j].y)) /
					((ballArray[i].x - ballArray[j].x) * (ballArray[i].x - ballArray[j].x) + (ballArray[i].y - ballArray[j].y) * (ballArray[i].y - ballArray[j].y))) * (ballArray[i].x - ballArray[j].x);

					let tmp_dyi = ballArray[i].dy - 
					(2 * ballArray[j].m / (ballArray[i].m + ballArray[j].m)) * 
					(((ballArray[i].dx - ballArray[j].dx) * (ballArray[i].x - ballArray[j].x) + (ballArray[i].dy - ballArray[j].dy) * (ballArray[i].y - ballArray[j].y)) /
					((ballArray[i].x - ballArray[j].x) * (ballArray[i].x - ballArray[j].x) + (ballArray[i].y - ballArray[j].y) * (ballArray[i].y - ballArray[j].y))) * (ballArray[i].y - ballArray[j].y);

					let tmp_dxj = ballArray[j].dx - 
					(2 * ballArray[i].m / (ballArray[j].m + ballArray[i].m)) * 
					(((ballArray[j].dx - ballArray[i].dx) * (ballArray[j].x - ballArray[i].x) + (ballArray[j].dy - ballArray[i].dy) * (ballArray[j].y - ballArray[i].y)) /
					((ballArray[j].x - ballArray[i].x) * (ballArray[j].x - ballArray[i].x) + (ballArray[j].y - ballArray[i].y) * (ballArray[j].y - ballArray[i].y))) * (ballArray[j].x - ballArray[i].x);

					let tmp_dyj = ballArray[j].dy - 
					(2 * ballArray[i].m / (ballArray[j].m + ballArray[i].m)) * 
					(((ballArray[j].dx - ballArray[i].dx) * (ballArray[j].x - ballArray[i].x) + (ballArray[j].dy - ballArray[i].dy) * (ballArray[j].y - ballArray[i].y)) /
					((ballArray[j].x - ballArray[i].x) * (ballArray[j].x - ballArray[i].x) + (ballArray[j].y - ballArray[i].y) * (ballArray[j].y - ballArray[i].y))) * (ballArray[j].y - ballArray[i].y);
					
					ballArray[i].dx = tmp_dxi;
					ballArray[i].dy = tmp_dyi;
					ballArray[j].dx = tmp_dxj;
					ballArray[j].dy = tmp_dyj;
				}
			}
		}
	}
}
function ToggleSimulation(){
	runAnimation = !runAnimation;
	if(runAnimation){
		document.getElementById("sim").value = "Stop simulation";
	}
	else{
		document.getElementById("sim").value = "Start simulation";
	}
}
function ResetSimulation(){
	runAnimation = false;
	document.getElementById("sim").value = "Start simulation";
	for(let i = 0; i < ballArray.length; i++){
		ballArray[i].x = ballArray[i].x0;
		ballArray[i].y = ballArray[i].y0;
		ballArray[i].dx = ballArray[i].dx0;
		ballArray[i].dy = ballArray[i].dy0;
		ballArray[i].v = ballArray[i].v0;
	}
}
function DrawBall(ctx, ball){
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.fillStyle = ball.color;
	ctx.strokeStyle = ball.color;
	ctx.arc(ball.x, - ball.y, ball.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	ctx.moveTo(ball.x, -ball.y);
	ctx.lineTo(ball.x + ball.dx * 50, - (ball.y + ball.dy * 50));
	ctx.stroke();
	if(ball.dx * 50 != 0 || ball.dy * 50 != 0){
		ctx.beginPath();
		ctx.fillStyle = 'black';
		let angle = Math.atan2(ball.dx * 50, ball.dy * 50)
		let x = ball.x + ball.dx * 50;
		let y = -(ball.y + ball.dy * 50);
		ctx.moveTo(x, y);
		angle += (1/6)*(2*Math.PI)
		x = 15 * Math.cos(angle) + ball.x + ball.dx * 50;
		y = 15 * Math.sin(angle) - (ball.y + ball.dy * 50);
		ctx.lineTo(x, y);
		angle += (1/6)*(2*Math.PI)
		x = 15 * Math.cos(angle) + ball.x + ball.dx * 50;
		y = 15 * Math.sin(angle) - (ball.y + ball.dy * 50);
		ctx.lineTo(x, y);
		ctx.fill();
	}
}
function ToggleDisplay(id){
	if(document.getElementById(id).style.display != 'block')
		document.getElementById(id).style.display = 'block';
	else
	document.getElementById(id).style.display = 'none';

}