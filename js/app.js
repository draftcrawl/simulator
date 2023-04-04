// document.addEventListener('alpine:init', () => {});

gameLoop();

async function gameLoop() {
    const urlParams = new URLSearchParams(window.location.search);
    createGame({
        playerClass: urlParams.get('class') || undefined,
        debug: urlParams.get('debug'),
        actionInterval: urlParams.get('i') || 1000,
        beforeInit: browserUI,
    });
}
