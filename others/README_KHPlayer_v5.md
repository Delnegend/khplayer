### A. Thêm vào ```<head></head>``` nếu chưa có.

Framework Plyr
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
 <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@5.3/dist/khplayer.min.css">
 ```

<hr width='50%'>

### C. Build lên thành player
  - Điền form [này](https://khplayer.delnegend.xyz/others/genScreen).<br> (DL viết tắt cho direc link - link trực tiếp)
  Sau khi ấn "Hoàn thành" sẽ hiện ra 2 button:
  - Nếu trên webpage chưa có `<script src="khplayer.js"></script>`, nhấn "Tạo mới":
    
    <details>
      <summary>Xem thêm</summary>

      - Nhấn "Tải file JSON", upload lên cloud có direct link ([đọc phần này](#tips))
      - Nhấn "Sao chép container", dán vào vị trí muốn đặt playlist player trên webpage (dùng id khác nhớ edit phần tử cuối trong file JSON vừa tải).
      - Tiếp đến thêm `<script>` này vào webpage, chỗ nào cũng được:
        ```html
        <script defer src="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@5.3/dist/khplayer.min.js" jsonPath='<array (các) đường dẫn đến file JSON>'></script>
        ```
      - Phần "array các đường dẫn đến fle JSON" dán link trực tiếp file .json

          ```javascript
          jsonPath='["//example.com/KHP_123456.json"]'
          // Ngoài cùng là ngoặc đơn, bọc quanh các phần tử là ngoặc kép
        ```
      
    </details>

  - Nếu webpage đã có `<script src="khplayer.js"><script>`:
    <details>
      <summary>Xem thêm</summary>

      - Cũng nhấn "Tạo mới" Làm bước 1 và 2 như trên.
      - Thêm đường dẫn tới file JSON mới này vào array jsonPath nằm trong thẻ ```<script>``` trên ví dụ:

          ```javascript
          jsonPath='["//example.com/KHP_123456.json","//example.com/KHP_654321.json"]'
          ```

    </details>

  - Nếu thêm video vào playlist player đã tạo trước đó, nhấn "Thêm vào playlist đã có", copy đoạn data được generate và thêm vào array trong file JSON trước 2 element cuối.