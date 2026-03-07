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

function renderSelector(temas) {
    quizContainer.innerHTML = `
        <h1>Selecciona un Test</h1>
        <div class="selector-box">
            <select id="quiz-selector">
                <option value="" disabled selected>Escoge un tema para empezar...</option>
                ${temas.map(t => `<option value="${t.archivo}" data-titulo="${t.titulo}">${t.titulo}</option>`).join('')}
            </select>
        </div>
    `;
    
    document.getElementById('quiz-selector').addEventListener('change', (e) => {
        const archivo = e.target.value;
        // Guardamos el título del option seleccionado
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

// ... (mantenemos las variables globales y las funciones initApp, renderSelector y loadQuiz igual)

function showQuestion() {
    const data = quizData[currentQuiz];
    const progress = ((currentQuiz / quizData.length) * 100).toFixed(0);
    
    // Calcular nota actual: (aciertos / preguntas respondidas) * 10
    // Si es la primera pregunta, la nota es 0.0
    const notaActual = currentQuiz > 0 
        ? ((score / currentQuiz) * 10).toFixed(1) 
        : "0.0";

    quizContainer.innerHTML = `
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

function showResults() {
    const nota = ((score / quizData.length) * 10).toFixed(1);
    quizContainer.innerHTML = `
        <div class="results">
            <small>${currentTitle}</small>
            <h1>¡Test completado!</h1>
            <div class="score-circle">${nota}</div>
            <p>Has acertado ${score} de ${quizData.length}</p>
            <button onclick="location.reload()" class="btn-restart">Volver al inicio</button>
        </div>
    `;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

initApp();
