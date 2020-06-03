// CHỈNH SỬA ĐƯỜNG DẪN FILE NGUỒN TẠI ĐÂY
const PLYR_CSS = "https://dngnd.ml/plyr-css",
  KHPLAYER_CSS = "https://dngnd.ml/khplayer-css",
  PLYR_SCRIPT = "https://dngnd.ml/plyr-js";

// KHÔNG CHỈNH SỬA BẤT CỨ THỨ GÌ Ở DƯỚI DÒNG NÀY
var init_khplayer = (PLYR_CSS, KHPLAYER_CSS, PLYR_SCRIPT, PLAYLIST) => {
  /*
  const ADD_WARPPER = () => {
    let data = document.createElement("div"),
      script = document.scripts[document.scripts.length - 1]; // Tạo cặp thẻ div và gán vào biến
    data.id = "khplayer_warpper"; // Gán class khplayer_warpper data
    return script.parentElement.insertBefore(data, script);
  };

  // Thêm wrapper
  ADD_WARPPER();
  */
  let uniqueID = $('script').last().attr("uniqueID"),
    uniqueIDID = "#" + uniqueID,
    plyr_warpper = $(uniqueIDID);
  plyr_warpper.html("<video control playsinline id='player'></video><ul id='khp_playlist'></ul>");
  $(uniqueIDID+" #player").attr("poster", PLAYLIST[PLAYLIST.length - 1]);
  // $(uniqueIDID+"#player").attr("id", uniqueID);

  // Chức năng gán CSS, JS rời vào file HTML
  const loadCSS = (filename) => {
    let fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    document.getElementsByTagName("head")[0].appendChild(fileref);
  };

  const addCSS = data => {
    let cssTag = document.createElement("style");
    cssTag.innerHTML = data;
    document.getElementsByTagName("head")[0].appendChild(cssTag);
  };

  // Gán file plyr.css vào phần <head>
  loadCSS(PLYR_CSS);
  loadCSS(KHPLAYER_CSS);

  const loadExJS = (url, implementationCode, location) => {
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element
    let scriptTag = document.createElement("script");
    scriptTag.src = url;
    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;
    location.appendChild(scriptTag);
  };

  let createKHP = () => {
    // Cài đặt Plyr vào thẻ chứa id player
    const player = Plyr.setup(uniqueIDID+" #player", {
      "seekTime": 5
    });

    // Generate <li> lên browser, có id lần lượt theo index của array PLAYLIST, vd tập 1 có index là 0, id của <li> sẽ là epIndex0, thuận tiện cho việc gán function hàng loạt khi click vào từng thẻ <li>
    if (PLAYLIST.length > 0) {
      let index = 0;
      while (index < PLAYLIST.length - 1) {
        let currentID = "epIndex" + index,
          currentVid = PLAYLIST[index],
          list_ep = document.createElement("li");
        list_ep.setAttribute("id", "tmp");
        document.getElementById("khp_playlist").appendChild(list_ep);
        let currentLine = document.getElementById("tmp");
        currentLine.innerHTML = currentVid.title;
        currentLine.id = currentID;
        index++;
      }
    }

    // điều kiện for được một công đa việc: tạo vòng loop, gọi index của PLAYLIST, gọi ID của cặp <li> tương ứng đến video trong PLAYLIST
    for (let i = 0; i < PLAYLIST.length; i++) {
      let currentID = "epIndex" + i,
        current_select = document.getElementById(currentID);
      current_select.onclick = () => { // jshint ignore:line
        let select_all = document.getElementById("khp_playlist").querySelectorAll("li");
        select_all.forEach(e => e.removeAttribute("style"));
        select_all.forEach(e => e.removeAttribute("playing"));
        player[0].source = PLAYLIST[i];
        current_select.setAttribute("style", "color:yellow");
        current_select.setAttribute("class", "current_khp_vid");
      };
    }

    // Auto select vid0
    // if ($(".plyr__video-wrapper video source")[0] == undefined) {
    //   $(".plyr__video-wrapper").onclick(() => {
    //     let elem = document.getElementById('epIndex0');
    //     triggerEvent(elem, 'click');
    //   });
    // }

    // Tự động next
    player[0].on('ended', event => {
      let current_episode = $(".current_khp_vid"),
        next_episode = current_episode.next(),
        video_body = document.querySelectorAll(".plyr__video-wrapper video");
      if (next_episode[0] != undefined) {
        next_episode.click();
        $(".plyr__video-wrapper video").click();
      }
    });
  };
  loadExJS(PLYR_SCRIPT, createKHP, document.body);

  // Simulate clicking on the specified element.
  const triggerEvent = (elem, event) => {
    let clickEvent = new Event(event); // Create the event.
    elem.dispatchEvent(clickEvent); // Dispatch the event.
  };
  // console.log(uniqueID);
};
init_khplayer(PLYR_CSS, KHPLAYER_CSS, PLYR_SCRIPT, window[$('script').last().attr("uniqueID")+"_"]);
// var a = "temp"
// console.log(window._25082019_);