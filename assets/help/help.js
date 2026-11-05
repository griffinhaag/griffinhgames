// "How to play" button + pop-up, shared by every game.
// A page opts in with a <template id="help-template" data-theme="..." data-title="...">
// holding the help content, plus this script and help.css.
(function () {
    const template = document.getElementById('help-template');
    if (!template) return;

    const theme = template.dataset.theme || 'lockedin';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `help-btn help-theme-${theme}`;
    button.setAttribute('aria-label', 'How to play');
    button.setAttribute('aria-haspopup', 'dialog');
    button.textContent = '?';

    const dialog = document.createElement('dialog');
    dialog.className = `help-dialog help-theme-${theme}`;
    dialog.setAttribute('aria-labelledby', 'help-title');

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'help-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';

    const title = document.createElement('h2');
    title.id = 'help-title';
    title.className = 'help-title';
    title.textContent = template.dataset.title || 'How to play';

    const body = document.createElement('div');
    body.className = 'help-body';
    body.appendChild(template.content.cloneNode(true));

    dialog.append(close, title, body);
    document.body.append(button, dialog);

    const open = () => {
        dialog.showModal();
        body.scrollTop = 0;
        document.documentElement.classList.add('help-open');
    };
    const shut = () => dialog.close();

    button.addEventListener('click', open);
    close.addEventListener('click', shut);
    // Tap outside the panel (on the backdrop) to close
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) shut();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('help-open');
        button.focus();
    });
})();
