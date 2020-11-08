//! ================================================
//! KHPLayer
//! Version: 6.3
//! Homepage/repo: https://khplayer.delnegend.xyz --redirect--> https://github.com/DELNEGEND/khplayer
//! License: The MIT License (MIT)
//! ================================================
// jshint esversion: 9
// jshint expr:true

var KHPlayer = {
// Syntax lát nữa dùng ngắn hơn
// Sorter syntax for later use
d: document,
s(e) {
return this.d.querySelector(e);
},
id(e) {
return this.d.getElementById(e);
},
// Source: https://stackoverflow.com/a/1349426
randomString(length = 20) {
let result = '';
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let charactersLength = characters.length;
for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
return "_" + result + btoa(new Date().getTime()).replace(/=/g, "");
},
one() {
this.insertAfter(this.currNode, `<khplayer-container data="${this.currNode.getAttribute("data")}"></khplayer-container>`, true);
this.loadCSS("https://cdn.jsdelivr.net/gh/sampotts/plyr/dist/plyr.css");
this.loadCSS("https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer/dist/khplayer.min.css");
if (typeof Plyr === 'undefined') this.loadJS("https://cdn.jsdelivr.net/gh/sampotts/plyr/dist/plyr.min.js");
if (typeof Hls === 'undefined') this.loadJS("https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js");
if (typeof NoSleep === 'undefined') this.loadJS("https://cdn.jsdelivr.net/gh/richtr/NoSleep.js/dist/NoSleep.min.js");
let initPlayer = setInterval(() => {
let check = typeof Plyr && typeof Hls && typeof NoSleep;
if (check !== "undefined") {
clearInterval(initPlayer);
let uniqueKey = KHPlayer.randomString();
this.currNode.nextElementSibling.setAttribute("id", uniqueKey);
this.init(uniqueKey);
}
}, 100);
},
// Init Plyr
// Khởi tạo Plyr
initPlyr(uniqueKey, previewThumbnails = false) {
// Nếu trong episode cần init có url prevThumbnails thì thêm prevThumb vào customConfig được clone từ config gốc hẵng init, tránh thêm prevThumb vào config gốc.
// If prevThumbnails's url exist in need-to-init episode, add it into customConfig - cloned from the original config to avoid adding into the original one
let customConfig = Object.assign({}, this.configurator);
if (previewThumbnails) {
customConfig.previewThumbnails = {
enabled: true,
src: previewThumbnails.src
};
}
return new Promise(function (resolve) {
resolve(Plyr.setup("#" + uniqueKey + " video", customConfig));
});
},
// Hàm khởi tạo KHPlayer ở đây
// NOTE: ở changeEp(), Plyr được destroy() và init(), những gì -liên quan tới/nằm trong- nó cũng bị phá huỷ theo (embed playlist, các nút toggle, eventListener...). Phần init này chỉ chạy lần đầu tiên để khởi tạo những thứ ngoài tầm với của Plyr, vì vậy nếu có thêm tính năng nào đối với Plyr thì hãy thêm vào phần changeEp

// KHPlayer init() here
// NOTE: in changeEp(), Plyr get destroy() and init() again with new data, anything that -related to/sit inside- Plyr are also destroyed (embed playlist and its toggle btn, next/prev btn, eventListener...), This init() only run once to initiate stuffs outside Plyr's reach, so if you're planning to add any button into Plyr's container or an eventListener, consider using changeEp() or tweaks()
async init(uniqueKey) {
let
khpCtn = this.id(uniqueKey);
// Gán dữ liệu vào KHPLayer để lát chuyển tập dùng lại
// Assign data into KHPlayer for re-using in changeEp()
this.data[uniqueKey] = await this.getJSON(khpCtn.getAttribute("data"));
// Syntax ngắn hơn
// Shorter syntax
PLAYLIST = this.data[uniqueKey];
// Getting poster and playingIndicator
// Lấy url Poster, playingIndicator
let poster = PLAYLIST[PLAYLIST.length - 2] || this.configurator.defaultPoster,
historyPlayingIndicator = PLAYLIST[PLAYLIST.length - 1];
// Create a frame for Plyr to init
// Tạo 1 cái frame cho Plyr bên trong container player
khpCtn.innerHTML = `
<video control playsinline></video>
<ul key="${uniqueKey}" class='KHPPlaylistContainer custom_scrollbar'></ul>`;
// Set poster
khpCtn.querySelector("video").setAttribute("poster", poster);
// Tạo playlist dựa trên dữ liệu JSON
// Create playlist based on JSON data
for (let index = 0; index < PLAYLIST.length - 2; index++) {
let
elem = this.d.createElement("li");
elem.setAttribute("onclick", `KHPlayer.changeEp(this,${index})`);
elem.innerHTML = PLAYLIST[index].title;
khpCtn.querySelector(`.KHPPlaylistContainer`).appendChild(elem);
}

// -- Plyr đc khởi tạo ở chỗ này --
// -- Plyr get init here --
this.plyr[uniqueKey] = await this.initPlyr(uniqueKey);
this.id(uniqueKey) && this.tweaks(uniqueKey);

// -- Phần này detect lịch sử xem --
// #region -- Detect watching history --
let playingData = localStorage.getItem("khplayer_playing_" + historyPlayingIndicator);
if (playingData) {
let playingDataJSON = JSON.parse(playingData),
confirmi18n = this.configurator.i18n.continueWatchingConfirm;
// Source: timestamp --> regular: https://stackoverflow.com/a/25279340
this.insertAfter(
khpCtn.querySelector('.plyr>.plyr__control'),
`<div class="systemDetectHistory">
<div class="text">${confirmi18n.continueWatching} <b>${KHPlayer.data[uniqueKey][playingDataJSON.epIndex].title}</b> ${confirmi18n.at} <b>${new Date(playingDataJSON.time * 1000).toISOString().substr(11, 8)}</b>${confirmi18n.confirm}</div>
<div class="actions">
<div class="confirmBtn">
<div onclick='KHPlayer.acceptContinue("${uniqueKey}", ${playingDataJSON.epIndex}, ${playingDataJSON.time})' class="buttonInner">${confirmi18n.yes}</div>
</div>
<div class="confirmBtn">
<div onclick='KHPlayer.rejectContinue(this)' class="buttonInner">${confirmi18n.no}</div>
</div>
</div>
</div>`,
true
);
khpCtn.querySelector('.plyr>.plyr__controls') && khpCtn.querySelector('.plyr>.plyr__controls').setAttribute('hidden', "");
}
//#endregion

khpCtn.querySelector('.plyr').addEventListener('click', () => {
if (khpCtn.querySelector('.systemDetectHistory').classList.contains('hideAlert') && !this.plyr[uniqueKey][0].source) {
khpCtn.querySelector("ul.KHPPlaylistContainer>li:nth-child(1)").click();
}
});

},
tweaks(uniqueKey) {
let khpCtn = this.id(uniqueKey);

// Thêm vài nút chức năng vào Plyr
// #region adding a few button into Plyr's container 

// Nút ẩn/hiện embed playlist
// Toggle embed playlist btn
// <i class="fas fa-bars fa-lg"></i>

this.insertAfter(
khpCtn.querySelector(".plyr__controls>.plyr__menu"),
`<button class="plyr__controls__item plyr__control customBtn" type="button" onclick="KHPlayer.toggleEmbedPlayllist('${uniqueKey}')">
<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="list-ul" class="svg-inline--fa fa-list-ul fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg>
<span class="plyr__tooltip">${this.configurator.i18n.toggleEmbedPlayllist}</span>
</button>`,
true
);
// Nút next tập
// Next episode btn
// <i class="fas fa-step-forward fa-lg"></i>
this.insertAfter(
khpCtn.querySelector(".plyr__controls > button:nth-child(1)"),
`<button class="plyr__controls__item plyr__control customBtn nextEpBtn" type="button" onclick="KHPlayer.navigateEp(this,'next')">
<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-forward" class="svg-inline--fa fa-step-forward fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"></path></svg>
<span class="plyr__tooltip">${this.configurator.i18n.nextEpisode}</span>
</button>`,
true
);
// Nút previous tập
// Previous episode btn
// <i class="fas fa-step-backward fa-lg"></i>
this.insertBefore(
khpCtn.querySelector(".plyr__controls > button:nth-child(1)"),
`<button class="plyr__controls__item plyr__control customBtn prevEpBtn" type="button" onclick="KHPlayer.navigateEp(this,'prev')">
<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-backward" class="svg-inline--fa fa-step-backward fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"></path></svg>
<span class="plyr__tooltip">${this.configurator.i18n.previousEpisode}</span>
</button>`,
true
);
//#endregion

// #region Embed playlist
/* Source:
https://stackoverflow.com/a/18602389
https://www.w3schools.com/jsref/met_node_clonenode.asp
Cấu trúc Playlist mới trong Player để overlay nút đóng playlist lên trên playlist:
// DOM structure in order to overlay close btn over embed playlist

<div class="embed-playlist"> -> position: absolute -> chiếm trọn ô chứa Plyr | took over Plyr's container
<div> -> position: relative -> để cái nút đóng playlist hiện trên cùng | For overlaying close btn over embed playlist 
<ul></ul> -> position: relative
<div>Nút đóng playlist | Hide embed playlist btn</div> -> position: absolute -> góc trên bên phải | sitting at top right corner of the embed playlist
</div>
</div>

*/
this.insertBefore(
khpCtn.querySelector('.plyr>.plyr__control'),
this.string2Node(`<div class='EmbedKHPPlaylist hidden' key='${uniqueKey}'><div></div></div>`)
);
this.s(`.EmbedKHPPlaylist[key='${uniqueKey}']>div`).appendChild(this.s(`.KHPPlaylistContainer[key='${uniqueKey}']`).cloneNode(true));

// Nút ẩn/hiện embed playlist ở thanh điều khiển của Plyr
// Toggle embed playlist btn in Plyr's control bar
this.s(`.EmbedKHPPlaylist[key='${uniqueKey}']>div`).appendChild(this.string2Node(`<div class="closeEmbed">
<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="window-close" class="svg-inline--fa fa-window-close fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-83.6 290.5c4.8 4.8 4.8 12.6 0 17.4l-40.5 40.5c-4.8 4.8-12.6 4.8-17.4 0L256 313.3l-66.5 67.1c-4.8 4.8-12.6 4.8-17.4 0l-40.5-40.5c-4.8-4.8-4.8-12.6 0-17.4l67.1-66.5-67.1-66.5c-4.8-4.8-4.8-12.6 0-17.4l40.5-40.5c4.8-4.8 12.6-4.8 17.4 0l66.5 67.1 66.5-67.1c4.8-4.8 12.6-4.8 17.4 0l40.5 40.5c4.8 4.8 4.8 12.6 0 17.4L313.3 256l67.1 66.5z"></path></svg></div>`));
this.s(`.EmbedKHPPlaylist[key='${uniqueKey}']>div>.KHPPlaylistContainer`).classList.remove("KHPPlaylistContainer");

// Event đóng embed playlist
// Event close embed playlist
khpCtn.querySelector(" .plyr__video-wrapper").addEventListener("click", () => {
this.toggleEmbedPlayllist(uniqueKey, true);
});
khpCtn.querySelector(".closeEmbed").addEventListener("click", () => {
this.toggleEmbedPlayllist(uniqueKey, true);
});
// #endregion
},
// Function đổi tập. Thay vì loop epindex như trước, gây một vài vấn đề về tương thích, mình tách luôn ra thành function riêng.

async changeEp(elem, epIndex) {
let
// Lấy uniqueKey từ <ul> đã nhồi nhét sẵn
uniqueKey = await elem.parentNode.getAttribute("key"),
// Viết tắt của uniqueKeySelector
khpCtn = this.id(uniqueKey);

// -- Highlight <li> đang phát --
// -- Highlight playing <li> --
for (let ep of khpCtn.querySelector(".KHPPlaylistContainer").querySelectorAll("li")) ep.removeAttribute("playing");
khpCtn.querySelectorAll(".KHPPlaylistContainer li")[epIndex].setAttribute("playing", "");
// #endregion

// -- Dữ liệu episode cần init --
// -- Episode's data need to init --
let currData = this.data[uniqueKey][epIndex];

// Chuyển từ tập này sang tập khác qua API .source của Plyr thì được, nhưng nhảy qua nhảy lại giữa source HLS với Plyr thì không. Cách giải quyết đơn giản nhất là destroy() luôn cái Plyr player đang phát rồi init lại cái mới.
// It's perfectly fine when switching between episodes using Plyr's .source API, but not when HLS get involved. So the quickest/easiest way is to destroy() current Plyr and init a new one.
this.plyr[uniqueKey][0].destroy();
this.plyr[uniqueKey] = await this.initPlyr(uniqueKey, currData.previewThumbnails);
this.tweaks(uniqueKey);

// Check dữ liệu xem dùng Plyr hay HLS để load dữ liệu.
// Check media type to determine using Plyr's API or HLS's one.
let currVideoTag = khpCtn.querySelector("video"),
currMedia = currData.sources[0];
if (currMedia.type.toUpperCase() === "M3U8") {
this.m3u8(currVideoTag, currMedia.src);
// Không như Plyr, HLS chỉ có tác dụng load file m3u8, phụ đề phải thêm thủ công.
// Unlike Plyr, HLS only load m3u8 file, captions must be manually adding.
if (currData.tracks)
for (let track of currData.tracks) this.addSubsForLibsPlayer(currVideoTag, track);
} else {
this.plyr[uniqueKey][0].source = currData;
this.plyr[uniqueKey][0].play();
}

// -- Giới hạn chiều cao của các danh sách chọn phụ đề, độ phân giải, tốc độ --
// #region -- Limit Plyr's menu height inside Plyr's div --
let limitPlyrListHeight = type => {
let
selectPlyr = khpCtn.querySelector('.plyr'),
typeSelect = selectPlyr.querySelector(`button[data-plyr="${type}"]`);
if (typeSelect) {
let typeSelectCtn = typeSelect.parentNode;
let setMaxHeight = () => typeSelectCtn.style.maxHeight = `calc(${parseInt(window.getComputedStyle(selectPlyr).height,10)}px - 105px)`;
setMaxHeight();
window.addEventListener("resize", () => setMaxHeight());
typeSelectCtn.style.overflow = "auto";
typeSelectCtn.classList.add("custom_scrollbar");
}
};
let loopCheckMediaLoaded = setInterval(() => {
if (khpCtn.querySelector(".plyr video").readyState === 4) {
for (let item of ["language", "speed", "quality"]) limitPlyrListHeight(item);
clearInterval(loopCheckMediaLoaded);
}
}, 500);
//#endregion

// -- Tự động next khi hết tập --
// #region -- Autoplay next episode -- 
this.plyr[uniqueKey][0].on('ended', function () {
// nextElementSubling/nextSibling: https://stackoverflow.com/a/24226603
let current_episode = KHPlayer.selectCurrEp(uniqueKey),
next_episode = current_episode.nextElementSibling;
// Source: https://www.w3schools.com/jsref/met_html_click.asp
if (next_episode) next_episode.click();
});
// #endregion

// #region -- Lưu thời gian video đang xem mỗi 1 giây vào localStorage --
// Tạo interval rỗng -> clear đi -> tạo lại cái mới, tránh dẫn đến việc nhiều cái setInterval khác nhau mỗi khi đổi tập.
// Create empty interval -> clear -> create new one to avoid duplicate interval when switching episodes.
let historyPlayingIndicator = this.data[uniqueKey][this.data[uniqueKey].length - 1];
let saveCurrTimeEp = setInterval(function () {}, 1000);
clearInterval(saveCurrTimeEp);
saveCurrTimeEp = setInterval(() => {
if (khpCtn.querySelector(".plyr video").readyState === 4)
localStorage.setItem("khplayer_playing_" + historyPlayingIndicator, JSON.stringify({
epIndex: epIndex,
time: Math.round(KHPlayer.plyr[uniqueKey][0].currentTime)
}));
}, 1000);
//#endregion

let adjustSpeed = () => {
// console.log(this.plyr[uniqueKey][0].speed);
if (event.shiftKey && event.keyCode == "190") this.plyr[uniqueKey][0].speed += 0.5;
if (event.shiftKey && event.keyCode == "188") this.plyr[uniqueKey][0].speed -= 0.5;
};
khpCtn.removeEventListener('keydown', adjustSpeed);
khpCtn.addEventListener('keydown', adjustSpeed);

// Source: https://github.com/richtr/NoSleep.js
// Giữ màn hình điện thoại luôn sáng khi đang phát
let noSleep = new NoSleep();
this.plyr[uniqueKey][0].on('playing', () => {
noSleep.enable();
});
this.plyr[uniqueKey][0].on('paused', () => {
noSleep.disable();
});
},
toggleEmbedPlayllist(uniqueKey, hideOnly = false) {
let elem = this.s(`.EmbedKHPPlaylist[key='${uniqueKey}']`);
if (hideOnly) {
elem.classList.add("hidden");
} else {
if (elem.classList.contains("hidden")) {
elem.classList.remove("hidden");
} else {
elem.classList.add("hidden");
}
}
},
insertAfter(elem, data, string2Elem = false) {
// Source: https://github.com/nefe/You-Dont-Need-jQuery#3.7
if (elem) {
if (!string2Elem) elem.parentNode.insertBefore(data, elem.nextSibling);
if (string2Elem) elem.parentNode.insertBefore(this.string2Node(data), elem.nextSibling);
}
},
insertBefore(elem, data, string2Elem = false) {
if (string2Elem) elem.parentNode.insertBefore(this.string2Node(data), elem);
if (!string2Elem) elem.parentNode.insertBefore(data, elem);
},
selectCurrEp(uniqueKey) {
return this.s(`#${uniqueKey} .KHPPlaylistContainer li[playing]`);
},
navigateEp(elem, nextOrPrev) {
let uniqueKey = elem.parentNode.parentNode.parentNode.getAttribute("id"),
currEp = this.selectCurrEp(uniqueKey);
if (!currEp) this.d.querySelectorAll("#" + uniqueKey + " .KHPPlaylistContainer li")[0].click();
if (currEp) {
let
nextEp = currEp.nextElementSibling,
prevEp = currEp.previousElementSibling;
if (nextOrPrev === "next") {
if (nextEp) nextEp.click();
}
if (nextOrPrev === "prev") {
if (!prevEp) currEp.click();
if (prevEp) prevEp.click();
}
}
},
acceptContinue(uniqueKey, epIndex, time) {
let khpCtn = this.id(uniqueKey);
khpCtn.querySelectorAll(`.KHPPlaylistContainer li`)[epIndex].click();
var tempLoop = setInterval(() => {
if (khpCtn.querySelector(`.plyr video`).readyState === 4) {
KHPlayer.plyr[uniqueKey][0].currentTime = time;
clearInterval(tempLoop);
}
}, 100);
},
rejectContinue(elem) {
elem.parentNode.parentNode.parentNode.classList.add("hideAlert");
elem.parentNode.parentNode.parentNode.parentNode.querySelector('.plyr__controls').removeAttribute('hidden');
},
m3u8(elem, source) {
if (Hls.isSupported()) {
let hls = new Hls();
hls.loadSource(source);
hls.attachMedia(elem);
hls.on(Hls.Events.MANIFEST_PARSED, () => elem.play());
} else {
console.log(new Error('HLS.js is required for playback M3U8 media'));
}
},
// Source: http://youmightnotneedjquery.com/
getJSON(url) {
return new Promise(resolve => {
var request = new XMLHttpRequest();
request.open('GET', url, true);
request.onreadystatechange = function () {
if (this.readyState === 4) {
if (this.status >= 200 && this.status < 400) {
resolve(JSON.parse(this.responseText));
} else {
resolve(void 0);
}
}
};
request.send();
request = null;
});
},
addSubsForLibsPlayer(elem, data) {
elem.appendChild(this.string2Node(`<track kind="subtitles" label="${data.label}" srclang="${data.srclang}" src="${data.src}">`));
},
// Source: https://stackoverflow.com/a/35385518
string2Node(html) {
var template = this.d.createElement('template');
html = html.trim(); // Never return a text node of whitespace as the result
template.innerHTML = html;
return template.content.firstChild;
},
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript
loadCSS(url) {
let link = document.createElement("link");
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = url;
document.head.appendChild(link);
},
loadJS(url, callback) {
// loadScript(url, callback) {
// return new Promise(resolve => {
let script = document.createElement('script');
script.type = 'text/javascript';
script.src = url;

// There are several events for cross browser compatibility.
script.onreadystatechange = callback;
script.onload = callback;

// Fire the loading
document.head.appendChild(script);
// });

// }
},
currNode: document.currentScript,
customConfigPath: document.currentScript.getAttribute("config"),
configurator: {
defaultQuality: 1080,
seekTime: 5,
invertTime: false,
captions: {
active: true,
language: 'auto',
update: true
},
tooltips: {
controls: true,
seek: true
},
defaultPoster: "https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer/dist/default_wating.svg",
blankVideo: "https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer/dist/blank.mp4",
},
// All videos' jsons' data
data: {},
// for Plyr to interact
plyr: {}
};
document.addEventListener("DOMContentLoaded", async () => {
let configURL = KHPlayer.customConfigPath,
customConfigData = {},
lang = {},
lang_vi = {
i18n: {
restart: 'Khởi động lại',
rewind: 'Tua trước {seektime}s',
play: 'Phát',
pause: 'Tạm dừng',
fastForward: 'Tua tới {seektime}s',
seek: 'Tua',
seekLabel: '{currentTime} của {duration}',
played: 'Đã phát',
buffered: 'Đã tải trước',
currentTime: 'Thời gian bây giờ',
duration: 'Thời lượng',
volume: 'Âm lượng',
mute: 'Tắt tiếng',
unmute: 'Bật tiếng',
enableCaptions: 'Bật phụ đề',
disableCaptions: 'Tắt phụ đề',
download: 'Tải xuống',
enterFullscreen: 'Toàn màn hình',
exitFullscreen: 'Thoát toàn màn hình',
frameTitle: 'Trình phát cho {title}',
captions: 'Phụ đề',
settings: 'Cài đặt',
pip: 'PIP',
menuBack: 'Quay lại',
speed: 'Tốc độ',
normal: 'Bình thường',
quality: 'Chất lượng',
loop: 'Lặp',
start: 'Bắt đầu',
end: 'Kết thúc',
all: 'Tất cả',
reset: 'Khởi động lại',
disabled: 'Tắt',
enabled: 'Bật',
advertisement: 'Quảng cáo',
qualityBadge: {
2160: '4K',
1440: 'HD',
1080: 'HD',
720: 'HD',
576: 'SD',
480: 'SD',
},
nextEpisode: 'Tập tiếp theo',
previousEpisode: 'Tập trước',
toggleEmbedPlayllist: 'Danh sách tập',
continueWatchingConfirm: {
yes: 'Tiếp tục',
no: 'Xem từ đầu',
continueWatching: 'Đang xem',
at: 'tại',
confirm: ''
}
},
},
lang_en = {
i18n: {
nextEpisode: 'Next episode',
previousEpisode: 'Previous episode',
toggleEmbedPlayllist: 'Episode list',
continueWatchingConfirm: {
yes: 'Continue',
no: 'Watch from begin',
continueWatching: 'You were watching',
at: 'at',
confirm: ''
}
}
};

if (configURL) customConfigData = await KHPlayer.getJSON(configURL) || {};

if (KHPlayer.currNode.getAttribute('vi') !== null) {
lang = lang_vi;
} else {
lang = lang_en;
}

KHPlayer.configurator = {
...KHPlayer.configurator,
...lang,
...customConfigData
};

if (KHPlayer.currNode.getAttribute('data')) {
KHPlayer.one();
} else {
for await (let elem of document.querySelectorAll('khplayer-container')) {
// Assign uniqueKey to avoid conflic between multiple khplayer-container when changeEp() or cloning playlist into embed playlist
// Gán uniqueKey để tránh xung đột với các khplayer-container khác khi chuyển tập hay clone playlist lên embed playlist
let uniqueKey = KHPlayer.randomString();
elem.setAttribute("id", uniqueKey);
KHPlayer.init(uniqueKey);
}
}
});
//# sourceMappingURL=khplayer.js.map
