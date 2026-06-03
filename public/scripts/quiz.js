    document.addEventListener('DOMContentLoaded', () => {
        const quizForm = document.getElementById('quizForm');

        if (quizForm) {
            quizForm.addEventListener('submit', function(event) {
                event.preventDefault(); 
                
                let score = 0;
                const questionContainers = document.querySelectorAll('.questionContainer');

                questionContainers.forEach(container => {
                    const questionId = container.getAttribute('data-question-id');
                    const correctAnswer = container.getAttribute('data-correct');
                    const selectedOption = container.querySelector(`input[name="${questionId}"]:checked`);

                    if (selectedOption && selectedOption.value === correctAnswer) {
                        score++;
                    }
                });

                alert(`You scored ${score} out of ${questionContainers.length}!`);
            });
        } else {
            console.error("Could not find the quizForm!");
        }
    });