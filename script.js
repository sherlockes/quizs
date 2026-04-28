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
    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const registros = await res.json();
        
        // 1. FILTRAR: Solo los registros que coincidan con el examen actual
        // reg[3] es donde guardamos el nombre del examen según tu función enviarPuntuacion
        const registrosFiltrados = registros.filter(reg => reg[3] === currentTitle);

        // 2. ORDENAR: De mayor a menor puntuación (reg[2])
        registrosFiltrados.sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]));

        // 3. LIMITAR: Top 10
        const top10 = registrosFiltrados.slice(0, 10);

        let html = `
            <h3 style="color: #2e7d32; margin-top: 20px;">🏆 Top 10: ${currentTitle}</h3>
            <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size: 0.95rem;">
        `;
        
        if (top10.length === 0) {
            html += `<tr><td style="color:gray; padding:10px;">Aún no hay puntuaciones para este test.</td></tr>`;
        } else {
            top10.forEach((reg, i) => {
                // Ajustamos índices según el orden de envío: 
                // [0] Fecha, [1] Nombre, [2] Puntuación, [3] Examen
                html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px 0; color: #666; width: 30px;">${i + 1}.</td>
                        <td style="padding: 8px 0; font-weight: 500;">${reg[1]}</td>
                        <td style="padding: 8px 0; text-align: right; color: #2e7d32; font-weight: bold;">${reg[2]} pts</td>
                    </tr>
                `;
            });
        }
        
        html += "</table>";
        document.getElementById('tabla-ranking').innerHTML = html;
    } catch (e) {
        console.error("Error cargando ranking:", e);
        document.getElementById('tabla-ranking').innerHTML = "<p style='color:gray; font-size:0.8rem;'>Error al cargar el ranking.</p>";
    }
}

async function cargarRanking_bak() {
    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        const registros = await res.json();
        
        let html = `
            <h3 style="color: #2e7d32; margin-top: 20px;">🏆 Top 10 Global</h3>
            <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size: 0.95rem;">
        `;
        
        registros.forEach((reg, i) => {
            // reg[0] es la fecha (la ignoramos)
            // reg[1] es el nombre
            // reg[2] es la puntuación
            // reg[3] es el nombre del examen
            
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px 0; color: #666; width: 30px;">${i + 1}.</td>
                    <td style="padding: 8px 0; font-weight: 500;">${reg[1]}</td>
                    <td style="padding: 8px 0; text-align: right; color: #2e7d32; font-weight: bold;">${reg[2]} pts</td>
                </tr>
            `;
        });
        
        html += "</table>";
        document.getElementById('tabla-ranking').innerHTML = html;
    } catch (e) {
        document.getElementById('tabla-ranking').innerHTML = "<p style='color:gray; font-size:0.8rem;'>El ranking se actualizará en unos instantes...</p>";
    }
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
