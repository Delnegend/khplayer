// jshint esversion: 9
// -------------------------------------
// Chung
// -------------------------------------
// #region
// Tốc độ hiệu ứng
const KHPGen = {
  aniSpeed: "fast",
  minus_icon: `<i class='fas fa-minus plmns'></i>`,
  aniReplaceHTML: (selector, content, duration) => {
    $(selector).fadeOut(duration, () => $(selector).html(content).fadeIn(duration));
  },
  aniAppendTo: (takeThis, appendHere, aniSpeed = KHPGen.aniSpeed) => {
    $(takeThis)
      .css({
        "display": "none"
      })
      .appendTo(appendHere)
      .slideDown(aniSpeed);
  },
  ADD_EPISODE: elem => {
    $(elem)
      .parent(".addRemoveEpBtn")
      .parent(".episode_container")
      .after($("#phantomZoneCtn .episode_container").clone().hide())
      .next().slideDown(KHPGen.aniSpeed);
  },
  REMOVE_EPISODE: elem => {
    let a = $(elem).parent(".addRemoveEpBtn").parent(".episode_container");
    a.slideUp(KHPGen.aniSpeed, () => a.remove());
  },
  ADD_SOURCE: elem => {
    KHPGen.aniAppendTo(
      $("#temp_zone #singleSrcCtn").clone(),
      $(elem).parent("#singleSrcCtn").parent("#ALL_SRCS_CTN"),
      KHPGen.aniSpeed);
  },
  REMOVE_SOURCE: elem => {
    let a = $(elem).parent('#singleSrcCtn');
    a.slideUp(KHPGen.aniSpeed, () => a.remove());
  },
  ADD_CAPTIONS: elem => {
    let a = $("#temp_zone #singleCapCtn").clone(),
      b = $(elem).parent("#singleCapCtn").parent("#ALL_CAPS_CTN");
    KHPGen.aniAppendTo(a, b, KHPGen.aniSpeed);
  },
  REMOVE_CAPTIONS: elem => {
    let a = $(elem).parent('#singleCapCtn');
    a.slideUp(KHPGen.aniSpeed, () => a.remove());
  },
  SELECT_TYPE: elem => {
    let a = $(elem)
      .parent(".dropdown-menu")
      .parent("#typeSelectorContainer")
      .find("#typeSelectorBtn"),
      b = $(elem).html();
    KHPGen.aniReplaceHTML(a, b, KHPGen.aniSpeed);
    a.attr("selected-type", $(elem).attr("type-data"));
  },
  SELECT_RES: elem => {
    let a =
      $(elem)
      .parent(".dropdown-menu")
      .parent("#qualitySelectorContainer")
      .find("#qualitySelectorBtn"),
      b = $(elem).html();
    KHPGen.aniReplaceHTML(a, b, KHPGen.aniSpeed);
    a.attr("selected-res", $(elem).attr("res-data"));
  },
  saveAsJSON: string => {
    let text = string,
      filename = UNIQUE_ID,
      blob = new Blob([text], {
        type: "application/json"
      });
    saveAs(blob, filename);
  },
  downloadData: () => {
    saveAsJSON(generateCodeFromUserInput());
  },
  completeResult: elem => {
    $('#masterPosterContainer, .episode_container').slideUp(KHPGen.aniSpeed);
    $('#addOrCreateNewCtn').slideDown(KHPGen.aniSpeed);
    // $('#downloadCodeFromUserInputButton').html(`${UNIQUE_ID}.js`);
    // $('#codeToCopyIntoUserHTML').html(input);
    // $(".completeResult").hide(KHPGen.aniSpeed);
    // $(".editResult").show(KHPGen.aniSpeed);
    $(elem).html("Quay lại chỉnh sửa");
    $(elem).attr('onclick', "KHPGen.editResult(this)");
  },
  editResult: elem => {
    $('#addOrCreateNewCtn, #createNewPPCtn, #existedPPCtn').slideUp(KHPGen.aniSpeed);
    $('#masterPosterContainer, .episode_container').slideDown(KHPGen.aniSpeed);
    // $(".editResult").hide(KHPGen.aniSpeed);
    // $(".completeResult").show(KHPGen.aniSpeed);
    $(elem).html("Hoàn thành");
    $(elem).attr('onclick', "KHPGen.completeResult(this)");
  },
  generateCodeFromUserInput: () => {
    // Ẩn khung export
    $("#outputPanel").slideUp(KHPGen.aniSpeed);

    // Array chứa data thô toàn bộ input từ người dùng
    const RAW_DATA = [];

    // Lấy url của poster tổng, để ngoài này thay vì trong vòng lặp dưới để tránh việc #masterPosterInput bị fetch nhiều lần, ảnh hưởng tới hiệu năng
    let inputMasPoster = $("#masterPosterInput").val(),
      finalMasPoster;
    if (inputMasPoster != "") {
      finalMasPoster = inputMasPoster;
    } else {
      finalMasPoster = "https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer/dist/default_wating.svg";
    }

    // Xử lý từng episode
    $("#userInteractCtn .episode_container").each((index, value) => {
      if ($(value).find(".title").val() != "") {
        let
          // Object tạm thời để đẩy dần dữ liệu vào, cuối cùng đẩy vào RAW_DATA
          processingEpElem = {},
          // checkSubsExist: True khi ô input tên sub được điền, False khi không có
          checkSubsExist = $(value).find("#ALL_CAPS_CTN").find("#singleCapCtn").find(".captionFullName").val(),
          // Lấy url của poster con của từng tập
          inputEpPoster = $(value).find(".essentials").find(".poster").val();

        processingEpElem.type = "video";
        processingEpElem.title = $(value).find(".title").val();
        processingEpElem.sources = [];

        // Xử lý từng source
        $(value).find("#ALL_SRCS_CTN").find("#singleSrcCtn").each((index, value) => {
          let currentMediaSrc = {};

          // URL
          let inputSrcType = $(value).find("#typeSelectorContainer").find("#typeSelectorBtn").attr("selected-type");
          currentMediaSrc.src = $(value).find(".mediaSrc").val();

          // Type
          if (inputSrcType != "undefined") {
            currentMediaSrc.type = inputSrcType;
          } else {
            currentMediaSrc.type = "video/mp4";
          }

          // Quality
          let a = $(value).find("#qualitySelectorContainer").find("#qualitySelectorBtn").attr("selected-res");
          if (a != null) {
            currentMediaSrc.size = parseInt(a);
          } else {
            currentMediaSrc.size = 1080;
          }

          // Push lên processingEpElem.sources
          processingEpElem.sources.push(currentMediaSrc);
        });
        // Xử lý từng phụ đề
        if (checkSubsExist != "") {
          processingEpElem.tracks = [];
          $(value).find("#ALL_CAPS_CTN").find("#singleCapCtn").each((index, value) => {
            let processingCaption = {};
            processingCaption.kind = "subtitles";
            processingCaption.label = $(value).find(".captionFullName").val();
            processingCaption.srclang = $(value).find(".captionShortName").val();
            processingCaption.src = $(value).find(".capionSrc").val();
            processingEpElem.tracks.push(processingCaption);
          });
        }
        // Phần poster
        let finalEpPoster;
        if (inputEpPoster != "") {
          finalEpPoster = inputEpPoster;
        } else {
          finalEpPoster = finalMasPoster;
        }
        processingEpElem.poster = finalEpPoster;

        // Đẩy lên array
        RAW_DATA.push(processingEpElem);
      }
    });

    // Đấy url poster tổng cũng như ID lên data
    RAW_DATA.push(finalMasPoster);
    RAW_DATA.push(UNIQUE_ID);
    return JSON.stringify(RAW_DATA);
  },
  copy2clip: new ClipboardJS(".copy2clip"),
  messageBox: (message = "Thông báo!", duration = 1000) => {
    // Type: https://getbootstrap.com/docs/4.0/components/alerts/

    // Tạo 1 id tạm thời cho container thông báo, mỗi 1 noti là 1 id riêng, tránh trùng lặp với noti trước nếu 2 cái overlap nhau
    let tempID = `_${new Date().getTime()}`;
    // Tạo container chứa messageBox nếu chưa có
    if ($('.alertCtn')[0] == void 0) {
      $("body").append(`<div class="alertCtn"><div class="innerAlertCtn"></div></div>`);
    }
    $('.innerAlertCtn').append(`<div class="alert" id="${tempID}" role="alert" style="display:none">${message}</div>`);
    $(`#${tempID}`).slideDown("normal");
    setTimeout(() => {
      $(`#${tempID}`).slideUp("normal", () => $(`#${tempID}`).remove());
    }, duration);
  },
};
var UNIQUE_ID = "KHP_" + Date.now();

$("#qualitySelectorContainer .dropdown-item").attr("onclick", "KHPGen.SELECT_RES(this)");
$("#typeSelectorContainer .dropdown-item").attr("onclick", "KHPGen.SELECT_TYPE(this)");

// Clone toàn bộ template vào mainframe
$("#phantomZoneCtn .episode_container")
  .clone()
  .appendTo("#userInteractCtn")
  .show();

// Clone #singleSrcCtn từ template vào #temp_zone để xử lý
$("#phantomZoneCtn #ALL_SRCS_CTN #singleSrcCtn")
  .clone()
  .appendTo("#phantomZoneCtn #temp_zone");

// addSource -> removeSource trong #temp_zone
$("#temp_zone #addSourceBtn")
  .attr("onclick", "KHPGen.REMOVE_SOURCE(this)")
  .removeAttr("id")
  .html(KHPGen.minus_icon);

// Clone #singleCapCtn từ template vào #temp_zone để xử lý
$("#phantomZoneCtn #ALL_CAPS_CTN #singleCapCtn")
  .clone()
  .appendTo("#phantomZoneCtn #temp_zone");

// addCaps -> removeCaps trong #singleCapCtn trong #temp_zone
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
  $("#createNewPPCode>code").html(`&#x3C;div id=&#x22;${UNIQUE_ID}&#x22;&#x3E;&#x3C;/div&#x3E;`);
  $("#existedPPCtn").slideUp(KHPGen.aniSpeed);
  $("#createNewPPCtn").slideDown(KHPGen.aniSpeed);
});
$("#existedPPActionBtn").on("click", () => {
  $("#existedPPCtnCode>code").html(KHPGen.generateCodeFromUserInput(false));
  $("#createNewPPCtn").slideUp(KHPGen.aniSpeed);
  $("#existedPPCtn").slideDown(KHPGen.aniSpeed);
});
KHPGen.copy2clip.on("success", e => {
  e.clearSelection();
  KHPGen.messageBox("Đã copy vào clipboard!");
});