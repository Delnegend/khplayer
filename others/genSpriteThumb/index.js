/* eslint-disable max-len */
// jshint esversion: 8
const d = document;
const genCode = {
  changeResult() {
    const
      parentSelect = '.container ';
    const filename = $(parentSelect + '#filename').val() || $(parentSelect + '#filename').attr('placeholder');
    const fps = $(parentSelect + '#fps').val() || $(parentSelect + '#fps').attr('placeholder');
    const hour = $(parentSelect + '#hour').val() || $(parentSelect + '#hour').attr('placeholder');
    const minute = $(parentSelect + '#minute').val() || $(parentSelect + '#minute').attr('placeholder');
    const second = $(parentSelect + '#second').val() || $(parentSelect + '#second').attr('placeholder');
    const width = $(parentSelect + '#width').val() || $(parentSelect + '#width').attr('placeholder');
    const height = $(parentSelect + '#height').val() || $(parentSelect + '#height').attr('placeholder');
    const interval = $(parentSelect + '#interval').val() || $(parentSelect + '#interval').attr('placeholder');
    const thumbUrl = $(parentSelect + '#thumbUrl').val() || $(parentSelect + '#thumbUrl').attr('placeholder');

    const totalVidDur = hour * 3600 + minute * 60 + second;
    const grid = Math.round(Math.sqrt(totalVidDur / interval)) + 1;

    const ffmpegCmd = `ffmpeg -i ${filename} -filter_complex "select='not(mod(n,${fps * interval}))',scale=${width}:${height},tile=${grid}x${grid}" -frames:v 1 -qscale:v 3 -an ${filename}_mosaic.jpg`;
    const nodeCmd = `node create.js ${totalVidDur} '${thumbUrl}' '${filename}_mosaic.vtt' ${interval} ${width} ${height} ${grid}`;
    $('#ffmpegCmd').html(ffmpegCmd);
    $('#nodeCmd').html(nodeCmd);
  },
};
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const language = params.get('lang');
  for (const elem of d.querySelectorAll('copy-button')) {
    elem.innerHTML =
      /* html */`
        <button type="button" class="btn btn-success" data-clipboard-target='${elem.getAttribute('data-target')}'>
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-clipboard-plus" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path fill-rule="evenodd" d="M9.5 1h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3zM8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7z"/>
            </svg>
        </button>`
    ;
  }
  for (const elem of d.querySelectorAll('input-field')) {
    const
      title = ((language == 'en') && elem.getAttribute('t-en')) || elem.getAttribute('t-vi') || '';
    const placeholder = elem.getAttribute('placeholder') || '';
    const id = elem.getAttribute('_id') || '';
    const type = elem.getAttribute('type') || '';
    elem.innerHTML = `
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">${title}</span>
      </div>
      <input oninput="genCode.changeResult()" type="${type}" class="form-control" placeholder="${placeholder}" aria-label="${placeholder}" id="${id}">
    </div>`;
  }

  genCode.changeResult();

  $('copy-button').on('click', () => new ClipboardJS('copy-button .btn'));

  if (language == 'en') {
    for (const elem of document.querySelectorAll('i-18n')) elem.innerHTML = elem.getAttribute('en');
    // for (let elem of document.querySelectorAll('*[t-en]')) elem.setAttribute("title", elem.getAttribute("ph-en"));
  } else {
    for (const elem of document.querySelectorAll('i-18n')) elem.innerHTML = elem.getAttribute('vi');
    // for (let elem of document.querySelectorAll('*[t-vi]')) elem.setAttribute("title", elem.getAttribute("ph-vi"));
  }
});
