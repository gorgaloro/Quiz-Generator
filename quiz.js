// Quiz State
let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// DOM Elements
const uploadSection = document.getElementById('upload-section');
const quizSection = document.getElementById('quiz-section');
const resultsSection = document.getElementById('results-section');
const csvFileInput = document.getElementById('csv-file');
const fileNameDisplay = document.getElementById('file-name');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const scoreSpan = document.getElementById('score');
const totalAnsweredSpan = document.getElementById('total-answered');
const progressFill = document.getElementById('progress-fill');
const feedbackDiv = document.getElementById('feedback');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewBtn = document.getElementById('review-btn');
const newQuizBtn = document.getElementById('new-quiz-btn');

// Event Listeners
csvFileInput.addEventListener('change', handleFileUpload);
prevBtn.addEventListener('click', showPreviousQuestion);
nextBtn.addEventListener('click', showNextQuestion);
submitBtn.addEventListener('click', submitAnswer);
restartBtn.addEventListener('click', restartQuiz);
reviewBtn.addEventListener('click', reviewAnswers);
newQuizBtn.addEventListener('click', loadNewQuiz);

// Handle CSV File Upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        parseCSV(csvContent);
    };
    reader.readAsText(file);
}

// Parse CSV Content
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    quizData = [];

    // Skip header if it exists (check if first line contains 'question')
    const startIndex = lines[0].toLowerCase().includes('question') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handling quoted fields)
        const fields = parseCSVLine(line);

        if (fields.length >= 2) {
            const question = fields[0].trim();
            const correctAnswer = fields[1].trim();
            const options = fields.slice(1).map(opt => opt.trim()).filter(opt => opt);

            // Shuffle options for multiple choice
            const shuffledOptions = shuffleArray([...options]);

            quizData.push({
                question: question,
                correctAnswer: correctAnswer,
                options: shuffledOptions,
                userAnswer: null,
                isCorrect: null
            });
        }
    }

    if (quizData.length > 0) {
        initializeQuiz();
    } else {
        alert('No valid questions found in the CSV file. Please check the format.');
    }
}

// Parse a single CSV line (handles quotes and commas)
function parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    fields.push(currentField);

    return fields.map(field => field.replace(/^"|"$/g, '').trim());
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Initialize Quiz
function initializeQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.length).fill(null);
    score = 0;

    uploadSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    totalQuestionsSpan.textContent = quizData.length;
    updateScoreDisplay();
    showQuestion();
}

// Show Current Question
function showQuestion() {
    const questionData = quizData[currentQuestionIndex];

    questionText.textContent = questionData.question;
    currentQuestionSpan.textContent = currentQuestionIndex + 1;

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressFill.style.width = `${progress}%`;

    // Display options
    optionsContainer.innerHTML = '';
    questionData.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.dataset.answer = option;

        // If reviewing, show correct/incorrect
        if (questionData.userAnswer !== null) {
            optionDiv.classList.add('disabled');
            if (option === questionData.userAnswer) {
                optionDiv.classList.add(questionData.isCorrect ? 'correct' : 'incorrect');
            }
            if (option === questionData.correctAnswer && !questionData.isCorrect) {
                optionDiv.classList.add('correct');
            }
        } else {
            optionDiv.addEventListener('click', selectOption);
        }

        optionsContainer.appendChild(optionDiv);
    });

    // Show/hide feedback
    if (questionData.userAnswer !== null) {
        showFeedback(questionData.isCorrect, questionData.correctAnswer);
        submitBtn.classList.add('hidden');
    } else {
        feedbackDiv.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = true;
    }

    // Update navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === quizData.length - 1 || questionData.userAnswer === null;

    // Show restart button if quiz is complete
    if (currentQuestionIndex === quizData.length - 1 && questionData.userAnswer !== null) {
        restartBtn.classList.remove('hidden');
    } else {
        restartBtn.classList.add('hidden');
    }
}

// Select an option
function selectOption(event) {
    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Add selection to clicked option
    event.target.classList.add('selected');
    submitBtn.disabled = false;
}

// Submit Answer
function submitAnswer() {
    const selectedOption = document.querySelector('.option.selected');
    if (!selectedOption) return;

    const userAnswer = selectedOption.dataset.answer;
    const questionData = quizData[currentQuestionIndex];
    const isCorrect = userAnswer === questionData.correctAnswer;

    // Update question data
    questionData.userAnswer = userAnswer;
    questionData.isCorrect = isCorrect;

    if (isCorrect) {
        score++;
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('incorrect');
        // Highlight correct answer
        document.querySelectorAll('.option').forEach(opt => {
            if (opt.dataset.answer === questionData.correctAnswer) {
                opt.classList.add('correct');
            }
        });
    }

    // Disable all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.add('disabled');
        opt.removeEventListener('click', selectOption);
    });

    // Show feedback
    showFeedback(isCorrect, questionData.correctAnswer);

    // Update UI
    submitBtn.classList.add('hidden');
    updateScoreDisplay();

    // Enable next button or show results
    if (currentQuestionIndex < quizData.length - 1) {
        nextBtn.disabled = false;
    } else {
        restartBtn.classList.remove('hidden');
        setTimeout(showResults, 1500);
    }
}

// Show Feedback
function showFeedback(isCorrect, correctAnswer) {
    feedbackDiv.classList.remove('hidden');
    if (isCorrect) {
        feedbackDiv.className = 'feedback feedback-correct';
        feedbackDiv.innerHTML = '<strong>✓ Correct!</strong> Great job!';
    } else {
        feedbackDiv.className = 'feedback feedback-incorrect';
        feedbackDiv.innerHTML = `<strong>✗ Incorrect.</strong> The correct answer is: <strong>${correctAnswer}</strong>`;
    }
}

// Update Score Display
function updateScoreDisplay() {
    const answeredQuestions = quizData.filter(q => q.userAnswer !== null).length;
    scoreSpan.textContent = score;
    totalAnsweredSpan.textContent = answeredQuestions;
}

// Navigation Functions
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function showNextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

// Show Results
function showResults() {
    quizSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    const totalQuestions = quizData.length;
    const correctAnswers = score;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    document.getElementById('final-score').textContent = correctAnswers;
    document.getElementById('final-total').textContent = totalQuestions;
    document.getElementById('percentage').textContent = `${percentage}%`;
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('incorrect-count').textContent = incorrectAnswers;
    document.getElementById('accuracy').textContent = `${percentage}%`;
}

// Review Answers
function reviewAnswers() {
    currentQuestionIndex = 0;
    resultsSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    showQuestion();
}

// Restart Quiz
function restartQuiz() {
    // Reset all answers
    quizData.forEach(question => {
        question.userAnswer = null;
        question.isCorrect = null;
    });

    // Shuffle options again
    quizData.forEach(question => {
        question.options = shuffleArray(question.options);
    });

    // Reset state
    currentQuestionIndex = 0;
    score = 0;

    resultsSection.classList.add('hidden');
    quizSection.classList.remove('hidden');

    updateScoreDisplay();
    showQuestion();
}

// Load New Quiz
function loadNewQuiz() {
    quizData = [];
    currentQuestionIndex = 0;
    score = 0;

    resultsSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');

    csvFileInput.value = '';
    fileNameDisplay.textContent = '';
}
