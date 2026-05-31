function changeTargetPage(target) {
    switch (target) {
        case 'home':
            target = "";
            break;
        case 'quiz':
            target = "quiz";
            break;
    }

    window.location.href = `/${target}`;
}

Array.from(document.getElementsByClassName('navButton')).forEach(button => {
    button.addEventListener('click', (event) => {
        changeTargetPage(event.target.id);
    });
});