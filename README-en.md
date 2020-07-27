<img src="dist/default_waiting.svg" width="100%" height="auto">

## **Main feature**
Generate a playlist player [like this](https://khplayer.delnegend.xyz/others/demo/) without touching CSS or JS.

<img src='others/README_Data/khplayer-demo.png'>

## **Other features**
- **Playlist.** *(KHPlayer)*
- Multiple sources/captions. *(Plyr)*
- Autoplay next episode. *(KHPlayer)*
- Multiple KHPlayer on a single webpage. *(KHPlayer)*
- Playback .m3u8 *(HLS)* + caption *(KHPlayer)*
- Save playing history. *(KHPlayer)*
- And more...

<hr>

## **Guide** (v6)
### A. Add all of these into `<head></head>`

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@6/dist/khplayer.min.css">
<script src="https://cdn.jsdelivr.net/gh/sampotts/plyr@3.6.2/dist/plyr.min.js"></script> 
<script src="https://cdn.jsdelivr.net/npm/hls.js@0.13.2/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/DELNEGEND/khplayer@6/dist/khplayer.min.js"></script>
```

<hr width='50%'>

### B. Prepare ingredients
- <details>
    <summary>Videos | Poster *(optional)*</summary>

  - video AVC (H264) + audio AAC + container .mp4 [read more](https://www.encoding.com/html5-video-codec/).<br>
  - Using [Handbrake](https://handbrake.fr/) or [ffmpeg](https://ffmpeg.org/download.html) to convert videos.
  - Poster can get from Google image.
  - Upload to cloud and get direct link ([1](#direct-link-tips)).
  
  </details>

- <details>
    <summary>Preview thumbnail *(optional)*</summary><br>

  <img src='others/README_Data/sprite-thumb-demo.png' style="max-width: 326px; width: 100%; height: auto">

  - Install [NodeJS](https://nodejs.org/), [ffmpeg](https://ffmpeg.org/download.html).
  - [Fill this form](https://khplayer.delnegend.xyz/others/genSpriteThumbCode/?lang=en), leave `Direct link thumbnail`.
  - Open `powershell/terminal` > `cd "D:\folder\that\contain\the\video.mp4"` > paste `Generate sprite thumb` > `Enter`.
  - Upload file .jpg to cloud, get direct link ([1](#direct-link-tips)), paste into `Direct link thumbnail` in the form. 
  - [Clone/download this repo](https://github.com/radiantmediaplayer/rmp-create-vtt-thumbnails) or [click here to download](https://github.com/DELNEGEND/khplayer/blob/master/others/README_Data/rmp-create-vtt-thumbnails.zip?raw=true) and extract it.
  - Return to `powershell/terminal` > `cd` to the repo folder > paste `Generate vtt file` from the form and `Enter`.
  - Upload to cloud doesn't have CORS blocking, get direct link ([1](#direct-link-tips)).<br>

  </details>

- <details>
    <summary>VTT caption (optional)</summary>
  
  - Convert .ass, .srt to .vtt: [Google](https://google.com)
  - Validate VTT: [quuz.org/webvtt/](https://quuz.org/webvtt/) | [backup site](https://khplayer.delnegend.xyz/others/VTT_Validation/)
  - Upload to cloud doesn't have CORS blocking, get direct link ([1](#direct-link-tips)).<br>
  
  </details>
<hr width='50%'>

### C. Build into playlist
  - Fill [this form](https://khplayer.delnegend.xyz/others/genScreen/?lang=en) (DL: direct link)<br>
  - After hitting `Complete`, there'll be 2 button 
    - `Create new` for, well, create a new one.
      - Hit `Download JSON file`, upload to cloud, get direct link ([1](#direct-link-tips)).
      - Hit `Copy` and paste into a desired position in your webpage. Edit `data` attribute if necessary.
    - `Existed` if you want to add data into an existed json file:
      - Hit `copy` and paste into a desired position in the json file.<br>

<hr width='50%'>

### D. Note
 - KHPlayer doesn't support multiple m3u8 sources (yet).

<hr>

<div id="direct-link-tips">

# (1) Direct link tips:
- File on Google Drive [<100MB](https://support.google.com/a/answer/172541?hl=en) use this url format: `https://drive.google.com/uc?export=download&id=xxxxxxxxxxxxxxxx`.
- [Fast.io](https://fast.io/) supports creating direct links using Google Drive, OneDrive, Dropbox, Box, MediaFire and GitHub. With a free plan you get 500MB/file and 100GB/month

- <details>
  <summary>If you're using static site generator like Jekyll of Hugo then you have a huge avantage</summary>
  
  - Files and `index.html` inside a same "level"<br><br>
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/same.png"><br>
    ```
    data.json
    ```
  - Files sit inside a children folder<br><br>
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/children.png"><br>
    ```
    assets/json/data.json
    assets/vtt/data.vtt
    ```
  - `index.html` sit inside a children folder<br><br>
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/parent.png"><br>
    ```
    ../data.json
    ```
  - Not sure why would anyone be using this but anyway<br>
    A single `/` sit at the very first position in a url meaning a root directory:

      ```
      /data.ext = "//example.com/data.ext"
      ```
    <img style="max-width: 300px; width: 100%; height: auto" src="others/README_Data/staticsite/root.png">

    - Inside `index.html`
      ```
      /assets/json/post2.data.json
      /assets/vtt/post3.subtitle.vtt
      
      OR
      
      assets/json/post2.data.json
      assets/vtt/post3.subtitle.vtt
      ```
    - Trong post2.html, post3.html
      ```
      /assets/json/post2.data.json
      /assets/vtt/post3.subtitle.vtt
      
      OR
      
      ../assets/json/post2.data.json
      ../assets/vtt/post3.subtitle.vtt
      ```

</details>
</div>
<hr>

# Credit
- [Plyr](https://plyr.io) - APIs, player, themes,...
- [hls.js](https://github.com/video-dev/hls.js/) - M3U8 library.
- [FontAwesome](https://fontawesome.com/) - next/prev, toggle menu button.
- [radiantmediaplayer](https://github.com/radiantmediaplayer) for providing a tutorial to how to create sprite thumbnail.