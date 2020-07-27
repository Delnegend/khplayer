// jshint esversion: 8
const d = document;
const genCode = {
  changeResult() {
    let
      parentSelect = '.container ',
      filename = $(parentSelect + '#filename').val() || $(parentSelect + '#filename').attr('placeholder'),
      fps = $(parentSelect + '#fps').val() || $(parentSelect + '#fps').attr('placeholder'),
      hour = $(parentSelect + '#hour').val() || $(parentSelect + '#hour').attr('placeholder'),
      minute = $(parentSelect + '#minute').val() || $(parentSelect + '#minute').attr('placeholder'),
      second = $(parentSelect + '#second').val() || $(parentSelect + '#second').attr('placeholder'),
      width = $(parentSelect + '#width').val() || $(parentSelect + '#width').attr('placeholder'),
      height = $(parentSelect + '#height').val() || $(parentSelect + '#height').attr('placeholder'),
      interval = $(parentSelect + '#interval').val() || $(parentSelect + '#interval').attr('placeholder'),
      thumbUrl = $(parentSelect + "#thumbUrl").val() || $(parentSelect + "#thumbUrl").attr('placeholder');

    let totalVidDur = hour * 3600 + minute * 60 + second,
      grid = Math.round(Math.sqrt(totalVidDur / interval)) + 1;

    let ffmpegCmd = `ffmpeg -i ${filename} -filter_complex "select='not(mod(n,${fps*interval}))',scale=${width}:${height},tile=${grid}x${grid}" -frames:v 1 -qscale:v 3 -an ${filename}_mosaic.jpg`;
    let nodeCmd = `node create.js ${totalVidDur} '${thumbUrl}' '${filename}_mosaic.vtt' ${interval} ${width} ${height} ${grid}`
    $('#ffmpegCmd').html(ffmpegCmd);
    $('#nodeCmd').html(nodeCmd);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  let params = new URLSearchParams(window.location.search),
    language = params.get("lang");
  for (let elem of d.querySelectorAll('copy-button')) {
    elem.innerHTML = `<button type="button" class="btn btn-success" data-clipboard-target='${elem.getAttribute('data-target')}'><i class="fad fa-copy"></i></button>`;
  }
  for (let elem of d.querySelectorAll('input-field')) {
    let
      title = ((language == "en") && elem.getAttribute('t-en')) || elem.getAttribute('t-vi') || "",
      placeholder = elem.getAttribute('placeholder') || "",
      id = elem.getAttribute('_id') || "",
      type = elem.getAttribute('type') || "";
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

  if (language == "en") {
    for (let elem of document.querySelectorAll("i-18n")) elem.innerHTML = elem.getAttribute("en");
    // for (let elem of document.querySelectorAll('*[t-en]')) elem.setAttribute("title", elem.getAttribute("ph-en"));
  } else {
    for (let elem of document.querySelectorAll("i-18n")) elem.innerHTML = elem.getAttribute("vi");
    // for (let elem of document.querySelectorAll('*[t-vi]')) elem.setAttribute("title", elem.getAttribute("ph-vi"));
  }
});