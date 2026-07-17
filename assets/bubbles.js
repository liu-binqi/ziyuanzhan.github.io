/* ===========================================================
   bubbles.js —— 全站“点击冒气泡”粒子特效
   纯前端、零依赖、零后端，GitHub Pages 可直接用。
   原理：
     1) 创建一块铺满全屏的 <canvas>（pointer-events:none，不挡点击）
     2) 监听全局 pointerdown，在点击坐标处生成一批“气泡”粒子
     3) 每个粒子有随机速度/大小/颜色，向上飘并左右摆动，逐渐淡出
     4) requestAnimationFrame 驱动动画循环，自动回收消失的粒子
   =========================================================== */
(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.id = 'fx-bubble-canvas';
  var s = canvas.style;
  s.position = 'fixed';
  s.left = '0';
  s.top = '0';
  s.width = '100%';
  s.height = '100%';
  s.pointerEvents = 'none';   // 关键：不拦截任何点击
  s.zIndex = '2147483647';    // 永远在最上层
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // 与全站科技风一致的霓虹色板
  var COLORS = ['#60a5fa', '#22d3ee', '#a78bfa', '#26de81', '#f472b6', '#fbbf24'];

  var bubbles = [];

  function spawn(x, y) {
    var n = 12 + Math.floor(Math.random() * 9);
    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 3.2;
      bubbles.push({
        x: x,
        y: y,
        // 初始向四周散开，并带一个向上的趋势
        vx: Math.cos(angle) * speed * 0.6 + (Math.random() - 0.5),
        vy: Math.sin(angle) * speed - (1.4 + Math.random() * 2.2),
        r: 2 + Math.random() * 6,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        wob: Math.random() * Math.PI * 2
      });
    }
    // 上限保护，避免极端情况下粒子堆积
    if (bubbles.length > 420) bubbles.splice(0, bubbles.length - 420);
  }

  // 全局监听：点击 / 触摸任意位置都冒泡（包括导航、按钮、空白区）
  window.addEventListener('pointerdown', function (e) {
    // 忽略在多行文本选区拖动产生的点击，避免刷屏
    if (window.getSelection && String(window.getSelection()).length > 0) return;
    spawn(e.clientX, e.clientY);
  }, { passive: true });

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.wob += 0.12;
      b.x += b.vx + Math.sin(b.wob) * 0.5;   // 左右摆动
      b.y += b.vy;
      b.vy += 0.018;                          // 轻微“重力”，先升后落更自然
      b.life -= b.decay;
      if (b.life <= 0) continue;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * Math.max(b.life, 0.12), 0, Math.PI * 2);
      ctx.globalAlpha = Math.max(b.life, 0);
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 14;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    bubbles = bubbles.filter(function (b) { return b.life > 0; });
    requestAnimationFrame(tick);
  }
  tick();
})();
