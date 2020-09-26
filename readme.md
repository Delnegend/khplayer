<img src="dist/default_waiting.svg" width="100%" height="auto">

## **Tính năng chính**
Generate được một playlist player [như thế này](https://khplayer.delnegend.xyz/others/demo/) mà không động đến CSS, JS

<img src='others/README_Data/khplayer-demo.png'>

## **Các tính năng khác**
- **Playlist.** *(KHPlayer)*
- Mỗi video chọn được nhiều phụ đề/độ phân giải. *(Plyr)*
- Tự động next tập. *(KHPlayer)*
- Khởi tạo nhiều playlist trên cùng 1 trang. *(KHPlayer)*
- Hỗ trợ playback .m3u8 *(HLS)* + phụ đề. *(KHPlayer)*
- Lưu lại tập/thời lượng đang xem tới. *(KHPlayer)*
- Và nhiều tính năng khác...

<hr>

## **Hướng dẫn sử dụng** (v6)
v5 xem tại [đây](others/README_KHPlayer_v5.md)
### A. Thêm đống này vào `<head></head>`
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@6.2/dist/khplayer.min.css">
<script src="https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.min.js"></script> 
<script src="https://cdn.jsdelivr.net/npm/hls.js@0.13.2/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/richtr/NoSleep.js/dist/NoSleep.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@6.2/dist/khplayer.min.js"></script>
```

<hr width='50%'>

### B. Chuẩn bị nguyên liệu
- <details>
    <summary>Video | Ảnh bìa nếu muốn</summary>

  - Đảm bảo rằng video sử dụng codec hình ảnh H264 + âm thanh AAC và container `.mp4`.
  - Dùng [Handbrake](https://handbrake.fr/) để chuyển đổi codec.
  - Dùng [ffmpeg](https://ffmpeg.org/download.html) để chuyển đổi container.
    ```
    ffmpeg -i input.mkv -codec copy output.mp4
    ```
  - Poster lấy trên Google.
  - Upload video, ảnh bìa lên cloud, lấy link direct ([1](#direct-link-tips)).

  </details>

- <details>
    <summary>Preview thumbnail (nếu muốn)</summary><br>

  <img src='others/README_Data/sprite-thumb-demo.png' style="max-width: 326px; width: 100%; height: auto">

  - Cài [NodeJS](https://nodejs.org/), [ffmpeg](https://ffmpeg.org/download.html).
  - [Điền form này](https://khplayer.delnegend.xyz/others/genSpriteThumbCode/), chưa cần điền `Link ảnh trực tiếp`.
  - Mở `powershell/terminal` > `cd "D:\thư\mục\chứa\file\video.mp4"` > dán câu lệnh `Tạo file jpg` > `Enter`.
  - Upload file .jpg lên cloud, lấy link direct ([1](#direct-link-tips)) rồi dán vào `Link ảnh trực tiếp` ([1](#direct-link-tips)) trong form trên. 
  - [Clone/download repo này](https://github.com/radiantmediaplayer/rmp-create-vtt-thumbnails) hoặc [ấn đây để tải xuống](https://github.com/DELNEGEND/khplayer/blob/master/others/README_Data/rmp-create-vtt-thumbnails.zip?raw=true) và giải nén.
  - Quay lại powershell/terminal > `cd "D:\thư\mục\vừa\clone\trên\"` > dán câu lệnh `Tạo file vtt` trong form và `Enter`.
  - Upload lên cloud không bị chặn [CORS](https://topdev.vn/blog/cors-la-gi/), lấy link direct ([1](#direct-link-tips)).
  
  </details>

- <details>
    <summary>File phụ đề .vtt (nếu muốn)</summary>
  
  - Convert .ass hay .srt sang .vtt: [Google](https://google.com)
  - Kiểm tra .vtt "chuẩn" [quuz.org/webvtt/](https://quuz.org/webvtt/) | [dự phòng](https://khplayer.delnegend.xyz/others/VTT_Validation/)
  - Upload lên cloud không bị chặn [CORS](https://topdev.vn/blog/cors-la-gi/), lấy link direct ([1](#direct-link-tips)).
  
  </details>
<hr width='50%'>

### C. Build lên thành player
  - Điền form [này](https://khplayer.delnegend.xyz/others/genScreen) (DL: direct link)<br>
  - Ấn `Hoàn thành` sẽ hiện ra 2 button: 
    - Ấn `Tạo mới` nếu cần tạo 1 playlist player mới
      - Nhấn `Tải file JSON`, upload lên cloud, lấy link direct ([1](#direct-link-tips))
      - Nhấn `Sao chép` và dán vào vị trí muốn đặt playlist player trên webpage. Phần `data` là đường dẫn tới file json, sửa lại nếu cần thiết.
    - Ấn `Đã có` nếu muốn thêm dữ liệu vào file json sẵn có:
      - hấn `Sao chép` và dán vào vị trí mong muốn trong file json cần edit.<br>
        Tham khảo [JSON là gì - TOPDev](https://topdev.vn/blog/json-la-gi/).<br>
<hr width='50%'>

### D. Lưu ý
 - KHPlayer chưa hỗ trợ nhiều nguồn .m3u8 trên cùng 1 tập.

<hr>

<div id="direct-link-tips">

# Link trực tiếp:
- [Lấy link download trực tiếp trên dropbox, OneDrive - Blog chia sẻ kiến thức](https://blogchiasekienthuc.com/thu-thuat-internet/lay-link-download-truc-tiep-direct-link-tren-dropbox-onedrive.html#:~:text=Direct%20link%20l%C3%A0%20d%E1%BA%A1ng%20link,th%C3%AAm%20m%E1%BB%99t%20l%E1%BA%A7n%20n%C3%A0o%20n%E1%BB%AFa.)
- [Cách tạo direct link Google Drive - GDrive.vip](https://gdrive.vip/cach-tao-direct-link-google-drive-tai-truc-tiep-google-drive-direct-download-link-generator/)
- File trên Google Drive [nhỏ hơn 100MB](https://support.google.com/a/answer/172541?hl=en) dùng link dạng: `https://drive.google.com/uc?export=download&id=xxxxxxxxxxxxxxxx`.
- File trên OneDrive 5TB thay `?e=xxxxx` bằng `?download=1`
- Lấy link direct bằng [Fast.io](https://fast.io/) từ các host: Google Drive, OneDrive, Dropbox, Box, MediaFire, GitHub.

- <details>
  <summary>Nếu đang sử dụng static site generator như Hugo, Jekyll,... nên dùng luôn relative path</summary>
  
  - Dữ liệu nằm cùng thư mục với index.html<br><br>
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/same.png"><br>
    ```
    data.json
    ```
  - Dữ liệu nằm trong thư mục con<br><br>
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/children.png"><br>
    ```
    assets/json/data.json
    assets/vtt/data.vtt
    ```
  - Dữ liệu nằm trong thư mục "phụ huynh"<br><br>
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/parent.png"><br>
    ```
    ../data.json
    ```
  - Không rõ vì sao bạn lại muốn để file theo kiểu này nhưng<br>
    Dấu gạch "/" ở đầu nghĩa là lấy file từ domain gốc

      ```
      /data.ext = "//example.com/data.ext"
      ```
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/root.png">

    - Trong index.html
      ```
      /assets/json/post2.data.json
      /assets/vtt/post3.subtitle.vtt
      
      hoặc
      
      assets/json/post2.data.json
      assets/vtt/post3.subtitle.vtt
      ```
    - Trong post2.html, post3.html
      ```
      /assets/json/post2.data.json
      /assets/vtt/post3.subtitle.vtt
      
      hoặc
      
      ../assets/json/post2.data.json
      ../assets/vtt/post3.subtitle.vtt
      ```

</details>
</div>
<hr>

# Credit
- [Plyr](https://plyr.io) - APIs, player, themes,...
- [hls.js](https://github.com/video-dev/hls.js/) - hỗ trợ file M3U8.
- [FontAwesome](https://fontawesome.com/) - nút tập tiếp/trước,ẩn/hiện embed playlist.
- [radiantmediaplayer](https://github.com/radiantmediaplayer) - bài hướng dẫn tạo sprite thumbnail.

<hr>

# KHPlayerONE
Từ bản 6.2 bổ sung thêm KHPlayerONE, thay vì load 3 file script, 2 file style thì chỉ cần load duy nhất file script của KHPlayer, thêm thuộc tính `data` và đặt vào nơi muốn tạo playlist player, ví dụ
```html
...
</head>
<body>
  <div>Content1</div>
  
  <script src="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@6.2/dist/khplayer.min.js" data="data.json"></script>
  
  <div>Content2</div>
</body>
...
```