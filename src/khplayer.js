/*
NOTE: concept:

Đầu tiên client add Plyr.js và khplayer.js. Ở tag của khplayer.js kèm theo 1 attribute jsonPath, value là 1 array (tất nhiên là kiểu string, sau khi đem vào đây thì JSON.parse ra), đồng thời phải nhét thêm defer vào nếu đặt trước cặp thẻ <div> container của từng playlist player

Array chứa đường dẫn tới file JSON chứa dữ liệu của 1 tập hợp các video như: URL, phụ đề, tiêu đề, độ phân giải, poster, abcxyz... Mình gọi array trong file JSON này là Array mẹ (để dễ ghi chú ở dưới)

Element cuối của Array mẹ là một uniqueKey, đồng thời là ID của thẻ container nói ở ý đầu tiên. Ngay trước element này là URL dẫn tới poster chính của player
*/
// jshint esversion: 9

const KHPlayer = {
  // Khởi tạo Plyr
  initPlyr(uniqueKey, previewThumbnails = false) {
    // Phải nói ở chỗ này mình khôn vl ra. Clone config vào customConfig từ KHPlayer, check trong dữ liệu của tập được init trong JSON có previewThumbnails hay không thì edit customConfig để enable lên, đồng thời thêm source vào.
    let customConfig = Object.assign({}, KHPlayer.configurator);
    if (previewThumbnails) customConfig.previewThumbnails = {
      enabled: true,
      src: previewThumbnails.src
    };
    return new Promise(function (resolve) {
      resolve(Plyr.setup("#" + uniqueKey + " video", customConfig));
    });
  },

  // Khởi tạo KHPlayer ở đây
  // NOTE: chính bởi vì ở func đổi tập, mình lựa chọn cách destroy cái cũ đi và init lại cái mới, những eventListener đối với player cũ (để Plyr tương tác) cũng sẽ bị destroy theo. Vì vậy hãy add listener vào trong func đổi tập (ví dụ như cái auto next tập chẳng hạn)
  async init(url) {

    /* NOTE: Mỗi playlist (Array mẹ), mỗi Container (cái mà client paste vào HTML), mỗi cái player (thực chất là 1 object) để Plyr tương tác đều được gán uniqueKey (là key, ID) để có thể có nhiều player mà không bị conflict lẫn nhau */
    let
      d = document,
      // Lấy tạm dữ liệu về PLAYLIST_
      PLAYLIST_ = await KHPlayer.getJSON(url),
      // Lấy uniqueKey từ PLAYLIST_
      uniqueKey = await PLAYLIST_[PLAYLIST_.length - 1],
      UKS = "#" + uniqueKey;
    // Gán data đã lấy từ trước trong PLAYLIST_ vào KHPLayer.data[uniqueKey]
    KHPlayer.data[uniqueKey] = PLAYLIST_;
    // Gọi dữ liệu vào đây để syntax ngắn hơn
    PLAYLIST = KHPlayer.data[uniqueKey];

    let
      // elem sát cuối là url poster tổng
      poster = await PLAYLIST[PLAYLIST.length - 2];
    // Cái này vì mình dùng jQuery nên gắn # vào cho nhanh

    // Tạo 1 cái frame bên trong container player
    d.querySelector(UKS).innerHTML = `
        <video control playsinline></video>
        <ul key="${uniqueKey}" class='KHPPlaylistContainer'></ul>`;
    // Set poster
    d.querySelector(UKS + " video").setAttribute("poster", poster);

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

    let playingData = localStorage.getItem("playing_" + uniqueKey);


    // NOTE: Plyr đc khởi tạo ở chỗ này
    KHPlayer.plyr[uniqueKey] = await KHPlayer.initPlyr(uniqueKey);

    // Cái này chỉ được chạy đúng lần cho đến khi người dùng chọn tập
    // KHPlayer.plyr[uniqueKey][0].on("play", function () {

    // });
    KHPlayer.tweaks(uniqueKey);

    if (playingData != null) {
      let playingDataJSON = JSON.parse(playingData),
        confirmi18n = KHPlayer.configurator.i18n.continueWatchingConfirm;
      // Source: https://stackoverflow.com/a/25279340
      KHPlayer.insertAfter(
        UKS + ' .plyr>.plyr__control',
        `<div class="systemDetectHistory">
          <div class="text">${confirmi18n._1} ${KHPlayer.data[uniqueKey][playingDataJSON.epIndex].title} ${confirmi18n._2} ${new Date(playingDataJSON.time * 1000).toISOString().substr(11, 8)}<br>${confirmi18n._3}</div>
          <div class="actions">
            <div class="confirmBtn">
              <div onclick='KHPlayer.acceptContinue("${uniqueKey}", ${playingDataJSON.epIndex}, ${playingDataJSON.time})' class="buttonInner">${confirmi18n.yes}</div>
            </div>
            <div class="confirmBtn">
              <div onclick='document.querySelector("#${uniqueKey} .systemDetectHistory").classList.add("hideAlert")' class="buttonInner">${confirmi18n.no}</div>
            </div>
          </div>
        </div>`,
        true
      );
    }
  },

  // Khởi chạy mỗi Plyr được khởi tạo lại, hay mỗi lần đổi tập bởi cái destroy() rồi init lại trong cáo changeEp, lý do vì sao cũng đã giải thích ở dới đó
  tweaks(uniqueKey) {
    let
      // Lát nữa gọi document cho dễ
      d = document,
      UKS = "#" + uniqueKey;

    //#region Thêm vài nút chức năng vào player
    // Nút ẩn/hiện embed playlistCtn
    // <i class="fas fa-bars fa-lg"></i>
    KHPlayer.insertAfter(
      UKS + " .plyr__controls>.plyr__menu",
      `<button class="plyr__controls__item plyr__control customBtn" type="button" onclick="KHPlayer.toggleEmbedPlayllist('${uniqueKey}')">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="list-ul" class="svg-inline--fa fa-list-ul fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"></path></svg>
      <span class="plyr__tooltip">${KHPlayer.configurator.i18n.toggleEmbedPlayllist}</span>
      </button>`,
      true
    );
    // Nút next tập
    // next/prevEpBtn để responsive, hide đi khi width <= 500px
    // <i class="fas fa-step-forward fa-lg"></i>
    KHPlayer.insertAfter(
      UKS + " .plyr__controls > button:nth-child(1)",
      `<button class="plyr__controls__item plyr__control customBtn nextEpBtn" type="button" onclick="KHPlayer.navigateEp(this,'next')">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-forward" class="svg-inline--fa fa-step-forward fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"></path></svg>
      <span class="plyr__tooltip">${KHPlayer.configurator.i18n.nextEpisode}</span>
      </button>`,
      true
    );
    // Nút previous tập
    // <i class="fas fa-step-backward fa-lg"></i>
    KHPlayer._insertBefore(
      UKS + " .plyr__controls > button:nth-child(1)",
      `<button class="plyr__controls__item plyr__control customBtn prevEpBtn" type="button" onclick="KHPlayer.navigateEp(this,'prev')">
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="step-backward" class="svg-inline--fa fa-step-backward fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"></path></svg>
      <span class="plyr__tooltip">${KHPlayer.configurator.i18n.previousEpisode}</span>
      </button>`,
      true
    );
    //#endregion

    //#region Thêm Playlist vào player
    /* Source:
      https://stackoverflow.com/a/18602389
      https://www.w3schools.com/jsref/met_node_clonenode.asp
    Cấu trúc Playlist mới trong Player để overlay nút đóng playlist lên trên playlist:

    <div class="embed-playlist"> -> position: absolute
      <div> -> position: relative
        <ul></ul> -> position: relative
        <div>Nút đóng playlist</div> -> position: absolute
      </div>
    </div>  
    */
    KHPlayer._insertBefore(
      UKS + ' .plyr>.plyr__control',
      KHPlayer.htmlToElement(`<div class='EmbedKHPPlaylist hidden' key='${uniqueKey}' style='visibility: hidden'><div></div></div>`)
    );
    d.querySelector(`.EmbedKHPPlaylist[key='${uniqueKey}']>div`).appendChild(d.querySelector(`.KHPPlaylistContainer[key='${uniqueKey}']`).cloneNode(true));

    // Nút ẩn Playlist
    d.querySelector(`.EmbedKHPPlaylist[key='${uniqueKey}']>div`).appendChild(KHPlayer.htmlToElement(`<div class="closeEmbed">
    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="window-close" class="svg-inline--fa fa-window-close fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-83.6 290.5c4.8 4.8 4.8 12.6 0 17.4l-40.5 40.5c-4.8 4.8-12.6 4.8-17.4 0L256 313.3l-66.5 67.1c-4.8 4.8-12.6 4.8-17.4 0l-40.5-40.5c-4.8-4.8-4.8-12.6 0-17.4l67.1-66.5-67.1-66.5c-4.8-4.8-4.8-12.6 0-17.4l40.5-40.5c4.8-4.8 12.6-4.8 17.4 0l66.5 67.1 66.5-67.1c4.8-4.8 12.6-4.8 17.4 0l40.5 40.5c4.8 4.8 4.8 12.6 0 17.4L313.3 256l67.1 66.5z"></path></svg></div>`));
    d.querySelector(`.EmbedKHPPlaylist[key='${uniqueKey}']>div>.KHPPlaylistContainer`).removeAttribute("class");
    //#endregion

    //#region Gán trạng thái player vào localStorage (đang fullscreen hay bình thường) để khi chuyển sang tập khác sẽ auto fullscreen lại hay không
    // Source: https://www.w3schools.com/jsref/prop_win_localstorage.asp
    KHPlayer.plyr[uniqueKey][0].on("enterfullscreen", event => {
      localStorage.setItem("IsFullScreen_" + uniqueKey, "yes");
    });
    KHPlayer.plyr[uniqueKey][0].on("exitfullscreen", event => {
      localStorage.removeItem("IsFullScreen_" + uniqueKey);
    });
    d.querySelector(UKS + " .plyr__video-wrapper").addEventListener("click", () => {
      this.toggleEmbedPlayllist(uniqueKey, true);
    });
    d.querySelector(UKS + " .closeEmbed").addEventListener("click", () => {
      this.toggleEmbedPlayllist(uniqueKey, true);
    });
  },
  toggleEmbedPlayllist(uniqueKey, hideOnly) {
    let d = document,
      elem = d.querySelector(`.EmbedKHPPlaylist[key='${uniqueKey}']`),
      showPL = function () {
        elem.classList.remove("hidden");
        elem.style.visibility = "visible";
      },
      hidePL = function () {
        elem.classList.add("hidden");
        elem.addEventListener("transitionend", () => {
          elem.style.visibility = "hidden";
        }, { once: true });
      };
    if (hideOnly) {
      hidePL();
    } else {
      if (elem.classList.contains("hidden")) {
        showPL();
      } else {
        hidePL();
      }
    }
  },
  // Function đổi tập. Thay vì loop epindex như trước, gây một vài vấn đề về tương thích, mình gán luôn function vào mỗi <li> trong DOM, kèm theo this
  async changeEp(elem) {
    // Lấy index của tập từ attribute "index" luôn

    let d = document,
      index = parseInt(elem.getAttribute('index'), 10),
      // Lấy uniqueKey từ <ul> đã nhồi nhét sẵn
      uniqueKey = await elem.parentNode.getAttribute("key"),
      // Viết tắt của uniqueKeySelector
      UKS = "#" + uniqueKey;

    // Làm <li> của tập đang được phát nổi bật lên
    // Chọn toàn bộ các <li> trong <ul> danh sách tập
    select_all = d.querySelector(UKS + " .KHPPlaylistContainer").querySelectorAll("li");
    let currLi = d.querySelector(`${UKS} .KHPPlaylistContainer li[index='${index}']`);
    // Xoá style (làm nổi bật <li> hiện đang phát) và indicator cái trước
    select_all.forEach(function (e) {
      e.removeAttribute("playing");
      e.removeAttribute("style");
    });
    // Sau đó add lại cho cái cái vừa click
    currLi.style.color = "yellow";
    currLi.setAttribute("playing", "true");

    // Dữ liệu episode cần init
    let currData = KHPlayer.data[uniqueKey][index];

    // Thường thì chỉ cần .source thôi là đủ (để chuyển tập), nhưng khi sử dụng nguồn m3u8, phải sử dụng API của HLS, source HLS mới chồng chéo lên source Plyr cũ. Cách giải quyết là destroy luôn cái cũ đi rồi init cái mới
    KHPlayer.plyr[uniqueKey][0].destroy();
    KHPlayer.plyr[uniqueKey] = await KHPlayer.initPlyr(uniqueKey, currData.previewThumbnails);

    let currVideoTag = d.querySelector(UKS + " video"),
      currMediaType = currData.sources[0].type;

    // Handle phần source đưa vào player. Nếu là M3U8 thì sử dụng HLS để thêm source, đồng thời thêm captions (nếu có)
    if (currMediaType.toUpperCase() === "M3U8") {
      KHPlayer.m3u8(currVideoTag, currData.sources[0].src);
      if (currData.tracks != void 0) {
        KHPlayer.addSubsForLibsPlayer(UKS + " video", currData.tracks[0]);
      }
      // Còn không thì dùng luôn API của Plyr, khỏi cần thêm cái addCaptions như trên
    } else {
      KHPlayer.plyr[uniqueKey][0].source = await currData;
      await KHPlayer.plyr[uniqueKey][0].play();
    }

    // Tự động next khi hết tập
    // Đầu tiên đặt cái on("ended") (theo API của Plyr)
    KHPlayer.plyr[uniqueKey][0].on('ended', function () {
      // Lấy tập đang phát dựa vào cái indicator đã thêm ở trên > select tập tiếp theo > nếu tồn tại (!= void 0) thì click vào đó.
      // Về vụ nextElementSubling hay nextSibling: https://stackoverflow.com/a/24226603
      let current_episode = KHPlayer.selectCurrEp(uniqueKey),
        next_episode = current_episode.nextElementSibling;
      if (next_episode != void 0) {
        // Source: https://www.w3schools.com/jsref/met_html_click.asp
        next_episode.click();
      }
    });

    if (localStorage.getItem("IsFullScreen_" + uniqueKey) === "yes") {
      let loopCheckMediaLoaded = setInterval(() => {
        // Giải thích sơ sơ nó là như thế này: hàm newValue khi được nhận dữ liệu nó sẽ chạy hàm set, ví dụ như ở dưới. Còn khi được request dữ liệu thì nó chạy hàm get, ví dụ console.log(watchVar.newValue). Cho nên trong trường hợp dưới đây, phần get newValue hoàn toàn thừa thãi bởi mình chỉ tận dụng cái tính năng set của nó để "trông" cái <video> trên DOM khi nào load xong media thì fullscreen. Có thể trong tương lai mình lại tận dụng được hàm get nên cứ để đấy, đồng thời cho cái jshint đỡ phải gào mồm lên đòi có hàm get :))
        // Source: https://viblo.asia/p/getter-va-setter-trong-javascript-3P0lPOX4Zox
        let watchVar = {
          state: void 0,
          get newValue() {
            return this.state;
          },
          set newValue(newValue) {
            this.state = newValue;
            if (this.state === 4) {
              KHPlayer.togglePlayerFullScreen(uniqueKey);
              clearInterval(loopCheckMediaLoaded);
            }
          }
        };
        watchVar.newValue = d.querySelector(UKS + " .plyr video").readyState;
      }, 100);
    }
    // Lưu thời gian video đang xem mỗi 1 giây vào localStorage
    // Đầu tiên tạo interval rỗng -> clear đi -> tạo lại cái mới, tránh dẫn đến việc nhiều cái setInterval khác nhau
    let saveCurrTimeEp = setInterval(function () { }, 1000);
    clearInterval(saveCurrTimeEp);
    saveCurrTimeEp = setInterval(() => {
      let watchVideoState = {
        state: void 0,
        get newValue() {
          return this.state;
        },
        set newValue(val) {
          this.state = val;
          if (this.state === 4) {
            let currentPlayingTime = Math.round(KHPlayer.plyr[uniqueKey][0].currentTime);
            localStorage.setItem("playing_" + uniqueKey, JSON.stringify({
              epIndex: index,
              time: currentPlayingTime
            }));
          }
        },
      };
      watchVideoState.newValue = d.querySelector(UKS + " .plyr video").readyState;
    }, 1000);
    KHPlayer.tweaks(uniqueKey);
  },
  insertAfter(place, data, convertDataToElem = false) {
    // Source: https://github.com/nefe/You-Dont-Need-jQuery#3.7
    let elem = document.querySelector(place);
    if (convertDataToElem === false) {
      elem.parentNode.insertBefore(data, elem.nextSibling);
    } else if (convertDataToElem === true) {
      elem.parentNode.insertBefore(KHPlayer.htmlToElement(data), elem.nextSibling);
    }
  },
  // Tránh confict với insertBefore của javascript
  _insertBefore(place, data, convertDataToElem = false) {
    let elem = document.querySelector(place);
    if (convertDataToElem === false) {
      elem.parentNode.insertBefore(data, elem);
    } else if (convertDataToElem === true) {
      elem.parentNode.insertBefore(KHPlayer.htmlToElement(data), elem);
    }
  },
  // Ẩn/hiện embed playlist trong <video> container
  // togglePlaylist(uniqueKey) {
  //   /* Source:
  //     https://www.w3schools.com/howto/howto_js_toggle_class.asp
  //     https://stackoverflow.com/a/16177700
  //   */
  //   document.querySelector("#" + uniqueKey + " .EmbedKHPPlaylist").classList.toggle("hidden");
  // },
  selectCurrEp(uniqueKey) {
    return document.querySelector(`#${uniqueKey} .KHPPlaylistContainer li[playing='true']`);
  },
  navigateEp(elem, nextOrPrev) {
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
        if (prevEp === null) {
          currEp.click();
        } else {
          prevEp.click();
        }
      }
    }
  },
  togglePlayerFullScreen(uniqueKey) {
    document.querySelector(`#${uniqueKey} button[data-plyr="fullscreen"]`).click();
  },
  acceptContinue(uniqueKey, episode, time) {
    document.querySelector(`#${uniqueKey} .KHPPlaylistContainer li[index="${episode}"]`).click();
    var tempLoop = setInterval(() => {
      let checkMediaStatus = {
        status: void 0,
        get newValue() {
          return this.status;
        },
        set newValue(value) {
          this.status = value;
          if (this.status === 4) {
            KHPlayer.plyr[uniqueKey][0].currentTime = time;
            clearInterval(tempLoop);
          }
        }
      };
      checkMediaStatus.newValue = document.querySelector(`#${uniqueKey} .plyr video`).readyState;
    }, 100);
  },
  // Source: http://youmightnotneedjquery.com/
  m3u8(elem, source) {
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(elem);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        elem.play();
      });
    }
  },
  getJSON(url) {
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
  addSubsForLibsPlayer(elem, data) {
    let tempSub = `<track kind="subtitles" label="${data.label}" srclang="${data.srclang}" src="${data.src}">`;
    document.querySelector(elem).appendChild(KHPlayer.htmlToElement(tempSub));
  },
  // Source: https://stackoverflow.com/a/35385518
  htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },
  // loadCSSfromURL() {
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
KHPlayer.jsonPaths.forEach(function (e) {
  // let configData = document.currentScript.getAttribute("config");
  // if (configData) {} else {
  let defaultConfig = {
    defaultQuality: 1080,
    seekTime: 5,
    invertTime: false,
    captions: {
      active: true,
      language: 'auto',
      update: true
    },
    speed: { selected: 1, options: [0, 25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
    tooltips: {
      controls: true,
      seek: true
    },
    blankVideo: "https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer/dist/blank.mp4",
    // Vietnamese
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
        'yes': 'Có',
        'no': 'Không',
        '_1': 'Bạn đang xem<br>',
        '_2': 'tại',
        '_3': 'Tiếp tục chứ?'
      }
    },
    // English
    // _i18n: {
    //   nextEpisode: 'Next episode',
    //   previousEpisode: 'Previous episode',
    //   toggleEmbedPlayllist: 'Toggle playlist',
    //   continueWatchingConfirm: {
    //     'yes': 'Yes',
    //     'no': 'No',
    //     '_1': 'You were watching',
    //     '_2': 'at',
    //     '_3': 'Want to continue?'
    //   }
    // },
  };
  KHPlayer.configurator = defaultConfig;
  // }
  KHPlayer.init(e);
});