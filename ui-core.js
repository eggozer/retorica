// Renderizador de Botón Redondo con Anillo Neón
function createRoundButton(id, iconSvg, labelText, onClickCallback) {
    var container = document.createElement('div');
    container.className = 'btn-round-container';

    var btn = document.createElement('button');
    btn.className = 'btn-round';
    btn.id = id;

    // SVG Anillo Neón
    var svgRing = '<svg class="ring" viewBox="0 0 52 52">' +
                  '<circle cx="26" cy="26" r="23"></circle>' +
                  '</svg>';

    btn.innerHTML = svgRing + iconSvg;

    // Control de Animación Neón al Presionar
    btn.onclick = function() {
        btn.classList.add('pulse');
        setTimeout(function() {
            btn.classList.remove('pulse');
        }, 600);
        if (onClickCallback) onClickCallback();
    };

    // Etiqueta con detección de Marquesina
    var labelWrap = document.createElement('div');
    labelWrap.className = 'btn-label-wrap';

    var label = document.createElement('span');
    label.className = 'btn-label';
    label.innerText = labelText;

    if (labelText.length > 9 || labelText.indexOf(' ') !== -1) {
        label.classList.add('marquee');
    }

    labelWrap.appendChild(label);
    container.appendChild(btn);
    container.appendChild(labelWrap);

    return container;
}
