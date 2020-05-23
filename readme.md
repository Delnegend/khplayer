<img src="./dist/default_wating.svg" width="100%" height="auto">
<hr>

## **Các tính năng**
- Áp dụng được từ Plyr sang:
  - Sử dụng direct link của video (sẽ hỗ trợ link YouTube và Vimeo trong tương lai)
  - Mỗi video chọn được nhiều độ phân giải (đối với video direct link) và phụ đề.
  - Gán poster cho từng tập cũng như poster mặc định.
- Tự phát triển:
  - Playlist.
  - Tự động next tập, dừng lại khi đến tập cuối cùng.
  - Tự động select tập đầu tiên nếu user chưa chọn. 
  - Generate nhiều playlist trên cùng 1 trang mà không bị xung đột lẫn nhau<br>*cũng là tính năng làm tốn nhiều thời gian nghiên cứu của mình nhất* 😃

<hr>

## **Hướng dẫn sử dụng**
### A. Cài đặt
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
### B. Chuẩn bị direct link của video (nguyên liệu).

### C. Vào [khplayer.delnegend.xyz](https://khplayer.delnegend.xyz) để generate JSON data từ nguyên liệu đã chuẩn bị. Sau khi ấn "Hoàn thành" sẽ hiện ra 2 button:
  - Nếu playlist player chưa từng có trên webpage, nhấn "Tạo mới":
    - Nhấn "Download JSON" và lưu file vào nơi nào đó, nên lưu cùng thư mục so với file index của webpage chứa playlist player để tiện edit.
    - Nhấn "Copy container", paste vào vị trí muốn đặt playlist player trên webpage. Lưu ý: ID cặp ```<div>``` này chính là phần tử cuối trong file JSON vừa download ở trên.
    - Tiếp đến thêm script này vào dưới 2 thẻ script đã add ở trên. Ở đâu cũng được miễn là nó nằm dưới:
      ```html
      <script defer src="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@5.0/dist/khplayer.min.js" jsonPath='<array (các) đường dẫn đến file JSON>'></script>
      ```
    - Phần "array các đường dẫn đến fle JSON" đúng như cách chú thích. Bạn paste đường dẫn tới file JSON lưu ở bước 1. Đây cũng là lý do vì sao mình bảo nên để ở cùng thư mục so với file index, vì khi này chỉ cần nhập:

        ```javascript
        jsonPath='["./KHP_123456"]'
        // Để ý: ngoài cùng là ngoặc đơn, bọc quanh các phần tử là ngoặc kép
        ```

  - Nếu playlist player đã từng có cái, mà giờ muốn làm thêm cái nữa trên webpage:
    - Cũng nhấn "Tạo mới" Làm bước 1 và 2 như trên.
    - Thêm đường dẫn tới file JSON mới này vào array jsonPath nằm trong thẻ ```<script>``` đã từng add vào webpage ở trường hợp trên, ví dụ:

        ```javascript
        jsonPath='["./KHP_123456","./KHP_654321"]'
        // Và tương tự đối với các playlist player sau
        jsonPath='["./KHP_123456","./KHP_654321","./KHP_13579",...]'
        ```

  - Nếu thêm video vào playlist player đã tạo trước đó, nhấn "Thêm vào playlist đã có", copy đoạn data được generate và chèn vào data trong file JSON, trước 2 element cuối.

### D. Lưu ý
 - Đối với định dạng m3u8, KHPlayer chưa hỗ trợ nhiều độ phân giải cùng lúc. Trên trang Generator mình vẫn để được phép chọn nhiều source, sau này (có thể) mình sẽ bổ sung tính năng này.
### E. Thả🌟và ấn follow để theo dõi khi nào mình release version mới :3