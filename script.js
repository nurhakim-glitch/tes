const questions = [
    {
        question: "مَا مَعْنَى كَلِمَةِ «كِتَابٌ» بِاللُّغَةِ الإِنْدُونِيسِيَّةِ؟",
        options: ["Pena", "Buku", "Meja", "Pintu"],
        answer: 1
    },
    {
        question: "اِخْتَرْ جَمْعَ كَلِمَةِ «طَالِبٌ»",
        options: ["طَالِبَانِ", "طُلَّابٌ", "مُعَلِّمٌ", "مَدْرَسَةٌ"],
        answer: 1
    },
    {
        question: "مَا هُوَ ضِدُّ كَلِمَةِ «كَبِيرٌ»؟",
        options: ["طَوِيلٌ", "قَصِيرٌ", "صَغِيرٌ", "جَمِيلٌ"],
        answer: 2
    },
    {
        question: "«أَنَا ... إِلَى المَدْرَسَةِ كُلَّ يَوْمٍ». اِخْتَرِ الفِعْلَ المُنَاسِبَ",
        options: ["يَذْهَبُ", "تَذْهَبُ", "أَذْهَبُ", "نَذْهَبُ"],
        answer: 2
    },
    {
        question: "مَا مَعْنَى «السَّلَامُ عَلَيْكُمْ»؟",
        options: ["Selamat tinggal", "Selamat datang", "Semoga keselamatan atasmu", "Terima kasih"],
        answer: 2
    }
];

let currentQuestion = 0;
let userAnswers = new Array(questions.length).fill(null);
let userData = {};
let timerInterval = null;
let timeRemaining = 30 * 60;

const loginSection = document.getElementById('login-section');
const testSection = document.getElementById('test-section');
const resultSection = document.getElementById('result-section');
const loginForm = document.getElementById('login-form');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentNum = document.getElementById('current-num');
const totalNum = document.getElementById('total-num');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const timerEl = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userData = {
        nama: document.getElementById('nama').value,
        email: document.getElementById('email').value,
        level: document.getElementById('level').value
    };
    startTest();
});

function startTest() {
    loginSection.classList.add('hidden');
    testSection.classList.remove('hidden');
    totalNum.textContent = questions.length;
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    const q = questions[currentQuestion];
    questionText.textContent = q.question;
    currentNum.textContent = currentQuestion + 1;

    optionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const label = document.createElement('label');
        label.className = 'option';
        if (userAnswers[currentQuestion] === idx) label.classList.add('selected');
        label.innerHTML = `
            <input type="radio" name="option" value="${idx}" ${userAnswers[currentQuestion] === idx ? 'checked' : ''}>
            ${opt}
        `;
        label.addEventListener('click', () => selectOption(idx));
        optionsContainer.appendChild(label);
    });

    prevBtn.disabled = currentQuestion === 0;
    if (currentQuestion === questions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

function selectOption(idx) {
    userAnswers[currentQuestion] = idx;
    renderQuestion();
}

prevBtn.addEventListener('click', () => {
    if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
});

nextBtn.addEventListener('click', () => {
    if (currentQuestion < questions.length - 1) { currentQuestion++; renderQuestion(); }
});

submitBtn.addEventListener('click', finishTest);

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) { clearInterval(timerInterval); finishTest(); }
    }, 1000);
}

function updateTimerDisplay() {
    const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');
    timerEl.textContent = `⏱️ ${m}:${s}`;
}

function finishTest() {
    clearInterval(timerInterval);
    let score = 0;
    userAnswers.forEach((ans, i) => { if (ans === questions[i].answer) score++; });
    const percentage = Math.round((score / questions.length) * 100);

    testSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    document.getElementById('result-nama').textContent = userData.nama;
    document.getElementById('result-level').textContent = userData.level;
    document.getElementById('result-score').textContent = `${score} / ${questions.length} (${percentage}%)`;
    document.getElementById('result-status').textContent = percentage >= 70 ? 'LULUS ✅' : 'BELUM LULUS ❌';
}

restartBtn.addEventListener('click', () => {
    currentQuestion = 0;
    userAnswers = new Array(questions.length).fill(null);
    timeRemaining = 30 * 60;
    resultSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
});
