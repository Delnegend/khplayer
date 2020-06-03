<img src="./dist/default_wating.svg" width="100%" height="auto">

## **Các tính năng**
- **Playlist.**
- Mỗi video chọn được nhiều phụ đề/độ phân giải. (x)
- Gán poster cho từng tập cũng như poster mặc định.
- Tự động next tập, dừng lại khi đến tập cuối cùng. 
- Generate nhiều playlist trên cùng 1 trang mà không bị xung đột lẫn nhau

<hr>

## **Hướng dẫn sử dụng**
### A. Thêm các file JS/CSS cần thiết
 Thêm 2 script này vào phần thẻ ```<head></head>``` nếu cái nào chưa có.

  ```html
<script src="https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.min.js"></script> 
```
 Thêm hls.js nữa nếu có ý định dùng file m3u8
 ```html
 <script src="https://cdn.jsdelivr.net/npm/hls.js@0.13.2/dist/hls.min.js"></script>
 ```
 Cuối cùng thêm 2 file css này
 ```html
 <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.css">
 <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@5.0/dist/khplayer.min.css">
 ```

<hr width='50%''>

### B. Chuẩn bị nguyên liệu
- Chắc chắn rằng video sử dụng codec/format phù hợp với HTML5 [sau đây](https://www.encoding.com/html5-video-codec/).

  TL;DR: miễn codec H264/AAC, format .mp4 auto tương thích mọi trình duyệt phổ biến.

  Mình recommend dùng [Handbrake](https://handbrake.fr/) để convert. Sử dụng sẵn presets mong muốn trong phần General, sau đó sang tab Summary tích vào Web Optimized, sang tab Audio phần bitrate chỉnh 256 hoặc 320 tuỳ thích (nên để 320) rồi ấn Start Encode.

  Upload video lên bất cứ cloud storage nào cho phép dùng link direct. Nếu chưa biết, link direct (video) là link khi paste vào trình duyệt hoặc IDM sẽ tự động tải xuống, hoặc paste vào MXPlayer, VLC, Media Player Classic,... sẽ tự động phát.<br>
  Ví dụ: `https://bit.ly/3cdHH3q`

  Với Google Drive, có thể dùng [direct.gdrive.vip](https://direct.gdrive.vip/) để tạo link direct. Lưu ý vài trường hợp không tạo được đối với GDrive Unlimited (chính mình bị đây).

  Với OneDrive 5TB, khi tạo link chia sẻ, cuối link có đoạn `?e=xxxxx` thì xoá đi và thay bằng `?download=1` thì sẽ thành link direct (loại 1TB mình chưa test)

  **Mẹo nhỏ:**
  - Dùng AirExplorer (Mac/Win) khi tạo link chia sẻ OneDrive sẽ vừa nhanh/tiện hơn, vừa không có đoạn `?e=xxxxx`.
  - Nếu file lưu Google Drive (15GB hay Unlimited) [nhỏ hơn 100MB](https://support.google.com/a/answer/172541?hl=en) có thể dùng link dạng này: `https://drive.google.com/uc?export=download&id=xxxxxxxxxxxxxxxx`.

- Preview thumbnail, dịch sơ qua là ảnh xem trước (nếu muốn):

  <img src='./README_Data/spriteThumb.png' width='316' height='auto'>

  Bao gồm các file ảnh (hoặc ghép hết vào thành 1 - gọi là sprite thumbnail) và 1 file .vtt (hoạt động tương tự như file phụ đề). Ở đây mình sẽ hướng dẫn tạo sprite thumbnail (1 file chứa toàn bộ ảnh) và 1 file .vtt:

  - Cài [NodeJS](https://nodejs.org/), [ffmpeg](https://ffmpeg.org/download.html).
  - [Điền form này](https://khplayer.delnegend.xyz/genSpriteThumbCode/), copy câu lệnh phần `Generate jpg` (ô `Link direct ảnh` không cần điền).
  - Mở powershell/terminal lên, `cd` đến thư mục chứa file video và paste câu lệnh vừa copy vào.
  - Sau khi được file .jpg, upload lên cloud (không dùng OneDrive), lấy link direct rồi paste vào `Link direct ảnh` trong form vừa rồi.
  - [Clone/download repo này](https://github.com/radiantmediaplayer/rmp-create-vtt-thumbnails), quay lại powershell/terminal và `cd` vào thư mục repo đó, copy câu lệnh phần `Generate vtt` trong form, paste vào và Enter.
    Trong trường hợp link repo kia die thì ấn vào [đây](https://github.com/DELNEGEND/khplayer/blob/master/README_Data/rmp-create-vtt-thumbnails.zip?raw=true) để tải xuống.
  - Sau khi được file .vtt, upload lên cloud không bị chặn [CORS](https://topdev.vn/blog/cors-la-gi/), nếu có thì sử dụng một số CORS proxy như [thingproxy - Freeboard](https://github.com/Freeboard/thingproxy), [yacdn.org](https://github.com/ovsoinc/yacdn.org),...<br>
  **TL;DR:** CORS là cơ chế chặn/cho phép website này sử dụng tài nguyên từ website kia. Như ảnh dưới là chặn này:<br>
  <image src="README_Data/No3rdPartyCloud.png" width="585" height="auto">
  Đối với link OneDrive/Google Drive nhớ rút gọn qua [bit.ly](https://bit.ly/) hoặc bất cứ url shortenter nào khác để mask phần `?export=download...` hay `?download=1` đi, tránh xung đột với param của URL của các proxy.

  **Mẹo nhỏ**<br>
  Nếu bạn dùng static site generator như Hugo hay Jekyll, có thể để luôn 2 file mosaic .jpg và .vtt trong thư mục của bài post. Phần `Link direct ảnh` nhập đúng tên ảnh là được, không bắt buộc `./`, đỡ phải upload 2 file mosaic, đỡ tốn thời gian vụ CORS.

- File phụ đề dạng .vtt (nếu có/muốn)

  Convert từ .srt hay .ass sang .vtt trên Google không thiếu. Tuy nhiên nếu muốn chắc chắn 100% file vtt được convert đúng cách hãy sử dụng trang [quuz.org/webvtt/](https://quuz.org/webvtt/).

  Trong trường hợp quuz.org không còn truy cập được: [khplayer.delnegend.xyz/VTT_validation/](https://khplayer.delnegend.xyz/VTT_Validation/)

  Tương tự như file .vtt của phần preview thumbnail, cũng liên quan tới [CORS](https://topdev.vn/blog/cors-la-gi/).

<hr width='50%''>

### C. Build lên thành player
  - Điền form [khplayer.delnegend.xyz](https://khplayer.delnegend.xyz). Sau khi ấn "Hoàn thành" sẽ hiện ra 2 button:
  - #### Nếu trên webpage chưa có cái đoạn `<script>` như bước thứ 3, nhấn "Tạo mới":
    - Nhấn "Download JSON" và lưu file vào nơi nào đó, nên lưu cùng thư mục so với file index của webpage chứa playlist player để tiện edit.
    - Nhấn "Copy container", paste vào vị trí muốn đặt playlist player trên webpage (nếu muốn dùng id khác thì phải edit lại phần tử cuối cùng của file JSON vừa tải trên).
    - Tiếp đến thêm `<script>` này vào webpage, chỗ nào cũng được:
      ```html
      <script defer src="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@5.0/dist/khplayer.min.js" jsonPath='<array (các) đường dẫn đến file JSON>'></script>
      ```
    - Phần "array các đường dẫn đến fle JSON" đúng ý nghĩa mình chú thích. Paste đường dẫn tới file JSON lưu ở bước 1. Đây cũng là lý do vì sao mình bảo nên để ở cùng thư mục so với file index của webpage, vì khi này chỉ cần nhập:

        ```javascript
        jsonPath='["./KHP_123456"]'
        // Để ý: ngoài cùng là ngoặc đơn, bọc quanh các phần tử là ngoặc kép
        ```

  - Nếu trước đó:
    - Cũng nhấn "Tạo mới" Làm bước 1 và 2 như trên.
    - Thêm đường dẫn tới file JSON mới này vào array jsonPath nằm trong thẻ ```<script>``` đã từng add vào webpage ở trường hợp trên, ví dụ:

        ```javascript
        jsonPath='["./KHP_123456","./KHP_654321"]'
        // Và tương tự đối với các playlist player sau
        jsonPath='["./KHP_123456","./KHP_654321","./KHP_13579",...]'
        ```

  - Nếu thêm video vào playlist player đã tạo trước đó, nhấn "Thêm vào playlist đã có", copy đoạn data được generate và chèn vào data trong file JSON, trước 2 element cuối.

<hr width='50%''>

### D. Lưu ý
 - Đối với định dạng m3u8, KHPlayer chưa hỗ trợ nhiều độ phân giải cùng lúc. Trên trang Generator vẫn để được phép chọn nhiều source để sau này (có thể) sẽ bổ sung tính năng.