// jshint esversion: 9
// -------------------------------------
// Chung
// -------------------------------------
// #region
// Tốc độ hiệu ứng
const KHPGen = {
  aniSpeed: "fast",
  minus_icon: `➖`,
  randomString(length = 20) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "_" + result + btoa(new Date().getTime()).replace(/=/g, "");
  },
  aniReplaceHTML(selector, content, duration) {
    $(selector).fadeOut(duration, () => $(selector).html(content).fadeIn(duration));
  },
  aniAppendTo(takeThis, appendHere, aniSpeed = KHPGen.aniSpeed) {
    $(takeThis)
      .css({
        "display": "none"
      })
      .appendTo(appendHere)
      .slideDown(aniSpeed);
  },
  ADD_EPISODE(elem) {
    $(elem)
      .parent(".addRemoveEpBtn")
      .parent(".episode_container")
      .after($("#phantomZoneCtn .episode_container").clone().hide())
      .next().slideDown(KHPGen.aniSpeed);
  },
  REMOVE_EPISODE(elem) {
    $(elem.parentNode.parentNode).slideUp(KHPGen.aniSpeed, () => a.remove());
  },
  ADD_SOURCE(elem) {
    KHPGen.aniAppendTo(
      $("#temp_zone .singleSrcCtn").clone(),
      elem.parentNode.parentNode,
      KHPGen.aniSpeed);
  },
  REMOVE_SOURCE(elem) {
    $(elem.parentNode).slideUp(KHPGen.aniSpeed, () => a.remove());
  },
  ADD_CAPTIONS(elem) {
    KHPGen.aniAppendTo(
      $("#temp_zone .singleCapCtn").clone(),
      $(elem.parentNode.parentNode),
      KHPGen.aniSpeed
    );
  },
  REMOVE_CAPTIONS(elem) {
    $(elem.parentNode).slideUp(KHPGen.aniSpeed, () => $(elem.parentNode).remove());
  },
  SELECT_TYPE(elem) {
    let a = $(elem)
      .parent(".dropdown-menu")
      .parent("#typeSelectorContainer")
      .find("#typeSelectorBtn"),
      b = $(elem).html();
    KHPGen.aniReplaceHTML(a, b, KHPGen.aniSpeed);
    a.attr("selected-type", $(elem).attr("type-data"));
  },
  SELECT_RES(elem) {
    let a =
      $(elem)
      .parent(".dropdown-menu")
      .parent("#qualitySelectorContainer")
      .find("#qualitySelectorBtn"),
      b = $(elem).html();
    KHPGen.aniReplaceHTML(a, b, KHPGen.aniSpeed);
    a.attr("selected-res", $(elem).attr("res-data"));
  },
  saveAsJSON(string) {
    let text = string,
      filename = UNIQUE_ID,
      blob = new Blob([text], {
        type: "application/json"
      });
    saveAs(blob, filename);
  },
  downloadData() {
    saveAsJSON(generateCodeFromUserInput());
  },
  completeResult(elem) {
    $('#masterPosterContainer, .episode_container').slideUp(KHPGen.aniSpeed);
    $('#addOrCreateNewCtn').slideDown(KHPGen.aniSpeed);
    elem.querySelectorAll('i-18n')[0].setAttribute("hidden", "");
    elem.querySelectorAll('i-18n')[1].removeAttribute("hidden");
    $(elem).attr('onclick', "KHPGen.editResult(this)");
  },
  editResult(elem) {
    $('#addOrCreateNewCtn, #createNewPPCtn, #existedPPCtn').slideUp(KHPGen.aniSpeed);
    $('#masterPosterContainer, .episode_container').slideDown(KHPGen.aniSpeed);
    elem.querySelectorAll('i-18n')[0].removeAttribute("hidden");
    elem.querySelectorAll('i-18n')[1].setAttribute("hidden", "");
    $(elem).attr('onclick', "KHPGen.completeResult(this)");
  },
  generateCodeFromUserInput(addPosterAndPlayingIndicator = true) {
    // Ẩn khung export
    $("#outputPanel").slideUp(KHPGen.aniSpeed);

    // Array chứa data thô toàn bộ input từ người dùng
    let RAW_DATA = [];

    // Xử lý từng episode
    for (let value of document.querySelectorAll("#userInteractCtn .episode_container")) {
      if (value.querySelector('.title').value) {
        // Object tạm thời để đẩy dần dữ liệu vào, cuối cùng đẩy vào RAW_DATA
        let processingEpElem = {};

        processingEpElem.type = "video";
        processingEpElem.title = value.querySelector(".title").value;
        processingEpElem.sources = [];

        // Sprite preview thumbnail
        let preThumbSrc = value.querySelector(".previewThumbnail").value;
        if (preThumbSrc) processingEpElem.previewThumbnails = {
          src: preThumbSrc
        };

        // Xử lý từng source
        for (let source of value.querySelectorAll("#ALL_SRCS_CTN .singleSrcCtn")) {
          let currentMediaSrc = {};

          // URL + type
          currentMediaSrc.src = source.querySelector(".mediaSrc").value;
          currentMediaSrc.type = source.querySelector("#typeSelectorBtn").getAttribute("selected-type");

          // Quality
          currentMediaSrc.size = parseInt(source.querySelector("#qualitySelectorBtn").getAttribute("selected-res"));

          // Push lên processingEpElem.sources
          processingEpElem.sources.push(currentMediaSrc);
        }
        // Xử lý từng phụ đề
        for (let caption of value.querySelectorAll("#ALL_CAPS_CTN .singleCapCtn")) {
          if (caption.querySelector(".captionFullName").value) {
            let processingCaption = {};
            processingCaption.kind = "subtitles";
            processingCaption.label = caption.querySelector(".captionFullName").value;
            processingCaption.srclang = caption.querySelector(".captionShortName").value;
            processingCaption.src = caption.querySelector(".capionSrc").value;
            processingEpElem.tracks.push(processingCaption);
          }
        }

        // Đẩy lên array
        RAW_DATA.push(processingEpElem);
      }
    }

    // Đấy url poster tổng cũng như ID lên data
    if (addPosterAndPlayingIndicator) {
      RAW_DATA.push($("#masterPosterInput").val() || "");
      RAW_DATA.push(UNIQUE_ID);
    }
    return JSON.stringify(RAW_DATA);
  },
  copy2clip: new ClipboardJS(".copy2clip"),
  messageBox(message = "Thông báo!", duration = 1000) {
    // Type: https://getbootstrap.com/docs/4.0/components/alerts/

    // Tạo 1 id tạm thời cho container thông báo, mỗi 1 noti là 1 id riêng, tránh trùng lặp với noti trước nếu 2 cái overlap nhau
    let tempID = KHPGen.randomString();
    // Tạo container chứa messageBox nếu chưa có
    if ($('.alertCtn')[0] === void 0) {
      $("body").append(`<div class="alertCtn"><div class="innerAlertCtn"></div></div>`);
    }
    $('.innerAlertCtn').append(`<div class="alert" id="${tempID}" role="alert" display="none">${message}</div>`);
    $("#" + tempID).slideDown("normal");
    setTimeout(() => {
      $("#" + tempID).slideUp("normal", () => $("#" + tempID).remove());
    }, duration);
  },
};
var UNIQUE_ID = "khplayer" + KHPGen.randomString();

$("#qualitySelectorContainer .dropdown-item").attr("onclick", "KHPGen.SELECT_RES(this)");
$("#typeSelectorContainer .dropdown-item").attr("onclick", "KHPGen.SELECT_TYPE(this)");

// Clone toàn bộ template vào mainframe
$("#phantomZoneCtn .episode_container")
  .clone()
  .appendTo("#userInteractCtn")
  .show();

// Clone .singleSrcCtn từ template vào #temp_zone để xử lý
$("#phantomZoneCtn #ALL_SRCS_CTN .singleSrcCtn")
  .clone()
  .appendTo("#phantomZoneCtn #temp_zone");

// addSource -> removeSource trong #temp_zone
$("#temp_zone #addSourceBtn")
  .attr("onclick", "KHPGen.REMOVE_SOURCE(this)")
  .removeAttr("id")
  .html(KHPGen.minus_icon);

// Clone .singleCapCtn từ template vào #temp_zone để xử lý
$("#phantomZoneCtn #ALL_CAPS_CTN .singleCapCtn")
  .clone()
  .appendTo("#phantomZoneCtn #temp_zone");

// addCaps -> removeCaps trong .singleCapCtn trong #temp_zone
$("#temp_zone #addCaptionBtn")
  .attr("onclick", "KHPGen.REMOVE_CAPTIONS(this)")
  .removeAttr("id")
  .html(KHPGen.minus_icon);

// Clone nút add từ template vào #temp_zone để xử lý
$("#phantomZoneCtn #addEpBtn").clone().appendTo("#phantomZoneCtn .addRemoveEpBtn");

// addEp -> removeEp trong #temp_zone
$("#phantomZoneCtn #addEpBtn:nth-child(2)")
  .removeAttr("id")
  .attr("onclick", "KHPGen.REMOVE_EPISODE(this)")
  .html(KHPGen.minus_icon);

$(".editResult").hide();
$("#downloadJSON").on("click", () => KHPGen.saveAsJSON(KHPGen.generateCodeFromUserInput()));

$("#createNewPPActionBtn").on("click", () => {
  $("#createNewPPCode>code").html(`&#x3C;khplayer-container data=&#x22;${UNIQUE_ID}.json&#x22;&#x3E;&#x3C;/khplayer-container&#x3E;`);
  $("#existedPPCtn").slideUp(KHPGen.aniSpeed);
  $("#createNewPPCtn").slideDown(KHPGen.aniSpeed);
});
$("#existedPPActionBtn").on("click", () => {
  let newData = KHPGen.generateCodeFromUserInput(false);
  newData = newData.slice(1, newData.length - 3);
  $("#existedPPCtnCode>code").html(newData);
  $("#createNewPPCtn").slideUp(KHPGen.aniSpeed);
  $("#existedPPCtn").slideDown(KHPGen.aniSpeed);
});
KHPGen.copy2clip.on("success", e => {
  e.clearSelection();
  KHPGen.messageBox("Đã copy vào clipboard!");
});




// i18n
document.addEventListener("DOMContentLoaded", () => {
  let params = new URLSearchParams(window.location.search),
    language = params.get("lang");

  if (language == "en") {
    for (let elem of document.querySelectorAll("i-18n")) elem.innerHTML = elem.getAttribute("en");
    for (let elem of document.querySelectorAll('*[ph-en]')) elem.setAttribute("placeholder", elem.getAttribute("ph-en"));
  } else {
    for (let elem of document.querySelectorAll("i-18n")) elem.innerHTML = elem.getAttribute("vi");
    for (let elem of document.querySelectorAll('*[ph-vi]')) elem.setAttribute("placeholder", elem.getAttribute("ph-vi"));
  }
});