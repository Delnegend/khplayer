function test() {
  var pa = new WebVTTParser(),
    r = pa.parse(document.getElementsByTagName("textarea")[0].value, document.getElementById("kind").value)
  var ol = document.getElementsByTagName("ol")[0],
    p = document.getElementById("status"),
    pre = document.getElementsByTagName("pre")[0]
  ol.textContent = ""
  if (r.errors.length > 0) {
    if (r.errors.length == 1)
      p.textContent = "Almost there!"
    else if (r.errors.length < 5)
      p.textContent = "Not bad, keep at it!"
    else
      p.textContent = "You are hopeless, RTFS."
    for (var i = 0; i < r.errors.length; i++) {
      var error = r.errors[i],
        message = "Line " + error.line,
        li = document.createElement("li")
      if (error.col)
        message += ", column " + error.col
      li.textContent = message + ": " + error.message
      ol.appendChild(li)
    }
  } else {
    p.textContent = "This is boring, your WebVTT is valid!"
  }
  p.textContent += " (" + r.time + "ms)"
  var s = new WebVTTSerializer()
  pre.textContent = s.serialize(r.cues)
}
test()
function debug(url) {
  var hmm = url.slice(url.indexOf("#")) == "#debug"
  document.getElementsByTagName("pre")[0].hidden = hmm ? false : true
}
onhashchange = function (e) { debug(e.newURL) }
debug(location.href)