# Quiz-Generator 📚

An interactive web-based quiz application that converts CSV files into engaging study quizzes. Perfect for certification exam preparation, course review, or any learning scenario where you need interactive practice questions.

## Features

- **CSV Upload**: Upload questions and answers in a simple CSV format
- **Interactive Quiz Interface**: Multiple-choice questions with instant feedback
- **Progress Tracking**: Visual progress bar and score display
- **Answer Review**: Review all questions and see correct answers after completion
- **Randomized Options**: Answer choices are shuffled for each quiz session
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient design with smooth animations

## Getting Started

### Quick Start

1. Open `index.html` in your web browser
2. Click "Choose File" and upload your quiz CSV file
3. Start answering questions!

### Creating Your Quiz CSV

Your CSV file should follow this format:

```csv
question,answer,option1,option2,option3
"What is the capital of France?","Paris","Paris","London","Berlin","Madrid"
"What is 2+2?","4","4","3","5","6"
```

#### CSV Format Rules:

- **First row**: Can be a header (will be automatically skipped if detected) or your first question
- **Columns**:
  - Column 1: Question text
  - Column 2: Correct answer
  - Columns 2-N: All answer options (including the correct answer)
- **Minimum**: Each question needs at least 2 options (the correct answer + 1 incorrect option)
- **Recommended**: 3-4 options per question for best quiz experience
- **Quotes**: Use quotes around fields that contain commas
- **Tips**:
  - The correct answer should appear in both column 2 AND in the options
  - Options will be automatically shuffled when displayed
  - You can have different numbers of options for different questions

### Sample CSV

A sample quiz file (`sample-quiz.csv`) is included with networking certification questions. Use it to:
- Test the application
- See the correct CSV format
- Use as a template for your own quizzes

## How to Use

### Step 1: Upload Your Quiz
- Click the "Choose File" button
- Select your CSV file
- The quiz will automatically load

### Step 2: Take the Quiz
- Read each question carefully
- Click on your answer choice
- Click "Submit Answer" to check if you're correct
- Green highlighting = correct answer
- Red highlighting = your incorrect answer
- Navigate using "Previous" and "Next" buttons

### Step 3: Review Results
- After completing all questions, view your final score
- See detailed statistics (correct/incorrect/accuracy percentage)
- Click "Review Answers" to see all questions again
- Click "Restart Quiz" to retake with shuffled options
- Click "Upload New Quiz" to load a different quiz

## File Structure

```
Quiz-Generator/
├── index.html          # Main HTML page
├── style.css           # Styling and animations
├── quiz.js             # Quiz logic and CSV parsing
├── sample-quiz.csv     # Example quiz file
└── README.md           # This file
```

## Technical Features

- **Pure JavaScript**: No external dependencies required
- **Client-Side Processing**: All CSV parsing happens in the browser
- **Local Storage**: No data is sent to any server
- **Responsive Design**: Adapts to any screen size
- **Modern CSS**: Gradients, animations, and smooth transitions

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Tips for Creating Great Quizzes

1. **Clear Questions**: Write unambiguous questions
2. **Plausible Distractors**: Make incorrect options believable
3. **Consistent Format**: Keep question style consistent
4. **Appropriate Difficulty**: Mix easy, medium, and hard questions
5. **Review Mode**: Take advantage of the review feature to reinforce learning

## License

Free to use for personal and educational purposes.

## Support

For issues or questions, please open an issue on the GitHub repository.
