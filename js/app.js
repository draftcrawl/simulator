// document.addEventListener('alpine:init', () => {});

gameLoop();

async function gameLoop() {
    const urlParams = new URLSearchParams(window.location.search);
    createGame({
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
        actionInterval: 250,
        beforeInit: browserUI,
    });
}
