var canvas;
var canvasContext;
var controls;
var baseTextSize = "32px";
var DEFAULT_BALL_SPEED;

const SETTINGS_HEIGHT = 150;
const CANVAS_HEIGHT_PADDING = 70;

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

var CURRENT_PADDLE_HEIGHT = 100;

// ------------- Cálculo do Mouse -------------

function calculateMousePos(evt) {
	var rect = canvas.getBoundingClientRect(); // retorna o tamanho e a posição em relação ao canvas dentro da janela visível ao usuário da página (não em relação ao documento HTML como um todo)
	var root = document.documentElement;

	//considera as posições X e Y relativas e não totais, desconsiderando o scroll e os outros elementos da página (texto, parágrafos, divs...)
	var mouseX = evt.clientX - rect.left; // - root.scrollLeft;
	var mouseY = evt.clientY - rect.top; // - root.scrollTop;

	return {
		x:mouseX,
		y:mouseY
	};
}

function calculateTouchPos(evt) {
	var rect = canvas.getBoundingClientRect(); // retorna o tamanho e a posição em relação ao canvas dentro da janela visível ao usuário da página (não em relação ao documento HTML como um todo)
	var root = document.documentElement;

	var e = (typeof evt.originalEvent === 'undefined') ? evt : evt.originalEvent;
	// Idea from StackOverflow: https://stackoverflow.com/a/41993300/11981524
	var touch = e.touches[0] || e.changedTouches[0];

	//considera as posições X e Y relativas e não totais, desconsiderando o scroll e os outros elementos da página (texto, parágrafos, divs...)
	var touchX = touch.pageX - rect.left; // - root.scrollLeft;
	var touchY = touch.pageY - rect.top; // - root.scrollTop;

	return {
		x:touchX,
		y:touchY
	};
}

function handleMouseClick(evt, player1, computer, game_settings) {
	if(!game_settings.game_started) {
		game_settings.game_started = true;
	}

	if(game_settings.showingWinScreen) {
		player1.score = 0;
		computer.score = 0;
		game_settings.showingWinScreen = false;
	}
}

// ------------- /Cálculo do Mouse -------------

// -------------- Global functions --------------

function reset_game(ball, player1, computer, game_settings) {
	var paddle_thickness = computer.thickness;

	ball.reset(true);
	player1.reset(0);
	computer.reset(canvas.width - paddle_thickness);

	game_settings.showingWinScreen = false;
}

function displaySettings(reload, reset, game_settings, ball=null, player1=null, computer=null) {
	var deviceHeight = document.documentElement.clientHeight;
	var deviceWidth = document.documentElement.clientWidth;

	var available_height = deviceHeight - SETTINGS_HEIGHT - CANVAS_HEIGHT_PADDING;

	if(deviceWidth < 350) {
		if(available_height < deviceWidth - 50 && (4 * available_height) / 3 < deviceWidth - 50) {
			canvas.height = available_height;
			canvas.width = (4 * canvas.height) / 3;
		}
		else {
			canvas.width = deviceWidth - 50;
			canvas.height = 0.75 * canvas.width;
		}

		controls.style.width = (canvas.width).toString() + "px";
		baseTextSize = "20px";
	}
	else if(deviceWidth < 575) {
		if(available_height < deviceWidth - 50 && (4 * available_height) / 3 < deviceWidth - 50) {
			canvas.height = available_height;
			canvas.width = (4 * canvas.height) / 3;
		}
		else {
			canvas.width = deviceWidth - 50;
			canvas.height = 0.75 * canvas.width;
		}

		controls.style.width = (canvas.width).toString() + "px";
		baseTextSize = "24px";
	}
	else if(deviceWidth < 650) {
		if(available_height < 0.8 * deviceWidth && (4 * available_height) / 3 < 0.8 * deviceWidth) {
			canvas.height = available_height;
			canvas.width = (4 * canvas.height) / 3;
		}
		else {
			canvas.width = 0.8 * deviceWidth;
			canvas.height = 0.75 * canvas.width;
		}

		controls.style.width = (canvas.width).toString() + "px";
		baseTextSize = "32px";
	}
	else if(deviceWidth < 767) {
		if(available_height < 0.7 * deviceWidth && (4 * available_height) / 3 < 0.7 * deviceWidth) {
			canvas.height = available_height;
			canvas.width = (4 * canvas.height) / 3;
		}
		else {
			canvas.width = 0.7 * deviceWidth;
			canvas.height = 0.75 * canvas.width;
		}
		canvas.width = 0.7 * deviceWidth;
		canvas.height = 0.75 * canvas.width;

		controls.style.width = (canvas.width).toString() + "px";
		baseTextSize = "32px";
	}
	else if(deviceWidth < 990) {
		if(available_height < 0.6 * deviceWidth && (4 * available_height) / 3 < 0.6 * deviceWidth) {
			canvas.height = available_height;
			canvas.width = (4 * canvas.height) / 3;
		}
		else {
			canvas.width = 0.6 * deviceWidth;
			canvas.height = 0.75 * canvas.width;
		}

		controls.style.width = (canvas.width).toString() + "px";
		baseTextSize = "32px";
	}
	else {
		if(available_height < DEFAULT_HEIGHT) {
			canvas.height = available_height;
			canvas.width = (4 * canvas.height) / 3;
		}
		else {
			canvas.width = DEFAULT_WIDTH;
			canvas.height = DEFAULT_HEIGHT;
		}

		controls.style.width = (canvas.width).toString() + "px";
		baseTextSize = "32px";
	}

	if(reload) {
		player1.resize(canvas.height / 6, canvas.width / 60);
		computer.resize(canvas.height / 6, canvas.width / 60);
		ball.resize(canvas.width / 60);

		game_settings.game_started = false;

		if(reset) {
			reset_game(ball, player1, computer, game_settings);
		}
	}
}

// ------------- /Global functions --------------

// -------------------- Main --------------------

window.onload = function() {
	// window.onload associado a função: carrega o que tiver dentro apenas depois que a página terminar de carregar
	canvas = document.getElementById('gameCanvas'); //associa a variável canvas ao elemento no HTML
	canvasContext = canvas.getContext('2d');
	controls = document.getElementById('controls');

	// Getting ajusted canvas properties
	displaySettings(false, false, null);

	DEFAULT_BALL_SPEED = 0.015 * canvas.width;

	var framesPerSecond = 30;
	var ball = new Ball();
	var player1 = new Paddle(0);
	var computer = new Paddle(canvas.width - 10);
	var game_settings = new GameSettings();

	displaySettings(true, false, game_settings, ball, player1, computer);

	// Difficulty selection
	var difficulty_selector = document.getElementById('difficulty');
	game_settings.set_difficulty(difficulty_selector[difficulty_selector.selectedIndex].value, computer);

	// Score selection
	var score_selector = document.getElementById('max-score');
	game_settings.winning_score = Number(score_selector[score_selector.selectedIndex].value);
	game_settings.check_if_disable_endgame();

	setInterval(function() {
		moveEverything(ball, player1, computer, game_settings);
		drawEverything(ball, player1, computer, game_settings);
	}, 1000/framesPerSecond);

	// Método .addEventListener (http://www.w3schools.com/jsref/met_element_addeventlistener.asp)
	canvas.addEventListener('mousemove', // http://www.w3schools.com/jsref/dom_obj_event.asp
		function(evt) {
			var mousePos = calculateMousePos(evt);
			if(mousePos.y > player1.height / 2 && mousePos.y < canvas.height - player1.height / 2) {
				player1.y = mousePos.y - (player1.height / 2);
			}
		});

	canvas.addEventListener('touchmove', // http://www.w3schools.com/jsref/dom_obj_event.asp
		function(evt) {
			var touchPos = calculateTouchPos(evt);
			if(touchPos.y > player1.height / 2 && touchPos.y < canvas.height - player1.height / 2) {
				player1.y = touchPos.y - (player1.height / 2);
			}
		});

	canvas.addEventListener('mousedown', function(evt) {
		handleMouseClick(evt, player1, computer, game_settings);
	});

	window.addEventListener("resize", function(event) {
		displaySettings(true, true, game_settings, ball, player1, computer);
		DEFAULT_BALL_SPEED = 0.015 * canvas.width;

		// Makes sure the correct computer paddle height is enabled
		game_settings.set_difficulty(difficulty_selector[difficulty_selector.selectedIndex].value, computer);
	});

	difficulty_selector.addEventListener('change', function(event) {
		game_settings.set_difficulty(difficulty_selector[difficulty_selector.selectedIndex].value, computer);

		// When difficulty level is changed, game is reseted
		game_settings.game_started = false;
		reset_game(ball, player1, computer, game_settings);
	});

	score_selector.addEventListener('change', function(event) {
		game_settings.winning_score = Number(score_selector[score_selector.selectedIndex].value);
		game_settings.check_if_disable_endgame();
	});
}

// ------------------- /Main -------------------

// ---------------- Construtores ----------------

function Ball() {
	this.x = 110;
	this.y = 50;
	this.x_speed = DEFAULT_BALL_SPEED;
	this.y_speed = 4;
	this.size = 10;

	this.update = function() {
		this.x += this.x_speed;
		this.y += this.y_speed;

		if(this.y > canvas.height || this.y < 0) {
			this.y_speed = -this.y_speed;
		}

		if(this.x_speed > 0) {
			this.x_speed += 0.01;
		}
		else {
			this.x_speed -= 0.01;
		}

		// if(this.x > canvas.width || this.x < 0) {
		// 	this.x_speed = -this.x_speed;
		// }
	}

	this.resize = function(new_size) {
		this.size = new_size;
	}

	this.reset = function(resize=false) {
		this.x_speed = DEFAULT_BALL_SPEED * Math.sign(this.x_speed);
		if(!resize) {
			this.x_speed = -this.x_speed;
		}

		this.y_speed = getRandomArbitrary(-15 * (canvas.height / DEFAULT_HEIGHT), 15 * (canvas.height / DEFAULT_HEIGHT));
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
	}

	this.draw = function() {
		colorRect(this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size, 'white');
	}
}

function Paddle(x) {
	this.x = x;
	this.y = canvas.height / 2;
	this.height = 100;
	this.thickness = 10;
	this.score = 0;

	this.resize = function(new_height, new_thickness) {
		this.height = new_height;
		this.thickness = new_thickness;

		CURRENT_PADDLE_HEIGHT = new_height;
	}

	this.reset = function(x) {
		this.x = x;
		this.y = canvas.height / 2;
		this.score = 0;
	}

	this.checkIfWon = function(game_settings) {
		if(this.score >= game_settings.winning_score && !game_settings.disable_endgame) {
			game_settings.showingWinScreen = true;
		}
	}

	this.draw = function(color = 'white') {
		colorRect(this.x, this.y, this.thickness, this.height, color);
	}
}

function GameSettings() {
	this.difficulty = 1;
	this.game_started = false;
	this.winning_score = 5;
	this.disable_endgame = false;
	this.showingWinScreen = false;

	this.set_difficulty = function(difficulty, computer) {
		if(difficulty === "easy") {
			this.difficulty = 1;
			computer.height = 0.9 * CURRENT_PADDLE_HEIGHT;
		}
		else if(difficulty === "medium") {
			this.difficulty = 2;
			computer.height = CURRENT_PADDLE_HEIGHT;
		}
		else {
			this.difficulty = 3;
			computer.height = 1.1 * CURRENT_PADDLE_HEIGHT;
		}
	}

	this.reset = function() {
		this.showingWinScreen = false;
	}

	this.check_if_disable_endgame = function() {
		this.disable_endgame = this.winning_score === 0;  // if-else
	}

	this.ball_speed = function() {
		// to be defined
	}

	this.computer_speed = function() {
		var speed;

		switch(this.difficulty) {
			case 1:
				speed = 0.06;
				break;

			case 2:
				speed = 0.08;
				break;

			case 3:
				speed = 0.1;
				break;

			default:
				speed = 0.08;
				break;
		}
		return speed;
	}
}

// ------------- /Construtores -------------


function computerMovement(ball, computer, game_settings) {
	var computerYCenter = computer.y + (computer.height / 2);

	if(computerYCenter < ball.y - ((computer.height / 2)) * 0.35 && computer.y + computer.height < canvas.height) {
		computer.y += game_settings.computer_speed() * computer.height;
	} else if(computerYCenter > ball.y + ((computer.height / 2)) * 0.35 && computer.y > 0) {
		computer.y -= game_settings.computer_speed() * computer.height;
	}
}

function moveEverything(ball, player1, computer, game_settings) {
	if(!game_settings.game_started || game_settings.showingWinScreen) {
		return;
	}

	computerMovement(ball, computer, game_settings);

	ball.update();

	if(ball.x < player1.thickness) {
		if(ball.y > player1.y && ball.y < (player1.y + player1.height)) {
			ball.x_speed = -ball.x_speed;

			var deltaY = ball.y - (player1.y + (player1.height / 2));
			ball.y_speed = deltaY * 0.35;

		} else {

			computer.score++; // must be BEFORE ball.reset()
			computer.checkIfWon(game_settings);

			ball.reset();
		}
	}

	if(ball.x > canvas.width - computer.thickness) {
		if(ball.y > computer.y && ball.y < (computer.y + computer.height)) {
			ball.x_speed = -ball.x_speed;

			var deltaY = ball.y - (computer.y + (computer.height / 2));
			ball.y_speed = deltaY * 0.35;

		} else {

			player1.score++; // must be BEFORE ball.reset()
			player1.checkIfWon(game_settings);

			ball.reset();
		}
	}

	// console.log(ball.x_speed);
}

function drawEverything(ball, player1, computer, game_settings) {
	// next line blanks out the screen with black
	colorRect(0, 0, canvas.width, canvas.height, 'black');

	canvasContext.font = baseTextSize + " Bit5x3";
	canvasContext.textAlign = "center";

	if(isTouchScreen()) {
		var interaction = "toque";
	} else {
		var interaction = "clique";
	}

	if(!game_settings.game_started) {
		canvasContext.fillStyle = 'white';
		canvasContext.font = "64px Bit5x3";
		canvasContext.fillText("Pong", (canvas.width) / 2, canvas.height / 3);

		canvasContext.font = "20px Bit5x3";
		canvasContext.fillText(interaction + " para comecar", (canvas.width / 2), 5 * canvas.height / 6);

		return;
	}

	if(game_settings.showingWinScreen) {
		win_text = "Voce ganhou!!";
		lose_text = "Voce perdeu =(";

		canvasContext.fillStyle = 'white';

		if(player1.score > computer.score) {
			canvasContext.fillText(win_text, (canvas.width) / 2, canvas.height / 3);
		}
		else {
			canvasContext.fillText(lose_text, (canvas.width) / 2, canvas.height / 3);
		}

		canvasContext.fillText(interaction + " para reiniciar", (canvas.width) / 2, 5 * canvas.height / 6);
		return;
	}

	drawNet();

	// this is left player paddle
	player1.draw();

	// this is left computer paddle
	computer.draw();

	// next line draws the ball
	ball.draw();

	// 2 digits offset
	var player_score_draw_offset = 0;
	if(player1.score < 10) {
		player_score_draw_offset = 30;
	}
	var computer_score_draw_offset = 0;
	if(computer.score >= 10) {
		computer_score_draw_offset = 30;
	}

	// player and computer scores
	canvasContext.fillText(player1.score, (70 + player_score_draw_offset) * (canvas.width / DEFAULT_WIDTH), canvas.height / 6);
	canvasContext.fillText(computer.score, (DEFAULT_WIDTH - (100 + computer_score_draw_offset)) * (canvas.width / DEFAULT_WIDTH), canvas.height / 6);

}


// ---------- Funções auxiliares ----------

function getRandomArbitrary(min, max) {
	// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	return Math.random() * (max - min) + min;
}

function drawNet() {
	for(var i = 0; i < canvas.height; i += 40) {
		colorRect((canvas.width / 2) -1, i, 2, 20, 'white');
	}
}

function colorRect(leftX, topX, width, height, drawColor) {
	// Método .fillRect(a, b, c, d):
	//		a. [posição x do canto do quadrado],
	// 		b. [posição y do canto do quadrado],
	//		c. [largura do quadrado],
	//		d. [altura do quadrado]
	// Obs.: levar em consideração ao centralizar um objeto

	canvasContext.fillStyle = drawColor;
	canvasContext.fillRect(leftX, topX, width, height);
}

function colorCircle(centerX, centerY, radius, drawColor) {
	// (http://www.w3schools.com/tags/canvas_arc.asp)
	// Método .arc(a, b, c, d, e, f):
	//		a. [posição x do centro da circunferência],
	// 		b. [posição y do centro da circunferência],
	//		c. [raio da circunferência],
	//		d. [ângulo de início do desenho],
	//		e. [ângulo final do desenho],
	//		f. [Default: false; Indica se o desenho deve ser feito no sentido horário ou anti-horário. Não faz diferença se é uma circunferência completa]

	canvasContext.fillStyle = drawColor;
	canvasContext.beginPath(); // requisito para definir uma forma não retangular
	canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
	canvasContext.fill();
}

function isTouchScreen() {
	return window.matchMedia('(hover: none)').matches;
}