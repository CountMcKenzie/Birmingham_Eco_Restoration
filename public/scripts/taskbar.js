document.addEventListener('DOMContentLoaded', () => {

    function changeTargetPage(target) {
        switch (target) {
            case 'home':
                target = "";
                break;
            case 'quiz':
                target = "quiz";
                break;
            case 'foodbanks':
                target = "foodbank";
                break;
            case 'aboutus':
                target = "aboutus";
                break;
            case 'ourgoals':
                target = "ourgoals";
                break;

            default:
                console.error(`Unknown nav ID: "${target}". Check your HTML IDs!`);
                return; // Stop execution if ID doesn't match
        }

        window.location.href = `/${target}`;
    }


    const navButtons = document.getElementsByClassName('navButton');
    
    Array.from(navButtons).forEach(button => {
        button.addEventListener('click', (event) => {
            changeTargetPage(event.currentTarget.id); 
        });
    });

});