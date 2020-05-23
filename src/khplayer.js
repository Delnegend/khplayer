/*
NOTE: concept là thế này:

Đầu tiên client add 3 script: jQuery > Plyr.js > KHPlayer.js. Ở cái KHPjs kèm theo 1 attribute jsonPath, value là 1 array (tất nhiên là kiểu string, sau khi đem vào đây thì JSON.parse ra), đồng thời phải nhét thêm defer vào nữa

Array chứa đường dẫn tới file JSON chứa dữ liệu của 1 tập hợp các video như: URL, phụ đề, tiêu đề, độ phân giải, poster, abcxyz... Mình gọi array trong file JSON này là Array mẹ (để dễ ghi note ở dưới)

Element cuối của Array mẹ là một uniqueKey, client cần đặt thẻ div có ID này ở nơi họ muốn generate player.

Chạy hàm addingCSSandStuffs để add CSS của KHPlayer và của Plyr, đồng thời check version và console.log version.
*/
// jshint esversion: 10 
const KHPlayer = {

  // Khởi tạo Plyr
  initPlyr: function (selector) {
    return new Promise(function (resolve) {
      resolve(Plyr.setup(selector, {
        seekTime: 5,
        quality: {
          default: 1080
        },
        captions: {
          active: true,
          language: 'auto',
          update: true
        },
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
        },
        // debug: true
      }));
    });
  },

  // Khởi tạo KHPlayer ở đây
  // NOTE: chính bởi vì ở func đổi tập, mình lựa chọn cách destroy cái cũ đi và init lại cái mới, những eventListener đối với cái KHPforPlyrToInteract cũng sẽ bị destroy theo. Vì vậy hãy add listener vào trong func đổi tập (ví dụ như cái auto next tập kia chẳng hạn)
  init: async function (url) {

    /* NOTE: Mỗi playlist (Array mẹ), mỗi Container (cái mà client paste vào HTML), mỗi object để Plyr tương tác đều được gán thêm uniqueKey để có thể có nhiều player mà không bị conflict lẫn nhau */

    let
      d = document,
      PLAYLIST_ = await KHPlayer.getJSON(url),
      uniqueKey = await PLAYLIST_[PLAYLIST_.length - 1],
      uKs = "#" + uniqueKey;
    KHPlayer["KHPPlaylist" + uniqueKey] = PLAYLIST_;
    PLAYLIST = KHPlayer["KHPPlaylist" + uniqueKey];

    let
      // elem sát cuối là url poster tổng
      poster = await PLAYLIST[PLAYLIST.length - 2];
    // Cái này vì mình dùng jQuery nên gắn # vào cho nhanh

    // Tạo 1 cái frame bên trong container player
    d.querySelector("#" + uniqueKey).innerHTML = `
        <video control playsinline></video>
        <ul key="${uniqueKey}" class='KHPPlaylistContainer'></ul>`;
    // Set poster
    d.querySelector(uKs + " video").setAttribute("poster", poster);

    // Khởi tạo playlist
    // Cái này để check playlist có trống hay không, mà hình như có vẻ thừa thãi :)))
    if (PLAYLIST.length > 0) {
      // Để index bắt đầu từ 0
      let index = 0;
      // Biến Array mẹ thành GUI, một list chứa các episode
      while (index <= PLAYLIST.length - 3) {
        let
          // Tạo id cho từ mục một
          currentID = +index,
          // Gọi data của từng elem trong array "tổng" xuống
          currentVid = PLAYLIST[index],
          // Giờ mới create elem
          list_ep = d.createElement("li");
        list_ep.setAttribute("index", currentID);
        // Append mục chọn tập vào container
        d.querySelector(`#${uniqueKey} .KHPPlaylistContainer`).appendChild(list_ep); //jshint ignore:line
        // Gọi mục chọn tập lên
        let currentLine = d.getElementById(uniqueKey).querySelector("li[index='" + currentID + "'");
        // Gán cho nó cái nội dung (gọi title từ currentVid lên array tổng xuống)
        currentLine.innerHTML = currentVid.title;
        // function đổi tập
        currentLine.setAttribute("onclick", `KHPlayer.changeEp(this)`);
        // Tăng index ở phía trên lên 1, tiếp tục cho mục chọn tiếp theo
        index++;
      }
    }
    // NOTE: Plyr đc khởi tạo ở chỗ này
    KHPlayer.plyr[uniqueKey] = await KHPlayer.initPlyr(uKs + " video");

    // Cái này chỉ được chạy đúng lần, cho đến khi
    KHPlayer.plyr[uniqueKey][0].on("play", function () {
      KHPlayer._insertBefore(
        uKs + ' .plyr__video-wrapper video',
        KHPlayer.htmlToElement("<div>a</div>")
      );
    });
    KHPlayer.tweaks(uniqueKey);

  },

  // Khởi chạy mỗi Plyr được khởi tạo lại, hay mỗi lần đổi tập bởi cái destroy() rồi init lại trong cáo changeEp, lý do vì sao cũng đã giải thích ở dới đó
  tweaks: function (uniqueKey) {
    let d = document,
      // uniqueKeySelector
      uKs = "#" + uniqueKey;

    // NOTE: Đã chuyển sang sử dụng KHPlayer.insertAfter
    // // Nút biểu tượng cài đặt (menu) trên thanh control của player
    // let plyrMenuBtn = d.querySelector(uKs + " .plyr__controls>.plyr__menu");
    // // Chọn nút menu > chỉ đến parent của nó > thêm nút toggle danh sách tập vào trong parent nhưng đằng trước phần tử đứng sau cái menu, tức thêm vào trước menu
    // // Source: https://github.com/nefe/You-Dont-Need-jQuery#3.7
    // plyrMenuBtn.parentNode.insertBefore(
    //   KHPlayer.htmlToElement(
    //     `<button class="plyr__controls__item plyr__control togglePlaylist" type="button" onclick="KHPlayer.togglePlaylist('${uniqueKey}')"><i class="fas fa-bars"></i></button>`),
    //   plyrMenuBtn.nextSibling
    // ); 

    // Nút ẩn/hiện embed playlistCtn
    // <i class="fas fa-bars fa-lg"></i>
    KHPlayer.insertAfter(
      uKs + " .plyr__controls>.plyr__menu",
      `<button class="plyr__controls__item plyr__control customBtn" type="button" onclick="KHPlayer.togglePlaylist('${uniqueKey}')">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="list-ul" class="svg-inline--fa fa-list-ul fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg></button>`,
      true
    );
    // Nút next tập
    // <i class="fas fa-step-forward fa-lg"></i>
    KHPlayer.insertAfter(
      uKs + " .plyr__controls > button:nth-child(1)",
      `<button class="plyr__controls__item plyr__control customBtn" type="button" onclick="KHPlayer.navigateEp(this,'next')">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-forward" class="svg-inline--fa fa-step-forward fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"></path></svg></button>`,
      true
    );
    // Nút previous tập
    // <i class="fas fa-step-backward fa-lg"></i>
    KHPlayer._insertBefore(
      uKs + " .plyr__controls > button:nth-child(1)",
      `<button class="plyr__controls__item plyr__control customBtn" type="button" onclick="KHPlayer.navigateEp(this,'prev')">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-backward" class="svg-inline--fa fa-step-backward fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"></path></svg>
      </button>`,
      true
    );
    /*Thêm KHPPlaylistContainer vào trong container chứa <video> (để overlay)
      Source:
        https://stackoverflow.com/questions/16234740/overlay-on-html5-fullscreen-video
        https://www.w3schools.com/jsref/met_node_clonenode.asp
    */
    KHPlayer._insertBefore(
      uKs + ' .plyr__video-wrapper video',
      d.querySelector(`.KHPPlaylistContainer[key='${uniqueKey}']`).cloneNode(true)
    );
    d.querySelector(uKs + " .plyr__video-wrapper .KHPPlaylistContainer").setAttribute("class", "EmbedKHPPlaylist hideEmbedKHPPlaylist");

    // Source: https://www.w3schools.com/jsref/prop_win_localstorage.asp
    KHPlayer.plyr[uniqueKey][0].on("enterfullscreen", event => {
      localStorage.setItem("FullScreen" + uniqueKey, "enterFull");
    });
    KHPlayer.plyr[uniqueKey][0].on("exitfullscreen", event => {
      localStorage.setItem("FullScreen" + uniqueKey, "exitFull");
    });
  },

  // Function đổi tập. Thay vì loop epindex như trước, gây một vài vấn đề về tương thích, mình gán luôn function vào mỗi <li> trong DOM, kèm theo this
  changeEp: async function (elem) {
    // Lấy index của tập từ attribute "index" luôn
    let index = parseInt(elem.getAttribute('index'), 10),
      // Lấy uniqueKey từ <ul> đã nhồi nhét sẵn
      uniqueKey = await elem.parentNode.getAttribute("key"),
      // Viết tắt của uniqueKeySelector
      uKs = "#" + uniqueKey,
      currPlyr = 'KHPforPlyrToInteract' + uniqueKey;

    // Thường thì chỉ cần .source thôi là đủ (để chuyển tập), nhưng khi sử dụng nguồn m3u8, phải sử dụng API của HLS, source HLS mới chồng chéo lên source Plyr cũ. Cách giải quyết là destroy luôn cái cũ đi rồi init cái mới
    KHPlayer.plyr[uniqueKey][0].destroy();
    KHPlayer.plyr[uniqueKey][0] = await KHPlayer.initPlyr(uKs + " video");

    // Chọn toàn bộ các <li> trong <ul> danh sách tập
    select_all = document.querySelector(uKs + " .KHPPlaylistContainer").querySelectorAll("li");
    let currLi = document.querySelector(`${uKs} .KHPPlaylistContainer li[index='${index}']`);
    // Xoá style (làm nổi bật <li> hiện đang phát) và indicator cái trước
    select_all.forEach(function (e) {
      e.removeAttribute("playing");
      e.removeAttribute("style");
    });
    // Sau đó add lại cho cái cái vừa click
    currLi.style.color = "yellow";
    currLi.setAttribute("playing", "true");

    let currData = KHPlayer["KHPPlaylist" + uniqueKey][index],
      currVideoTag = document.querySelector(uKs + " video"),
      currMediaType = currData.sources[0].type;

    // Handle phần source đưa vào player. Nếu là M3U8 thì sử dụng HLS để thêm source, đồng thời thêm captions (nếu có)
    if (currMediaType === "M3U8") {
      KHPlayer.m3u8(currVideoTag, currData.sources[0].src);
      if (currData.tracks != void 0) {
        KHPlayer.addSubsForLibsPlayer(uKs + " video", currData.tracks[0]);
      }
      // Còn không thì dùng luôn API của Plyr, khỏi cần thêm cái addCaptions như trên
    } else {
      KHPlayer.plyr[uniqueKey][0].source = currData;
     KHPlayer.plyr[uniqueKey][0].play();
    }

    // Tự động next khi hết tập
    // Đầu tiên đặt cái on("ended") (theo API của Plyr)
   KHPlayer.plyr[uniqueKey][0].on('ended', function () {
      // Lấy tập đang phát dựa vào cái indicator đã thêm ở trên > select tập tiếp theo > nếu tồn tại (!= void 0) thì click vào đó.
      // Về vụ nextElementSubling hay nextSibling: https://stackoverflow.com/questions/24226571/what-is-the-difference-between-node-nextsibling-and-childnode-nextelementsibling
      let current_episode = document.querySelectorAll("#" + uniqueKey + " li[playing='true']")[1],
        next_episode = current_episode.nextElementSibling;
      if (next_episode != void 0) {
        // Source: https://www.w3schools.com/jsref/met_html_click.asp
        next_episode.click();
      }
    });

    if (localStorage.getItem("FullScreen" + uniqueKey) === "enterFull") {
      console.log("changeOnFull");
      setTimeout(() => {
       KHPlayer.plyr[uniqueKey][0].fullscreen.enter();
      }, 5);
    }

    KHPlayer.tweaks(uniqueKey);
  },
  insertAfter: function (place, data, convertDataToElem = false) {
    // Source: https://github.com/nefe/You-Dont-Need-jQuery#3.7
    let elem = document.querySelector(place);
    if (convertDataToElem === false) {
      elem.parentNode.insertBefore(data, elem.nextSibling);
    } else if (convertDataToElem === true) {
      elem.parentNode.insertBefore(KHPlayer.htmlToElement(data), elem.nextSibling);
    }
  },
  // Tránh confict với insertBefore của javascript
  _insertBefore: function (place, data, convertDataToElem = false) {
    let elem = document.querySelector(place);
    if (convertDataToElem === false) {
      elem.parentNode.insertBefore(data, elem);
    } else if (convertDataToElem === true) {
      elem.parentNode.insertBefore(KHPlayer.htmlToElement(data), elem);
    }
  },
  togglePlaylist: function (uniqueKey) {
    /* Source:
      https://www.w3schools.com/howto/howto_js_toggle_class.asp
      https://stackoverflow.com/questions/16176648/trying-to-do-a-css-transition-on-a-class-change
    */
    document.querySelector("#" + uniqueKey + " .EmbedKHPPlaylist").classList.toggle("hideEmbedKHPPlaylist");
  },
  selectCurrEp: function (uniqueKey) {
    return document.querySelector(`#${uniqueKey} .KHPPlaylistContainer li[playing='true']`);
  },
  navigateEp: function (elem, nextOrPrev) {
    let uniqueKey = elem.parentNode.parentNode.parentNode.getAttribute("id"),
      currEp = KHPlayer.selectCurrEp(uniqueKey);
    if (currEp === null) document.querySelector("#" + uniqueKey + " .KHPPlaylistContainer li[index='0']").click();
    if (currEp !== null) {
      let
        nextEp = currEp.nextElementSibling,
        prevEp = currEp.previousElementSibling;
      if (nextOrPrev === "next") {
        if (nextEp !== null) nextEp.click();
      }
      if (nextOrPrev === "prev") {
        prevEp === null ? currEp.click() : prevEp.click(); //jshint ignore:line
      }
    }
  },
  // prevEp: function () {
  //   let uniqueKey = elem.parentNode.parentNode.parentNode.getAttribute("id");
  // },
  // Source: http://youmightnotneedjquery.com/
  m3u8: function (elem, source) {
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(elem);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        elem.play();
      });
    }
  },
  getJSON: function (url) {
    return new Promise(function (resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status >= 200 && this.status < 400) {
            var data = JSON.parse(this.responseText);
            resolve(data);
          } else {
            reject(new Error("Double check JSON path/url"));
          }
        }
      };
      request.send();
      request = null;
    });
  },
  addSubsForLibsPlayer: function (elem, data) {
    let tempSub = `<track kind="subtitles" label="${data.label}" srclang="${data.srclang}" src="${data.src}">`;
    document.querySelector(elem).appendChild(KHPlayer.htmlToElement(tempSub));
  },
  // Source: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
  htmlToElement: function (html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },
  // loadCSSfromURL: function () {
  //   // Source: https://developer.mozilla.org/vi/docs/Web/JavaScript/Reference/Functions/arguments
  //   for (let i = 0; i < arguments.length; i++) {
  //     document.getElementsByTagName("head")[0].appendChild(KHPlayer.htmlToElement(`<link rel="stylesheet" href="${arguments[i]}">`))
  //   }
  // },
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/Document/currentScript
  jsonPaths: JSON.parse(document.currentScript.getAttribute("jsonPath")),
  // Chứa dữ liệu từ file json mà người dùng load
  data: {},
  // Các <video> đẻ plyr tương tác
  plyr: {}
};
// if (JSON.parse(document.currentScript.getAttribute("fa") != "false")) {
//   KHPlayer.loadCSSfromURL("https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.13.0/css/all.min.css");
// }
// KHPlayer.loadCSSfromURL(
//   "https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.css",
//   // "https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@4.0/dist/khplayer.min.css"
// );
KHPlayer.jsonPaths.forEach(function (e) {
  KHPlayer.init(e);
});
// confirm('hello');