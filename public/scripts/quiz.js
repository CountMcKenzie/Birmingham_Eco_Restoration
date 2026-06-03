    document.addEventListener('DOMContentLoaded', () => {
        const quizForm = document.getElementById('quizForm');

        if (quizForm) {
            quizForm.addEventListener('submit', function(event) {
                event.preventDefault(); 
                
                let score = 0;
                const questionContainers = document.querySelectorAll('.questionContainer');

                questionContainers.forEach(container => {
                    const questionId = container.getAttribute('dataQuestionId');
                    const correctAnswer = container.getAttribute('dataCorrect');
                    const selectedOption = container.querySelector(`input[name="${questionId}"]:checked`);

                    if (selectedOption && selectedOption.value === correctAnswer) {
                        score++;
                    }
                });
                alert(`You scored ${score} / ${questionContainers.length}!`);
            });
        } else {
            console.error("Could not find the quizForm!");
        }
    });