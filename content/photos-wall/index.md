---
title: "照片墙"
date: 2025-06-10
draft: false
lightgallery: false
---

<div class="photo-wall view-time" markdown="1">

## 瞬间

> 捕捉生活中的光影与切片

<div class="pw-filters">
  <button class="pw-filter active" data-view="time" type="button">时间</button>
  <button class="pw-filter" data-view="location" type="button">地点</button>
</div>

<div class="pw-view" markdown="1">

<section class="pw-group" data-location="深圳" markdown="1">
<h3><span class="pw-time-head"><i class="fa-regular fa-calendar"></i> 2026年6月</span><span class="pw-location-head"><i class="fa-solid fa-location-dot"></i> 深圳</span></h3>

![汉庭酒店](2026-06/jiudian.jpg)

![大梅沙](2026-06/IMG_20260607_132407.jpg)

![踏浪](2026-06/IMG_20260607_133117.jpg)

![戏水](2026-06/IMG_20260607_135154.jpg)

![棕榈](2026-06/IMG_20260607_162603.jpg)

![海滨公园](2026-06/IMG_20260607_163138.jpg)

![合影](2026-06/IMG_20260607_202638.jpg)

</section>

<section class="pw-group" data-location="杭州" markdown="1">
<h3><span class="pw-time-head"><i class="fa-regular fa-calendar"></i> 2026年5月</span><span class="pw-location-head"><i class="fa-solid fa-location-dot"></i> 杭州</span></h3>

![生日蛋糕](2026-05/IMG_20260517_140152.jpg)

</section>

</div>

</div>

<script type="application/json" id="pw-metadata">
{
  "汉庭酒店": {"date":"2026-06-15","camera":"HONOR 400 Pro","location":"深圳·汉庭酒店","note":"阴雨天"},
  "大梅沙": {"date":"2026-06-07","camera":"HONOR 400 Pro","location":"深圳·大梅沙","note":"初见大梅沙，海风拂面"},
  "踏浪": {"date":"2026-06-07","camera":"HONOR 400 Pro","location":"深圳·大梅沙","note":"彩色的浮板，彩色的午后"},
  "戏水": {"date":"2026-06-07","camera":"HONOR 400 Pro","location":"深圳·大梅沙","note":"海浪一波波推着夏天"},
  "棕榈": {"date":"2026-06-07","camera":"HONOR 400 Pro","location":"深圳·大梅沙","note":"南国的风穿过棕榈叶"},
  "海滨公园": {"date":"2026-06-07","camera":"HONOR 400 Pro","location":"深圳·大梅沙","note":"草坪把海拉到了眼前"},
  "合影": {"date":"2026-06-07","camera":"HONOR 400 Pro","location":"深圳·大梅沙","note":"海风里的我们"},
  "生日蛋糕": {"date":"2026-05-17","camera":"HONOR 400 Pro","location":"杭州","note":"烛光里的又一年"}
}
</script>

<div class="pw-lightbox" id="pw-lightbox" hidden>
  <div class="pw-lightbox-bg" id="pw-lightbox-bg"></div>
  <button class="pw-lightbox-btn pw-lightbox-close" id="pw-close" type="button" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
  <button class="pw-lightbox-btn pw-lightbox-nav pw-lightbox-prev" id="pw-prev" type="button" aria-label="上一张"><i class="fa-solid fa-chevron-left"></i></button>
  <button class="pw-lightbox-btn pw-lightbox-nav pw-lightbox-next" id="pw-next" type="button" aria-label="下一张"><i class="fa-solid fa-chevron-right"></i></button>
  <div class="pw-lightbox-content" id="pw-content">
    <div class="pw-stage"><img class="pw-full-img" id="pw-full-img" alt=""></div>
    <div class="pw-plaque">
      <div class="pw-plaque-note" id="pw-note"></div>
      <div class="pw-plaque-divider"></div>
      <div class="pw-plaque-meta">
        <div class="pw-meta-row"><i class="fa-regular fa-calendar"></i><span id="pw-datetime"></span></div>
        <div class="pw-meta-row"><i class="fa-solid fa-camera"></i><span id="pw-camera"></span></div>
        <div class="pw-meta-row"><i class="fa-solid fa-location-dot"></i><span id="pw-location"></span></div>
      </div>
    </div>
  </div>
</div>

<script>
(function () {
  var wall = document.querySelector('.photo-wall');
  if (!wall) return;
  var view = wall.querySelector('.pw-view');
  var filterBtns = wall.querySelectorAll('.pw-filter');
  var groups = Array.prototype.slice.call(view.querySelectorAll('.pw-group'));

  /* === 时间/地点过滤 === */
  function showTime() {
    groups.forEach(function (g) {
      g.classList.remove('pw-dup-head');
      view.appendChild(g);
    });
  }
  function showLocation() {
    var locMap = {}, locOrder = [];
    groups.forEach(function (g) {
      var loc = g.getAttribute('data-location');
      if (!locMap[loc]) { locMap[loc] = []; locOrder.push(loc); }
      locMap[loc].push(g);
    });
    locOrder.forEach(function (loc) {
      locMap[loc].forEach(function (g, i) {
        g.classList.toggle('pw-dup-head', i > 0);
        view.appendChild(g);
      });
    });
  }
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-view');
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      wall.classList.remove('view-time', 'view-location');
      wall.classList.add('view-' + target);
      if (target === 'location') showLocation(); else showTime();
    });
  });

  /* === 自定义灯箱 === */
  var metaScript = document.getElementById('pw-metadata');
  var metadata = metaScript ? JSON.parse(metaScript.textContent) : {};
  var imgs = Array.prototype.slice.call(view.querySelectorAll('img'));

  // 为每张图片存好大图 URL（取 srcset 最大尺寸）
  imgs.forEach(function (img) {
    var srcset = img.getAttribute('srcset') || '';
    var largest = '';
    if (srcset) {
      var entries = srcset.split(',').map(function (s) { return s.trim(); });
      largest = entries[entries.length - 1].split(' ')[0];
    }
    img.dataset.full = largest || img.src;
  });

  var lightbox = document.getElementById('pw-lightbox');
  var lbBg = document.getElementById('pw-lightbox-bg');
  var lbClose = document.getElementById('pw-close');
  var lbPrev = document.getElementById('pw-prev');
  var lbNext = document.getElementById('pw-next');
  var lbImg = document.getElementById('pw-full-img');
  var lbNote = document.getElementById('pw-note');
  var lbDatetime = document.getElementById('pw-datetime');
  var lbCamera = document.getElementById('pw-camera');
  var lbLocation = document.getElementById('pw-location');
  var current = -1;

  function open(index) {
    current = index;
    var img = imgs[index];
    var m = metadata[img.alt] || {};
    lbImg.src = img.dataset.full;
    lbImg.alt = img.alt;
    lbNote.textContent = m.note || '';
    function fillMeta(span, val) {
      span.textContent = val || '';
      var row = span.closest('.pw-meta-row');
      if (row) row.style.display = val ? '' : 'none';
    }
    fillMeta(lbDatetime, m.date);
    fillMeta(lbCamera, m.camera);
    fillMeta(lbLocation, m.location);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      lightbox.classList.add('show');
    });
  }

  function close() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(function () {
      lightbox.setAttribute('hidden', '');
      lbImg.src = '';
    }, 350);
  }

  function nav(dir) {
    open((current + dir + imgs.length) % imgs.length);
  }

  imgs.forEach(function (img, i) {
    img.addEventListener('click', function () { open(i); });
  });
  lbClose.addEventListener('click', close);
  lbBg.addEventListener('click', close);
  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); nav(-1); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); nav(1); });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') nav(-1);
    else if (e.key === 'ArrowRight') nav(1);
  });
})();
</script>
