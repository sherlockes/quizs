const quizContainer = document.getElementById('quiz');
let quizData = [];
let currentQuiz = 0;
let score = 0;
let currentTitle = ""; // Variable para guardar el título del test actual

async function initApp() {
    try {
        const response = await fetch('index.json');
        const indexData = await response.json();
        renderSelector(indexData);
    } catch (e) {
        quizContainer.innerHTML = "<h2>Error cargando index.json</h2>";
    }
}

// Función para la pantalla inicial de selección
function renderSelector(temas) {
    quizContainer.innerHTML = `
        <div class="logo-wrapper">
            <img src="logo.png" alt="Logo" class="quiz-logo">
        </div>
        <h1>Selecciona un Cuestionario</h1>
        <div class="selector-box">
            <select id="quiz-selector">
                <option value="" disabled selected>Escoge un tema para empezar...</option>
                ${temas.map(t => `<option value="${t.archivo}" data-titulo="${t.titulo}">${t.titulo}</option>`).join('')}
            </select>
        </div>
    `;
    
    document.getElementById('quiz-selector').addEventListener('change', (e) => {
        const archivo = e.target.value;
        currentTitle = e.target.options[e.target.selectedIndex].getAttribute('data-titulo');
        loadQuiz(archivo);
    });
}   

async function loadQuiz(archivo) {
    try {
        const response = await fetch(archivo);
        const data = await response.json();
        
        score = 0;
        currentQuiz = 0;
        quizData = shuffle(data);
        
        quizData.forEach(p => {
            const correctaStr = p.opciones[p.respuestaCorrecta];
            shuffle(p.opciones);
            p.respuestaCorrecta = p.opciones.indexOf(correctaStr);
        });

        showQuestion();
    } catch (e) {
        quizContainer.innerHTML = "<h2>Error cargando el archivo de preguntas</h2>";
    }
}

// Función para mostrar las preguntas
function showQuestion() {
    const data = quizData[currentQuiz];
    const progress = ((currentQuiz / quizData.length) * 100).toFixed(0);
    const notaActual = currentQuiz > 0 ? ((score / currentQuiz) * 10).toFixed(1) : "0.0";

    quizContainer.innerHTML = `
        <div class="logo-wrapper">
            <img src="logo.png" alt="Logo" class="quiz-logo">
        </div>
        <div class="quiz-header-row">
            <div class="quiz-badge">${currentTitle}</div>
            <div class="live-score">Nota: <span>${notaActual}</span></div>
        </div>
        <div class="progress-bar-container">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="header">
            <small>Pregunta ${currentQuiz + 1} de ${quizData.length}</small>
            <h2>${data.pregunta}</h2>
        </div>
        <div class="options">
            ${data.opciones.map((op, i) => `<button class="btn-opcion" onclick="checkAnswer(${i})">${op}</button>`).join('')}
        </div>
        <div id="feedback-container" class="hidden">
            <div id="feedback-text"></div>
            <button id="next-btn" onclick="nextQuestion()">Siguiente →</button>
        </div>
    `;
}

// Las funciones checkAnswer, nextQuestion, showResults y shuffle se mantienen IGUAL
window.checkAnswer = (idx) => {
    const data = quizData[currentQuiz];
    const correct = data.respuestaCorrecta;
    const buttons = document.querySelectorAll('.btn-opcion');
    const fContainer = document.getElementById('feedback-container');
    const fText = document.getElementById('feedback-text');

    buttons.forEach(b => b.disabled = true);

    if (idx === correct) {
        buttons[idx].classList.add('correct');
        score++;
        setTimeout(() => nextQuestion(), 600);
    } else {
        buttons[idx].classList.add('wrong');
        buttons[correct].classList.add('correct');
        fText.innerHTML = `
            <p class="msg-wrong">Incorrecto</p>
            <div class="explicacion-box"><strong>Explicación:</strong><br>${data.explicacion}</div>
        `;
        fContainer.classList.remove('hidden');
    }
};

window.nextQuestion = () => {
    currentQuiz++;
    if (currentQuiz < quizData.length) showQuestion();
    else showResults();
};

// Sustituye la URL por la que copiaste de Google
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwmsKQfb-s3gUB0bJtFbsa6zq2fnlANjviF_uozk7pHWjTPIzxVYGjZ-XvCe36Rux-H/exec";

function showResults() {
    const nota = ((score / quizData.length) * 10).toFixed(1);
    
    quizContainer.innerHTML = `
        <div class="results">
            <h1>¡Test completado!</h1>
            <div class="score-circle">${nota}</div>
            <p>Has acertado ${score} de ${quizData.length}</p>
            
            <div id="ranking-input">
                <input type="text" id="player-name" placeholder="Tu nombre para el ranking" maxlength="15" style="padding:10px; border-radius:5px; border:1px solid #ccc;">
                <button onclick="enviarPuntuacion(${nota})" class="btn-restart" style="margin-left:10px;">Enviar al Ranking</button>
            </div>
            
            <div id="tabla-ranking" style="margin-top:20px;"></div>
            
            <hr>
            <button onclick="location.reload()" class="btn-restart">Volver al inicio</button>
        </div>
    `;
    // Cargamos el ranking actual nada más terminar
    cargarRanking();
}

async function enviarPuntuacion(puntos) {
    const nombre = document.getElementById('player-name').value;
    if (!nombre) return alert("Escribe tu nombre");

    const btn = document.querySelector('#ranking-input button');
    btn.disabled = true;

    // En lugar de JSON, enviamos parámetros de URL (FormData)
    const urlConParametros = `${GOOGLE_SCRIPT_URL}?nombre=${encodeURIComponent(nombre)}&puntuacion=${puntos}&examen=${encodeURIComponent(currentTitle)}`;

    try {
        // Usamos el método GET que es más sencillo para Google Scripts
        await fetch(urlConParametros, { method: 'GET', mode: 'no-cors' });
        
        document.getElementById('ranking-input').innerHTML = "<p>¡Puntuación enviada! 🏆</p>";
        setTimeout(cargarRanking, 1500);
    } catch (e) {
        console.error("Error:", e);
    }
}

async function cargarRanking() {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const registros = await res.json();
    let html = "<h3>Top 10 Global</h3><table style='width:100%; font-size:0.9rem;'>";
    
    registros.forEach((reg, i) => {
        html += `<tr><td>${i+1}. ${reg[1]}</td><td style='text-align:right;'><b>${reg[2]}</b></td></tr>`;
    });
    
    html += "</table>";
    document.getElementById('tabla-ranking').innerHTML = html;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

initApp();

// Bloquear el menú contextual del botón derecho
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);

// Opcional: Bloquear atajos de teclado comunes para inspeccionar (F12, Ctrl+Shift+I)
document.addEventListener('keydown', function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && e.keyCode == 73)) {
        e.preventDefault();
        return false;
    }
}, false);
