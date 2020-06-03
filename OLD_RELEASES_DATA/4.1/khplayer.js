/*
NOTE: concept là thế này:

Đầu tiên client add 3 script: jQuery > Plyr.js > KHPlayer.js. Ở cái KHPjs kèm theo 1 attribute jsonPath, value là 1 array (tất nhiên là kiểu string, sau khi đem vào đây thì JSON.parse ra), đồng thời phải nhét thêm defer vào nữa

Array chứa đường dẫn tới file JSON chứa dữ liệu của 1 tập hợp các video như: URL, phụ đề, tiêu đề, độ phân giải, poster, abcxyz... Mình gọi array trong file JSON này là Array mẹ (để dễ ghi note ở dưới)

Element cuối của Array mẹ là một uniqueKey, client cần đặt thẻ div có ID này ở nơi họ muốn generate player.

Chạy hàm addingCSSandStuffs để add CSS của KHPlayer và của Plyr, đồng thời check version và console.log version.
*/
// jshint esversion: 10 
const KHPGlobal = {
  // Khởi tạo Plyr
  initPlyr: selector => {
    return new Promise(resolve => {
      resolve(Plyr.setup(selector, {
        seekTime: 5,
        quality: {
          default: 1080
        }
      }));
    });
  },
  // Function đổi tập. Thay vì loop epindex như trước, gây một vài vấn đề về tương thích, mình gán luôn function vào mỗi <li> trong DOM, kèm theo this
  KHPChangeEpisode: async elem => {
    // Index là số trong ID của element được nhận. Cụ thể: lấy ID của elem được truyền vào, bỏ phần "KHPep", parseInt để chuyển sang kiểu dữ liệu dạng số (integer)
    let index = parseInt(elem.getAttribute('id').replace("KHPep", ""), 10),
      // Chọn toàn bộ các elem/các mục chọn tập
      select_all = $(elem).parent()[0].querySelectorAll("li"),
      // Lấy uniqueKey từ ID của KHPMasterContainer, chính là cái client paste vào HTML của họ
      uniqueKey = $(elem).parent().parent().attr("id");

    // Thường thì chỉ cần .source thôi là đủ nhưng đến khi ấn vào episode sử dụng m3u8, video ko đc reload source. Cách giải quyết là destroy luôn cái cũ đi rồi init cái mới
    KHPGlobal['KHPforPlyrToInteract' + uniqueKey][0].destroy();
    KHPGlobal['KHPforPlyrToInteract' + uniqueKey] = await KHPGlobal.initPlyr('#KHPVideoTagFromDOM' + uniqueKey);

    // Xoá style, class để indicator
    select_all.forEach(e => {
      e.removeAttribute("class");
      e.removeAttribute("style");
    });
    // Tạo cái style cho mục user vừa click
    $(elem).attr("style", "color:yellow");
    $(elem).attr("playing", "true");
    // Cho cái auto next tập, chỉ cần gọi class dưới + next()
    $(elem).attr("class", "KHPPlayingIndicator");
    let currData = KHPGlobal["KHPPlaylist" + uniqueKey][index],
      currVideoTag = $("#KHPVideoTagFromDOM" + uniqueKey)[0],
      currMediaType = currData.sources[0].type;

    if (currMediaType == "M3U8") {
      KHPGlobal.m3u8(currVideoTag, currData.sources[0].src);
    } else {
      KHPGlobal['KHPforPlyrToInteract' + uniqueKey][0].source = currData;
      KHPGlobal['KHPforPlyrToInteract' + uniqueKey][0].play();
    }
    // Tự động next khi hết tập
    KHPMasterContainer = "#" + uniqueKey;

    KHPGlobal['KHPforPlyrToInteract' + uniqueKey][0].on('ended', event => {
      let current_episode = $(KHPMasterContainer + " .KHPPlayingIndicator"),
        next_episode = current_episode.next();
      console.log(next_episode);
      if (next_episode[0] != undefined) {
        next_episode.click();
        $(KHPMasterContainer + " .plyr__video-wrapper video").click();
      }
    });
  },
  // Clear toàn bộ player hiện đang có trên DOM

  // Khởi tạo KHPlayer ở đây
  // NOTE: chính bởi vì ở func đổi tập, mình lựa chọn cách destroy cái cũ đi và init lại cái mới, những eventListener đối với cái KHPforPlyrToInteract cũng sẽ bị destroy theo. Vì vậy hãy add listener vào trong func đổi tập (ví dụ như cái auto next tập kia chẳng hạn)
  initKHPlayer: async url => {

    /* NOTE: Mỗi playlist (Array mẹ), mỗi Container (cái mà client paste vào HTML), mỗi object để Plyr tương tác đều được gán thêm uniqueID để có thể có nhiều player mà không bị conflict lẫn nhau */

    let
      PLAYLIST_ = await $.getJSON(url),
      uniqueKey = await PLAYLIST_[PLAYLIST_.length - 1];
    KHPGlobal["KHPPlaylist" + uniqueKey] = PLAYLIST_;
    PLAYLIST = KHPGlobal["KHPPlaylist" + uniqueKey];

    let
      // elem sát cuối là url poster tổng
      poster = await PLAYLIST[PLAYLIST.length - 2],
      // Cái này vì mình dùng jQuery nên gắn # vào cho nhanh
      KHPMasterContainer = "#" + uniqueKey;

    // Tạo 1 cái frame bên trong container player
    $(KHPMasterContainer).html(`
            <video control playsinline id='KHPVideoTagFromDOM${uniqueKey}'></video>
            <ul id='KHPPlaylistContainer'></ul>
        `);
    // Set poster
    $("#KHPVideoTagFromDOM" + uniqueKey).attr("poster", poster);

    // Khởi tạo playlist
    // Cái này để check playlist có trống hay không, mà hình như có vẻ thừa thãi :)))
    if (PLAYLIST.length > 0) {
      // Để index bắt đầu từ 0
      let index = 0;
      // Biến Array mẹ thành GUI, một list chứa các episode
      while (index <= PLAYLIST.length - 3) {
        let
          // Tạo id cho từ mục một
          currentID = "KHPep" + index,
          // Gọi data của từng elem trong array "tổng" xuống
          currentVid = PLAYLIST[index],
          // Giờ mới create elem
          list_ep = document.createElement("li");
        list_ep.setAttribute("id", currentID);
        // Append mục chọn tập vào container
        $(KHPMasterContainer + " #KHPPlaylistContainer").append(list_ep);
        // Gọi mục chọn tập lên
        let currentLine = $(`${KHPMasterContainer} #${currentID}`)[0];
        // Gán cho nó cái nội dung (gọi title từ currentVid lên array tổng xuống)
        currentLine.innerHTML = currentVid.title;
        // function đổi tập
        currentLine.setAttribute("onclick", `KHPGlobal.KHPChangeEpisode(this)`);
        // Tăng index ở phía trên lên 1, tiếp tục cho mục chọn tiếp theo
        index++;
      }
    }

    // NOTE: Plyr đc khởi tạo ở chỗ này
    KHPGlobal['KHPforPlyrToInteract' + uniqueKey] = await KHPGlobal.initPlyr('#KHPVideoTagFromDOM' + uniqueKey);

    // Simulate clicking on the specified element.
    const triggerEvent = (elem, event) => {
      let clickEvent = new Event(event); // Create the event.
      elem.dispatchEvent(clickEvent); // Dispatch the event.
    };
  },
  m3u8: function (elem, source) {
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(elem);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        elem.play();
      });
    }
  }
};

JSON.parse(document.currentScript.getAttribute("jsonPath")).forEach(e => {
  KHPGlobal.initKHPlayer(e);
});