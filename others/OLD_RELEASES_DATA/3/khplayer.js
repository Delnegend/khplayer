/*
NOTE: concept là thế này:

Đầu tiên client add 3 script: jQuery > Plyr.js > KHPlayer.js. Ở cái KHPjs kèm theo 1 attribute jsonPath, value là 1 array (tất nhiên là kiểu string, sau khi đem vào đây thì JSON.parse ra), đồng thời phải nhét thêm defer vào nữa

Array chứa đường dẫn tới file JSON chứa dữ liệu của 1 tập hợp các video như: URL, phụ đề, tiêu đề, độ phân giải, poster, abcxyz... Mình gọi array trong file JSON này là Array mẹ (để dễ ghi note ở dưới)

Element cuối của Array mẹ là một uniqueKey, client cần đặt thẻ div có ID này ở nơi họ muốn generate player.

Chạy hàm addingCSSandStuffs để add CSS của KHPlayer và của Plyr, đồng thời check version và console.log version.
*/
const c = console;
const KHPGlobal = {
    // Thêm CSS vào DOM, check version của Plyr và KHPlayer
    addingCSSandStuffs: async () => {
        let
            // CSS của KHPlayer, Plyr và scripts của Plyr cùng với integrity key
            // NOTE: nhớ uncomment chỗ này, tắt đi để tạm add css từ localhost
            scriptNstyle = {
                "plyrCSS": "https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.css",
                // "plyrCSS_SHA": "EbUdjZS7C6ZooSAFtOJrvkQmdpEAxEVa4EBnnD059TdJU7zyOHoN6tSi+gi8w7PW",
                "KHPlayerCSS": "https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@3.2/dist/khplayer.min.css",
                // "KHPlayerCSS_SHA": "sha384-7oB96OibD4yLTkAD4eXLZ50JtADdaEmP0fQfH/nwSi43FkAQkE5ZbDvpuBFEUx4m",
            };

        // Chức năng gán CSS, JS rời vào file HTML
        let loadCSSfromURL = (filename, integrityKey) => {
            let fileref = document.createElement("link");
            fileref.rel = "stylesheet";
            fileref.type = "text/css";
            fileref.href = filename;
            // fileref.integrity = integrityKey;
            // fileref.setAttribute("crossorigin", "anonymous");
            document.getElementsByTagName("head")[0].appendChild(fileref);
        };
        // NOTE: cả chỗ này nữa
        loadCSSfromURL(scriptNstyle.plyrCSS, scriptNstyle.plyrCSS_SHA);
        loadCSSfromURL(scriptNstyle.KHPlayerCSS, scriptNstyle.KHPlayerCSS_SHA);
    },
    // Khởi tạo Plyr (theo document của họ)
    initPlyr: selector => {
        return new Promise(resolve => {
            resolve(Plyr.setup(selector, {
                "seektime": 5,
                "captions": { active: false, language: 'auto', update: false }
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
            uniqueKey = $(elem).parent().parent().attr("id"),
            currentEpJsonData = KHPGlobal["KHPPlaylist" + uniqueKey][index],
            currentKHPplayer = KHPGlobal['KHPforPlyrToInteract' + uniqueKey][0],
            currentVideoTag = $("#KHPVideoTagFromDOM"+uniqueKey)[0];
            srcFormat = currentEpJsonData.sources.type;
        // Xoá style, class để indicator
        // c.log(currentVideoTag);
        select_all.forEach(e => {
            e.removeAttribute("class");
            e.removeAttribute("style");
        });
        // Tạo cái style cho mục user vừa click
        $(elem).attr("style", "color:yellow");
        $(elem).attr("playing", "true");
        // Cho cái auto next tập, chỉ cần gọi class dưới + next()
        $(elem).attr("class", "KHPPlayingIndicator");
        c.log(currentEpJsonData);
        if (srcFormat !== "m3u8") {
            currentKHPplayer.source = currentEpJsonData;
        }
        // c.log(currentKHPplayer.source);
        if (srcFormat === "m3u8") {
            KHPGlobal.m3u8(currentVideoTag,currentEpJsonData.sources[0].src)
        }
    },
    // Clear toàn bộ player hiện đang có trên DOM

    // Khởi tạo KHPlayer ở đây
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
            while (index < PLAYLIST.length - 2) {
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

        // Tự động play video đầu tiên nếu chưa chọn episode
        if ($(KHPMasterContainer, ".plyr__video-wrapper video source")[0] == undefined) {
            $(".plyr__video-wrapper")[0].onclick = () => {
                let elem = $(KHPMasterContainer, "#KHPep0")[0];
                triggerEvent(elem, 'click');
            };
        }

        // Tự động next khi hết tập
        KHPGlobal['KHPforPlyrToInteract' + uniqueKey][0].on('ended', event => {
            let current_episode = $(KHPMasterContainer + " .KHPPlayingIndicator"),
                next_episode = current_episode.next();
            if (next_episode[0] != undefined) {
                triggerEvent(next_episode[0], "click");
                $(KHPMasterContainer + " .plyr__video-wrapper video")[0].click();
            }
        });

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
                // elem.play();
            });
        }
    }
};

KHPGlobal.addingCSSandStuffs();
JSON.parse(document.currentScript.getAttribute("jsonPath")).forEach(e => {
    KHPGlobal.initKHPlayer(e);
});