const questions = [
    {
        question: "Observa la gráfica clínica de la OMS en la imagen adjunta. Considerando que el indicador del paciente muestra un puntaje Z (Z-Score) de +2.42, ¿cuál es el diagnóstico nutricional correcto según las categorías establecidas?",
        image: "https://i.postimg.cc/k5TWFD84/image.png",
        options: [
            "Desnutrición severa",
            "Sobrepeso",
            "Obesidad"
        ],
        correctAnswer: 1
    },
    {
        question: "Observando la interfaz del programa WHO Anthro, notamos que el paciente tiene 11 meses de edad. Según las técnicas estandarizadas de la OMS, ¿cómo se debe tomar la medida de longitud/talla en este paciente?",
        image: "https://i.postimg.cc/C5q976QF/Screenshot-2.png",
        options: [
            "Acostado (longitud) utilizando un infantómetro.",
            "De pie (talla) utilizando un estadiómetro.",
            "Es indiferente, se puede medir acostado o de pie mientras se anote en el software."
        ],
        correctAnswer: 0
    },
    {
        question: "Analiza el panel gestacional adjunto de una paciente en la semana 39. Inició con un IMC pregestacional de 25.00. En la curva de Calvo (izquierda) su trayectoria se mantiene cómodamente dentro de la franja verde, pero la gráfica del IOM (derecha) revela una ganancia neta total de apenas 3 kg. ¿Cuál es la interpretación clínica correcta?",
        image: "https://i.postimg.cc/4xY746qc/Screenshot-11.png",
        options: [
            "Aunque su IMC aparente normalidad en Calvo, la ganancia de solo 3 kg es severamente deficiente según las metas del IOM. Existe un altísimo riesgo de restricción del crecimiento intrauterino (RCIU).",
            "Como la trayectoria en Calvo se mantuvo en la zona de seguridad y nunca cayó al canal de desnutrición (-2 SD), la evolución es óptima y los 3 kg ganados fueron suficientes.",
            "La paciente presenta una evolución ideal porque logró evitar el sobrepeso gestacional, lo que garantiza un parto fisiológico sin riesgo de macrosomía fetal."
        ],
        correctAnswer: 0
    },
    {
        question: "Lee detenidamente la viñeta clínica adjunta y responde: ¿Cuál es la formulación diagnóstica PES más exacta para esta paciente?",
        image: "https://i.postimg.cc/MZMxP9CD/e57bd0b4-0222-4ded-88f8-8718eefc4b55.png",
        options: [
            "Pérdida de peso relacionada con falta de conocimiento sobre los requerimientos aumentados en el embarazo, evidenciada por consumo de 900 kcal/día.",
            "Náuseas y vómitos fisiológicos del embarazo relacionados con elevación hormonal normal, evidenciados por intolerancia a alimentos sólidos.",
            "Ingesta oral inadecuada relacionada con náuseas y vómitos severos del primer trimestre, evidenciada por consumo de solo 900 kcal/día y pérdida de peso de 3.5 kg en 4 semanas."
        ],
        correctAnswer: 2
    },
    {
        question: "Lee la viñeta clínica. Estás realizando un Recordatorio de 24 Horas y te encuentras en el Paso 4 (Ciclo de Detalle). El paciente acaba de mencionar su almuerzo. ¿Qué acción te corresponde hacer exactamente en este paso?",
        image: "https://i.postimg.cc/k51bv7Zh/53baa115-9ee9-4d15-bcc7-f5ab6e4428bf.png", 
        options: [
            "Aclararle al paciente que no lo vas a juzgar por lo que haya comido, para generar confianza y evitar que sienta vergüenza.",
            "Preguntarle si además de los fideos no se olvidó de mencionar algún vaso de agua, postre o golosina.",
            "Usar modelos visuales (réplicas de alimentos) para medir la porción exacta que se sirvió, e indagar cómo preparó la ensalada."
        ],
        correctAnswer: 2
    }
];

// REEMPLAZAR EL URL CUANDO TENGAS EL NUEVO SCRIPT DESPLEGADO
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyTWeBK9N2Ad3pkIKvG4W5xlOVizhdUnRqT_p16deyt_pNDzoKiwqjn5snvAn0ow4oorQ/exec";

// Función para aleatorizar arrays
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Preparar y aleatorizar preguntas y opciones manteniendo el rastro original
questions.forEach((q, index) => {
    q.originalIndex = index; 
    const correctText = q.options[q.correctAnswer];
    shuffleArray(q.options); 
    q.correctAnswer = q.options.indexOf(correctText); 
});
shuffleArray(questions);

let currentQuestionIndex = 0;
let studentName = "";
let studentUp = "";
let cheatCount = 0;
let timerInterval;
let startTime;
let selectedOption = null;
let userAnswers = []; 
let isQuizActive = false;
let score = 0;

// DOM Elements
const screenStart = document.getElementById('start-screen');
const screenQuiz = document.getElementById('quiz-screen');
const screenEnd = document.getElementById('end-screen');
const overlay = document.getElementById('loading-overlay');

const btnStart = document.getElementById('btn-start');
const btnNext = document.getElementById('btn-next');
const btnDownload = document.getElementById('btn-download');
const inputName = document.getElementById('student-name');
const datalist = document.getElementById('student-list');
const timeDisplay = document.getElementById('time-display');

// Elementos para el registro manual
const linkManual = document.getElementById('link-manual-entry');
const linkSearch = document.getElementById('link-search-entry');
const groupSearch = document.getElementById('search-group');
const groupManual = document.getElementById('manual-group');
const manualUp = document.getElementById('manual-up');
const manualName = document.getElementById('manual-name');

let isManualEntry = false;

linkManual.addEventListener('click', (e) => {
    e.preventDefault();
    isManualEntry = true;
    groupSearch.style.display = 'none';
    groupManual.style.display = 'block';
});

linkSearch.addEventListener('click', (e) => {
    e.preventDefault();
    isManualEntry = false;
    groupManual.style.display = 'none';
    groupSearch.style.display = 'block';
});

// Población del datalist
if (typeof studentsData !== 'undefined') {
    studentsData.forEach(student => {
        const option = document.createElement('option');
        option.value = `${student.up} - ${student.name}`;
        datalist.appendChild(option);
    });
}

// Iniciar Cuestionario
btnStart.addEventListener('click', () => {
    // Bloqueo de dispositivo (Anti-doble ingreso)
    if (localStorage.getItem('parcial_oficial_iniciado')) {
        const bypassCode = prompt("⛔ ACCESO DENEGADO: Ya has iniciado un examen en este dispositivo.\n\nSi tuviste un problema y necesitas un segundo intento, solicita el código de desbloqueo al profesor e ingrésalo aquí:");
        
        if (bypassCode === "333") {
            // El profesor ingresó el código correcto, limpiamos el bloqueo
            localStorage.removeItem('parcial_oficial_iniciado');
            alert("Código aceptado. Puedes comenzar de nuevo.");
        } else {
            if (bypassCode !== null) { // Si escribió algo pero está mal
                alert("Código incorrecto.");
            }
            return; // Detener ejecución
        }
    }

    if (isManualEntry) {
        const upVal = manualUp.value.trim();
        const nameVal = manualName.value.trim();
        if (!upVal || !nameVal) {
            alert("Por favor, completa ambos campos (UP y Nombre).");
            return;
        }
        studentUp = upVal;
        studentName = nameVal;
    } else {
        const nameInputVal = inputName.value.trim();
        if (!nameInputVal || !nameInputVal.includes(" - ")) {
            alert("Por favor, selecciona obligatoriamente tu nombre desde la lista desplegable.");
            return;
        }
        const parts = nameInputVal.split(" - ");
        studentUp = parts[0];
        studentName = parts[1];
    }

    document.getElementById('display-name').textContent = `${studentUp} - ${studentName}`;
    
    // Marcar el dispositivo como utilizado
    localStorage.setItem('parcial_oficial_iniciado', 'true');
    
    screenStart.classList.remove('active');
    screenQuiz.classList.add('active');
    
    isQuizActive = true;
    startTimer();
    loadQuestion();
});

function loadQuestion() {
    selectedOption = null;
    btnNext.disabled = true;
    
    if (currentQuestionIndex === questions.length - 1) {
        btnNext.textContent = "Finalizar y Ver Resultados 🏁";
    } else {
        btnNext.textContent = "Siguiente Pregunta ➡";
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    document.getElementById('progress-bar').style.width = progressPercent + "%";
    document.getElementById('progress-text').textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;

    document.getElementById('question-text').textContent = currentQuestion.question;
    
    const imgContainer = document.getElementById('image-container');
    const imgElement = document.getElementById('question-image');
    if (currentQuestion.image && currentQuestion.image !== "") {
        imgElement.src = currentQuestion.image;
        imgContainer.style.display = "block";
    } else {
        imgContainer.style.display = "none";
    }

    const answerContainer = document.getElementById('answer-container');
    answerContainer.innerHTML = ''; 
    
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'btn answer-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(index, button);
        answerContainer.appendChild(button);
    });
}

function selectAnswer(index, buttonElement) {
    selectedOption = index;
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    buttonElement.classList.add('selected');
    btnNext.disabled = false;
}

btnNext.addEventListener('click', () => {
    // Evaluar la respuesta elegida
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = (selectedOption === currentQuestion.correctAnswer);
    if (isCorrect) score++;

    // Guardar para Excel
    userAnswers.push({
        originalIndex: currentQuestion.originalIndex,
        pregunta: currentQuestion.question,
        respuesta_alumno: currentQuestion.options[selectedOption],
        es_correcta: isCorrect ? "SÍ" : "NO"
    });

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
});

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        timeDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

// ----------------------------------------------------
// SISTEMA ANTI-TRAMPAS CON TOAST FLOATING ALERTS
// ----------------------------------------------------
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">🚨</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

let isCheatingRecently = false;

document.addEventListener("visibilitychange", () => {
    if (document.hidden && isQuizActive && !isCheatingRecently) {
        registerCheat("Has cambiado de aplicación o pantalla");
    }
});

window.addEventListener('blur', () => {
    if (isQuizActive && !isCheatingRecently) {
        registerCheat("Has perdido el foco de la ventana");
    }
});

function registerCheat(reason) {
    cheatCount++;
    isCheatingRecently = true;
    showToast(`¡ADVERTENCIA! ${reason}. Infracción #${cheatCount} registrada.`);
    
    // Bloquear el doble registro por 2 segundos
    setTimeout(() => {
        isCheatingRecently = false;
    }, 2000);
}
// ----------------------------------------------------

async function finishQuiz() {
    isQuizActive = false;
    clearInterval(timerInterval);
    const totalTime = timeDisplay.textContent;
    
    document.getElementById('progress-bar').style.width = "100%";
    screenQuiz.classList.remove('active');
    overlay.classList.add('active');

    // Ordenar las respuestas según el índice original para no mezclar las columnas del Excel
    userAnswers.sort((a, b) => a.originalIndex - b.originalIndex);

    const payload = {
        up: studentUp,
        nombre: studentName,
        tiempo: totalTime,
        puntaje: `${score}/${questions.length}`,
        trampas: cheatCount,
        respuestas: userAnswers
    };

    try {
        if(GOOGLE_SCRIPT_URL === "URL_DEL_NUEVO_SCRIPT_AQUI") {
             console.log("Simulando envío...", payload);
             await new Promise(r => setTimeout(r, 1500));
        } else {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
    } catch (error) {
        console.error('Error al enviar:', error);
    } finally {
        overlay.classList.remove('active');
        showEndScreen(totalTime);
    }
}

function showEndScreen(totalTime) {
    screenEnd.classList.add('active');
    document.getElementById('final-name').textContent = `${studentUp} - ${studentName}`;
    document.getElementById('final-time').textContent = totalTime;
    document.getElementById('final-score').textContent = `${score} / ${questions.length}`;
    
    if (cheatCount > 0) {
        document.getElementById('cheat-stat').style.display = 'flex';
        document.getElementById('final-cheats').textContent = cheatCount;
    }
}

// Descarga de comprobante en PDF
btnDownload.addEventListener('click', () => {
    // Crear contenedor HTML invisible para el PDF
    const pdfDiv = document.createElement('div');
    pdfDiv.style.padding = '30px';
    pdfDiv.style.fontFamily = 'Helvetica, Arial, sans-serif';
    pdfDiv.style.color = '#1f2937';
    
    let htmlContent = `
        <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Comprobante de Parcial Oficial</h1>
        <p><strong>Fecha y Hora:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Alumno:</strong> ${studentName}</p>
        <p><strong>UP / Legajo:</strong> ${studentUp}</p>
        <p><strong>Tiempo de Resolución:</strong> ${timeDisplay.textContent}</p>
        <p><strong>PUNTAJE OBTENIDO:</strong> <span style="color:#2563eb; font-weight:bold; font-size:1.2rem;">${score} / ${questions.length}</span></p>
    `;
    
    if (cheatCount > 0) {
        htmlContent += `<p style="color: #ef4444; font-weight: bold;">⚠️ Infracciones registradas (Anti-Trampas): ${cheatCount}</p>`;
    }
    
    htmlContent += `
        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
        <h2>TUS RESPUESTAS:</h2>
    `;
    
    userAnswers.forEach((ans, index) => {
        htmlContent += `
            <div style="margin-bottom: 15px; padding: 10px; background: #f9fafb; border-radius: 6px; border-left: 4px solid ${ans.es_correcta === "SÍ" ? '#10b981' : '#ef4444'}; page-break-inside: avoid;">
                <p style="margin:0 0 5px 0;"><strong>Pregunta ${index + 1}:</strong> ${ans.es_correcta === "SÍ" ? '✅ Correcta' : '❌ Incorrecta'}</p>
                <p style="margin:0; font-size: 0.9rem;">> Elegiste: ${ans.respuesta_alumno}</p>
            </div>
        `;
    });
    
    pdfDiv.innerHTML = htmlContent;
    
    const opt = {
      margin:       10,
      filename:     `Parcial_${studentUp}_${studentName.replace(/ /g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Cambiar botón temporalmente
    btnDownload.textContent = "⏳ Generando PDF...";
    btnDownload.disabled = true;
    
    html2pdf().set(opt).from(pdfDiv).save().then(() => {
        btnDownload.textContent = "📥 Descargar Comprobante PDF/TXT";
        btnDownload.disabled = false;
    });
});
