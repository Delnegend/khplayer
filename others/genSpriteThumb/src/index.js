// jshint esversion: 8
const d = document;
const genCode = {
  copyToClipboarb(elem) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val()($(elem).html()).select();
    d.execCommand("copy");
    $temp.remove();
  },
  changeResult() {
    let
      tempData = [],
      parentSelect = '.container ',
      filename_ = $(parentSelect + '#filename'),
      filename = filename_.val() || filename_.attr('placeholder'),
      fps_ = $(parentSelect + '#fps'),
      fps = fps_.val() || fps_.attr('placeholder'),
      hour_ = $(parentSelect + '#hour'),
      hour = hour_.val() || hour_.attr('placeholder'),
      minute_ = $(parentSelect + '#minute'),
      minute = minute_.val() || minute_.attr('placeholder'),
      second_ = $(parentSelect + '#second'),
      second = second_.val() || second_.attr('placeholder'),
      width_ = $(parentSelect + '#width'),
      width = width_.val() || width_.attr('placeholder'),
      height_ = $(parentSelect + '#height'),
      height = height_.val() || height_.attr('placeholder'),
      interval_ = $(parentSelect + '#interval'),
      interval = interval_.val() || interval_.attr('placeholder'),
      thumbUrl_ = $(parentSelect + "#thumbUrl"),
      thumbUrl = thumbUrl_.val() || thumbUrl_.attr('placeholder');

    let totalVidDur = hour * 3600 + minute * 60 + second,
      grid = Math.round(Math.sqrt(totalVidDur / interval));

    let ffmpegCmd = `ffmpeg -i ${filename} -filter_complex "select='not(mod(n,${fps*interval}))',scale=${width}:${height},tile=${grid}x${grid}" -frames:v 1 -qscale:v 3 -an ${filename}_mosaic.jpg`;
    let nodeCmd = `node create.js ${totalVidDur} '${thumbUrl}' '${filename}_mosaic.vtt' ${interval} ${width} ${height} ${grid}`
    $('#ffmpegCmd').html(ffmpegCmd);
    $('#nodeCmd').html(nodeCmd);
  }
};
$("#generate").click(() => {
  genCode.copyToClipboard($(".output"));
});

for (let i = 0; i < d.querySelectorAll('copy-button').length; i++) {
  let elem_ = d.querySelectorAll('copy-button')[i],
    elem = $(elem_);
  elem.html(`<button type="button" class="btn btn-success" data-clipboard-target='${elem.attr('data-target')}'><i class="fad fa-copy"></i></button>`);
}
for (let i = 0; i < d.querySelectorAll('input-field').length; i++) {
  let elem = $(d.querySelectorAll('input-field')[i]),
    title = elem.attr('title'),
    placeholder = elem.attr('placeholder'),
    id = elem.attr('_id'),
    type = elem.attr('type');
  if (!title) title = "";
  if (!placeholder) placeholder = "";
  if (!id) id = "";
  if (!type) type = "";
  elem.html(`
  <div class="input-group mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text">${title}</span>
    </div>
    <input oninput="genCode.changeResult()" type="${type}" class="form-control" placeholder="${placeholder}" aria-label="${placeholder}" id="${id}">
  </div>`);
}
genCode.changeResult();

$('copy-button').on('click', function () {
  new ClipboardJS('copy-button .btn');
  let targetElem = $($(this).children('button').attr('data-target'));
});