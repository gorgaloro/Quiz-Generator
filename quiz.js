// Quiz State
let quizData = [];
let allQuestions = []; // Store all parsed questions
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let currentFile = null; // Store the current file for regeneration

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

    currentFile = file; // Store for regeneration
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
    allQuestions = [];

    // Skip header if it exists (check if first line contains 'question')
    const startIndex = lines[0].toLowerCase().includes('question') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handling quoted fields)
        const fields = parseCSVLine(line);

        if (fields.length >= 4) {
            const question = fields[0].trim();
            const correctAnswer = fields[1].trim();
            const enrichedChoices = fields[3].trim(); // Column D contains all answer choices

            // Parse the enriched choices to extract individual options
            const options = parseEnrichedChoices(enrichedChoices);

            if (options.length > 0) {
                allQuestions.push({
                    question: question,
                    correctAnswer: correctAnswer,
                    options: options,
                    userAnswer: null,
                    isCorrect: null
                });
            }
        }
    }

    if (allQuestions.length > 0) {
        showQuestionLimitSelector();
    } else {
        alert('No valid questions found in the CSV file. Please check the format.');
    }
}

// Parse enriched answer choices (handles formats like "A) option1 B) option2" or line-separated)
function parseEnrichedChoices(enrichedText) {
    const options = [];

    // Try splitting by common patterns: A), B), C), D), etc.
    const pattern = /[A-Z]\)\s*/g;
    const parts = enrichedText.split(pattern).filter(part => part.trim());

    if (parts.length > 1) {
        // Successfully split by letter patterns
        return parts.map(opt => opt.trim()).filter(opt => opt);
    }

    // Try splitting by newlines
    const lineOptions = enrichedText.split(/\n+/).map(opt => {
        // Remove leading patterns like "A) ", "B) ", etc.
        return opt.replace(/^[A-Z]\)\s*/, '').trim();
    }).filter(opt => opt);

    if (lineOptions.length > 1) {
        return lineOptions;
    }

    // Fallback: return as single option if no pattern matched
    return [enrichedText.trim()];
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

// Show question limit selector
function showQuestionLimitSelector() {
    const totalAvailable = allQuestions.length;

    // Create selector HTML
    const selectorHTML = `
        <div class="question-limit-selector">
            <h3>Quiz loaded! ${totalAvailable} questions available.</h3>
            <p>How many questions would you like in your quiz?</p>
            <div class="limit-options">
                <button class="limit-btn" onclick="generateQuiz(10)">10 Questions</button>
                <button class="limit-btn" onclick="generateQuiz(25)">25 Questions</button>
                <button class="limit-btn" onclick="generateQuiz(50)">50 Questions</button>
                <button class="limit-btn" onclick="generateQuiz(${totalAvailable})">All ${totalAvailable} Questions</button>
                <div class="custom-limit">
                    <input type="number" id="custom-limit" min="1" max="${totalAvailable}" placeholder="Custom">
                    <button class="limit-btn" onclick="generateCustomQuiz()">Start Custom</button>
                </div>
            </div>
        </div>
    `;

    uploadSection.innerHTML += selectorHTML;
}

// Generate quiz with specified number of questions
function generateQuiz(numQuestions) {
    const limit = Math.min(numQuestions, allQuestions.length);

    // Randomly select questions
    const shuffledAll = shuffleArray([...allQuestions]);
    quizData = shuffledAll.slice(0, limit);

    // Shuffle options for each question
    quizData.forEach(question => {
        question.options = shuffleArray(question.options);
        question.userAnswer = null;
        question.isCorrect = null;
    });

    initializeQuiz();
}

// Generate quiz with custom number
function generateCustomQuiz() {
    const customInput = document.getElementById('custom-limit');
    const num = parseInt(customInput.value);

    if (isNaN(num) || num < 1) {
        alert('Please enter a valid number');
        return;
    }

    if (num > allQuestions.length) {
        alert(`Only ${allQuestions.length} questions available. Starting quiz with all questions.`);
        generateQuiz(allQuestions.length);
    } else {
        generateQuiz(num);
    }
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

// Restart Quiz (with same questions)
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

// Generate new quiz from same CSV (different random questions)
function generateNewQuizFromSame() {
    if (allQuestions.length === 0) {
        alert('No questions available. Please upload a CSV file first.');
        return;
    }

    resultsSection.classList.add('hidden');
    quizSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');

    // Reset the upload section to show the question selector
    const uploadArea = uploadSection.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }

    showQuestionLimitSelector();
}

// Load completely new CSV file
function loadNewQuiz() {
    quizData = [];
    allQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    currentFile = null;

    resultsSection.classList.add('hidden');
    quizSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');

    // Reset upload section
    uploadSection.innerHTML = `
        <div class="upload-area">
            <div class="upload-icon">📁</div>
            <h2>Upload Your Quiz CSV</h2>
            <p>CSV format: Question, Answer, Choices, Enriched Answer Choices</p>
            <input type="file" id="csv-file" accept=".csv" />
            <label for="csv-file" class="upload-btn">Choose File</label>
            <p class="file-name" id="file-name"></p>
        </div>
    `;

    // Re-attach event listener
    const newFileInput = document.getElementById('csv-file');
    newFileInput.addEventListener('change', handleFileUpload);
}
