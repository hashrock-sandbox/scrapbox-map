var canvas = d3.select("canvas"),
  context = canvas.node().getContext("2d"),
  width = canvas.property("width"),
  height = canvas.property("height")

var color = d3.scaleOrdinal()
  .range(d3.schemeCategory20);

d3.json("sushitecture.json", (data) => {
  var local = {}
  if(localStorage.sbdrag){
    local = JSON.parse(localStorage.sbdrag)
  }

  var circles = data.pages.map((item, i) => {
    var radius = item.point > 1 ? 80 : 50;
    var x = Math.round(Math.random() * (width - radius * 2) + radius)
    var y = Math.round(Math.random() * (height - radius * 2) + radius)
    if(local[item.id]){
      x = local[item.id].x
      y = local[item.id].y
    }
    setItemPosition(item.id, x, y)

    return {
      index: i,
      x: x,
      y: y,
      r: radius,
      title: item.title,
      id: item.id
    }
  })

  saveItems()

  var render = function () {
    context.clearRect(0, 0, width, height);
    for (var i = 0, n = circles.length, circle; i < n; ++i) {
      circle = circles[i];
      context.beginPath();
      context.moveTo(circle.x + circle.r, circle.y);
      context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
      context.fillStyle = color(circle.index);
      context.fill();
      context.textAlign = "center";

      var fontSize = circle.r > 50 ? 24 : 8
      context.font = "normal 400 " + fontSize + "px/2 Unknown Font, sans-serif";

      context.fillStyle = "black";
      context.fillText(circle.title, circle.x, circle.y);
      if (circle.active) {
        context.lineWidth = 2;
        context.stroke();
      }
    }
  }

  canvas
    .call(d3.drag()
    .subject(dragsubject)
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
    .on("start.render drag.render end.render", render))
    
  render();
  function dragsubject() {
    for (var i = circles.length - 1, circle, x, y; i >= 0; --i) {
      circle = circles[i];
      x = circle.x - d3.event.x;
      y = circle.y - d3.event.y;
      if (x * x + y * y < circle.r * circle.r) return circle;
    }
  }
  var time = 0

  function dragstarted() {
    circles.splice(circles.indexOf(d3.event.subject), 1);
    circles.push(d3.event.subject);
    d3.event.subject.active = true;
    time = new Date().getTime()
  }

  function dragged() {
    d3.event.subject.x = d3.event.x;
    d3.event.subject.y = d3.event.y;
  }
  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

  function setItemPosition(id, x, y){
    local[id] = {}
    local[id].x = x
    local[id].y = y
  }
  function saveItems(){
    localStorage.sbdrag = JSON.stringify(local)
  }

  function dragended() {
    setItemPosition(d3.event.subject.id, d3.event.subject.x, d3.event.subject.y)
    saveItems()
    
    d3.event.subject.active = false;
    if(new Date().getTime() - time < 80){
      openInNewTab("https://scrapbox.io/sushitecture/" + d3.event.subject.title)
    }
  }
})