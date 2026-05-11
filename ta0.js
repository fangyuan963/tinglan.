/* ── 百度统计初始化检查 ── */
window._hmt = window._hmt || [];

/* ── CARD DATA ── */
const CARDS = [
  {id:1,  name:'麻木', num:'I',    col:['#f5f0e8','#7a9e8e'], img:'cards/1.png.png', meaning:'感受被关闭，对外界失去连接。'},
  {id:2,  name:'紧绷', num:'II',   col:['#f5f0e8','#c4857a'], img:'cards/2.png.png', meaning:'内在持续用力，无法放松。'},
  {id:3,  name:'怀疑', num:'III',  col:['#f5f0e8','#8b9ea8'], img:'cards/3.png.png', meaning:'对自我或选择产生动摇。'},
  {id:4,  name:'渴望', num:'IV',   col:['#faf6ee','#c8a97e'], img:'cards/4.png.png', meaning:'有未被满足的深层需求。'},
  {id:5,  name:'淹没', num:'V',    col:['#f5f0e8','#c8a97e'], img:'cards/5.png.png', meaning:'情绪过载，难以承载。'},
  {id:6,  name:'断联', num:'VI',   col:['#f5f0e8','#7a9e8e'], img:'cards/6.png.png', meaning:'与自我/他人失去连接。'},
  {id:7,  name:'看见', num:'VII',  col:['#faf6ee','#c4857a'], img:'cards/7.png.png', meaning:'开始观察，而不是卷入。'},
  {id:8,  name:'允许', num:'VIII', col:['#f5f0e8','#8b9ea8'], img:'cards/8.png.png', meaning:'停止对抗情绪。'},
  {id:9,  name:'松动', num:'IX',   col:['#f5f0e8','#c4857a'], img:'cards/9.png.png', meaning:'内在开始放松。'},
  {id:10, name:'重构', num:'X',    col:['#f5f0e8','#1a1614'], img:'cards/10.png.png', meaning:'重新理解这段经历。'},
  {id:11, name:'回归', num:'XI',   col:['#faf6ee','#d4a853'], img:'cards/11.png.png', meaning:'回到自身中心。'},
  {id:12, name:'选择', num:'XII',  col:['#f5f0e8','#8b9ea8'], img:'cards/12.png.png', meaning:'意识到自己有主动权。'},
  {id:13, name:'释放', num:'XIII', col:['#f5f0e8','#7a9e8e'], img:'cards/13.png.png', meaning:'让情绪流动出去。'},
  {id:14, name:'暂停', num:'XIV',  col:['#f5f0e8','#1a1614'], img:'cards/14.png.png', meaning:'不再自动反应。'},
  {id:15, name:'边界', num:'XV',   col:['#faf6ee','#c8a97e'], img:'cards/15.png.png', meaning:'保护自己的能量。'},
  {id:16, name:'连接', num:'XVI',  col:['#f5f0e8','#8b9ea8'], img:'cards/16.png.png', meaning:'主动建立支持。'},
  {id:17, name:'行动', num:'XVII', col:['#f5f0e8','#8b9ea8'], img:'cards/17.png.png', meaning:'做一个小改变。'},
  {id:18, name:'信任', num:'XVIII',col:['#faf6ee','#d4a853'], img:'cards/18.png.png', meaning:'接纳过程本身。'},
];

const SPREAD_LABELS = {single:['当下'], triple:['过去','当下','未来']};

/* ── STATE ── */
let currentSpread = null;
let isShuffling = false;
let fanReady = false;
let fanCards = [];
let selectedFanIdxs = [];
let drawnList = [];
let flippedCount = 0;
let interpreting = false;
let feedbackSubmitted = false;
const NEED = {single:1, triple:3};

/* ── CHAR COUNT ── */
document.getElementById('questionInput').addEventListener('input', function(){
  document.getElementById('charCount').textContent = `${this.value.length} / 100`;
});

/* ── SPREAD SELECT ── */
function selectSpread(type, el) {
  currentSpread = type;
  document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  resetFanAndDrawn();
  renderFrames();
}

function renderFrames() {
  const framesContainer = document.getElementById('spreadFrames');
  const labels = SPREAD_LABELS[currentSpread];
  
  // 清空现有画框
  framesContainer.innerHTML = '';
  
  // 创建对应数量的画框
  labels.forEach((label, idx) => {
    const frameSlot = document.createElement('div');
    frameSlot.className = 'frame-slot';
    frameSlot.dataset.slotIdx = idx;
    frameSlot.innerHTML = `
      <div class="empty-hint">${label}</div>
    `;
    
    // 延迟显示画框产生动画效果
    setTimeout(() => {
      frameSlot.classList.add('show');
    }, idx * 100);
    
    framesContainer.appendChild(frameSlot);
  });
  
  // 显示画框区域
  framesContainer.style.display = 'flex';
}

function resetFanAndDrawn() {
  selectedFanIdxs = [];
  drawnList = [];
  flippedCount = 0;
  document.getElementById('drawnCardsRow').innerHTML = '';
  document.getElementById('drawnHint').classList.remove('show');
  document.getElementById('interpretBtn').classList.remove('ready');
  document.getElementById('readingSection').classList.remove('show');
  
  // 重置画框状态
  document.querySelectorAll('.frame-slot').forEach((slot, idx) => {
    slot.classList.remove('has-card');
    const labels = SPREAD_LABELS[currentSpread];
    slot.innerHTML = `<div class="empty-hint">${labels[idx] || ''}</div>`;
  });
  
  fanCards.forEach(fc => {
    fc.selected = false;
    fc.el.classList.remove('selected');
    fc.el.style.transition = 'transform 0.35s ease';
    fc.el.style.transform = `rotate(${fc.angle}deg)`;
    fc.el.style.zIndex = fc.zBase;
  });
  updateFanLabel();
}

/* ── SHUFFLE ── */
function startShuffle() {
  if (isShuffling) return;
  if (!currentSpread) {
    alert('请先选择牌阵');
    return;
  }
  isShuffling = true;
  
  // 重置反馈状态，允许新一轮解读提交反馈
  feedbackSubmitted = false;
  document.querySelectorAll('.fb-btn').forEach(b => {
    b.classList.remove('selected');
    b.style.opacity = '';
    b.style.pointerEvents = '';
  });
  document.getElementById('feedbackMessage').classList.remove('show');

  const btn = document.getElementById('shuffleBtn');
  btn.disabled = true;
  document.getElementById('shuffleBtnLabel').textContent = '洗 牌 中…';

  resetFanAndDrawn();
  fanCards = [];
  fanReady = false;

  const wrap = document.getElementById('shuffleStageWrap');
  wrap.classList.add('visible');

  const fanCont = document.getElementById('fanContainer');
  fanCont.classList.remove('show');
  fanCont.innerHTML = '';

  const deck = document.getElementById('deckPile');
  deck.style.display = 'flex';
  deck.style.opacity = '1';
  deck.style.transform = '';
  deck.style.transition = '';
  deck.innerHTML = '<div class="deck-shadow"></div>';

  const pileCards = [];
  for (let i = 0; i < 18; i++) {
    const pc = document.createElement('div');
    pc.style.cssText = `
      position:absolute; width:84px; height:136px;
      background:#1a1614; border:1.5px solid rgba(212,168,83,0.22);
      border-radius:4px; left:50%; transform:translateX(-50%) rotate(${(Math.random()-0.5)*2}deg);
      bottom:${i*0.5}px; box-shadow:0 2px 8px rgba(26,22,20,0.28);
      transition: transform 0.22s ease, bottom 0.18s ease;
    `;
    deck.appendChild(pc);
    pileCards.push(pc);
  }

  let ri = 0;
  const riffleTotal = 22;

  function riffle() {
    if (ri >= riffleTotal) { phaseOverhand(); return; }
    const pc = pileCards[ri % 18];
    const dir = ri % 2 === 0 ? 1 : -1;
    const arcH = 28 + Math.random() * 55;
    const shiftX = dir * (18 + Math.random() * 38);
    const rot = dir * (8 + Math.random() * 22);
    pc.style.transition = 'transform 0.2s cubic-bezier(0.4,0,0.2,1)';
    pc.style.transform = `translateX(calc(-50% + ${shiftX}px)) translateY(-${arcH}px) rotate(${rot}deg)`;
    setTimeout(() => {
      pc.style.transition = 'transform 0.16s ease-in';
      pc.style.transform = `translateX(-50%) rotate(${(Math.random()-0.5)*1.5}deg)`;
    }, 210);
    ri++;
    const delay = ri < 6 ? 90 : ri < 14 ? 68 : 48;
    setTimeout(riffle, delay);
  }
  riffle();

  function phaseOverhand() {
    let s = 0;
    function sh() {
      if (s >= 8) { phaseFanOut(); return; }
      const d = s % 2 === 0 ? 1 : -1;
      deck.style.transition = 'transform 0.1s ease-in-out';
      deck.style.transform = `translateX(${d*16}px) rotate(${d*1.8}deg)`;
      s++;
      setTimeout(sh, 100);
    }
    sh();
  }

  function phaseFanOut() {
    deck.style.transition = 'transform 0.25s ease-out';
    deck.style.transform = 'translateX(0) rotate(0)';

    setTimeout(() => {
      pileCards.forEach((pc, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = 60 + Math.random() * 80;
        const dx = Math.cos(a) * r, dy = Math.sin(a) * r;
        const rot = (Math.random() - 0.5) * 60;
        pc.style.transition = `transform 0.5s cubic-bezier(0.4,0,1,1), opacity 0.4s ease`;
        pc.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${-dy}px) rotate(${rot}deg)`;
        pc.style.opacity = '0';
      });

      setTimeout(() => {
        deck.style.display = 'none';
        fanCont.classList.add('show');
        buildFan();
        setTimeout(() => {
          fanReady = true;
          isShuffling = false;
          btn.disabled = false;
          document.getElementById('shuffleBtnLabel').textContent = '✦ 洗牌 ✦';
          updateFanLabel();
        }, 18 * 30 + 300);
      }, 260);
    }, 260);
  }
}

/* ── BUILD FAN ── */
function buildFan() {
  const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
  const fanCont = document.getElementById('fanContainer');
  fanCont.innerHTML = '';
  fanCards = [];

  const n = 18;

  shuffled.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'fan-card';
    el.innerHTML = `
      <div class="card-inner">
        <div class="cb-pat"></div>
        <div class="cb-bdr">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 4L28 16L16 28L4 16Z" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="0.7" fill="none"/>
            <path d="M16 4L16 11M16 21L16 28M4 16L11 16M21 16L28 16" stroke="currentColor" stroke-width="0.45"/>
          </svg>
        </div>
      </div>
    `;
    el.style.opacity = '0';
    fanCont.appendChild(el);

    setTimeout(() => {
      el.style.transition = 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.18,0.64,1)';
      el.style.opacity = '1';
    }, i * 25);

    const fc = {el, card, selected: false};
    fanCards.push(fc);

    el.addEventListener('mouseenter', () => {
      if (fc.selected || !fanReady) return;
      el.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      if (fc.selected || !fanReady) return;
      el.classList.remove('hovered');
    });

    el.addEventListener('click', () => handleFanClick(fc, i));
  });
}

/* ── FAN CLICK ── */
function handleFanClick(fc, i) {
  if (!fanReady) return;
  const need = NEED[currentSpread];

  if (fc.selected) {
    fc.selected = false;
    fc.el.classList.remove('selected');
    fc.el.style.zIndex = fc.zBase;
    fc.el.style.transform = `rotate(${fc.angle}deg)`;
    selectedFanIdxs = selectedFanIdxs.filter(x => x !== i);
    const drawnIdx = drawnList.findIndex(d => d.fanIdx === i);
    if (drawnIdx !== -1) {
      removeDrawnByIndex(drawnIdx);
    }
    updateFanLabel();
    return;
  }

  if (selectedFanIdxs.length >= need) {
    let s = 0;
    const origT = `rotate(${fc.angle}deg)`;
    function wig() {
      if (s >= 5) { fc.el.style.transform = origT; return; }
      fc.el.style.transition = 'transform 0.07s ease-in-out';
      fc.el.style.transform = `rotate(${fc.angle}deg) translateX(${s%2===0?6:-6}px)`;
      s++; setTimeout(wig, 75);
    }
    wig();
    return;
  }

  fc.selected = true;
  fc.el.classList.add('selected');
  selectedFanIdxs.push(i);
  fc.el.style.zIndex = 25;
  fc.el.style.transition = 'transform 0.4s cubic-bezier(0.34,1.32,0.64,1)';
  fc.el.style.transform = `rotate(${fc.angle}deg) translateY(-34px) scale(1.09)`;

  const slotIdx = drawnList.length;
  drawnList.push({card: fc.card, reversed: false, fanIdx: i, slotIdx});
  renderDrawnCard(slotIdx, fc.card, false);
  updateFanLabel();

  if (selectedFanIdxs.length === need) {
    setTimeout(() => document.getElementById('drawnHint').classList.add('show'), 350);
  }
}

/* ── RENDER DRAWN CARD ── */
function renderDrawnCard(slotIdx, card, reversed) {
  const labels = SPREAD_LABELS[currentSpread];
  const label = labels[slotIdx] || '';
  const cA = card.col[0], cB = card.col[1];
  
  // 获取对应的画框
  const frameSlot = document.querySelector(`.frame-slot[data-slot-idx="${slotIdx}"]`);
  
  const wrap = document.createElement('div');
  wrap.className = 'drawn-card-wrap';
  wrap.dataset.slotIdx = slotIdx;
  wrap.style.animationDelay = `${slotIdx * 0.1}s`;

  wrap.innerHTML = `
    <div class="drawn-card" id="dc-${slotIdx}">
      <div class="dc-back">
        <div class="cbp"></div>
        <div class="cbb">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 4L28 16L16 28L4 16Z" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="0.7" fill="none"/>
            <path d="M16 4L16 11M16 21L16 28M4 16L11 16M21 16L28 16" stroke="currentColor" stroke-width="0.45"/>
          </svg>
        </div>
        <div class="dbl-hint">double tap</div>
      </div>
      <div class="dc-front">
        <div class="f-art">
          <img src="${card.img}" alt="${card.name}" style="${reversed?'transform:rotate(180deg)':''}"/>
        </div>
        <div class="f-info">
          <div class="f-num">${card.num}</div>
          <div class="f-name">${card.name}</div>
        </div>
      </div>
    </div>
    <div class="drawn-card-label">${label}</div>
  `;

  const dc = wrap.querySelector('.drawn-card');
  let lastTap = 0;
  function onActivate(e) {
    if (e.type === 'dblclick') {
      flipDc(dc);
    } else if (e.type === 'touchend') {
      const now = Date.now();
      if (now - lastTap < 300) flipDc(dc);
      lastTap = now;
    }
  }
  dc.addEventListener('dblclick', onActivate);
  dc.addEventListener('touchend', onActivate);

  // 将卡牌放入画框
  if (frameSlot) {
    frameSlot.classList.add('has-card');
    frameSlot.innerHTML = ''; // 移除提示文字
    frameSlot.appendChild(wrap);
  }
}

function flipDc(dc) {
  if (dc.classList.contains('flipped')) return;
  dc.classList.add('flipped');
  flippedCount++;
  const need = NEED[currentSpread];
  if (drawnList.length === need && flippedCount >= need) {
    setTimeout(() => {
      document.getElementById('interpretBtn').classList.add('ready');
      document.getElementById('drawnHint').classList.remove('show');
    }, 380);
  }
}

function removeDrawnByIndex(drawnIdx) {
  const removed = drawnList.splice(drawnIdx, 1)[0];
  
  // 恢复画框状态
  const frameSlot = document.querySelector(`.frame-slot[data-slot-idx="${removed.slotIdx}"]`);
  if (frameSlot) {
    frameSlot.classList.remove('has-card');
    const labels = SPREAD_LABELS[currentSpread];
    frameSlot.innerHTML = `<div class="empty-hint">${labels[removed.slotIdx] || ''}</div>`;
  }
  
  const wasFlipped = document.querySelector(`#dc-${removed.slotIdx}.flipped`);
  if (wasFlipped) flippedCount = Math.max(0, flippedCount - 1);
  
  const need = NEED[currentSpread];
  if (drawnList.length < need) {
    document.getElementById('interpretBtn').classList.remove('ready');
    document.getElementById('drawnHint').classList.remove('show');
  }
}

/* ── FAN LABEL ── */
function updateFanLabel() {
  const need = NEED[currentSpread];
  const got = selectedFanIdxs.length;
  const lbl = document.getElementById('fanLabel');
  if (!fanReady) { lbl.textContent = '从牌中选择'; return; }
  if (got < need) lbl.textContent = `点击选择第 ${got + 1} 张 / 共 ${need} 张`;
  else lbl.textContent = `已选 ${got} 张 · 双击卡牌翻开`;
}

/* ── INTERPRET ── */
function interpret() {
  if (interpreting) return;
  
  const question = document.getElementById('questionInput').value.trim();
  
  if (!question) {
    document.getElementById('noQuestionModal').style.display = 'flex';
    return;
  }
  
  doInterpret();
}

function doInterpret() {
  interpreting = true;
  const btn = document.getElementById('interpretBtn');
  btn.style.opacity = '0.38'; btn.style.pointerEvents = 'none';
  document.getElementById('readingSection').classList.remove('show');
  document.getElementById('loadingDots').classList.remove('show');
  
  // 进度状态文字数组
  const progressMessages = [
    '正在拾取波澜...',
    '抽取情绪卡牌...',
    '解读牌面信息...',
    '梳理情绪脉络...',
    '生成解读内容...'
  ];
  
  // 显示进度动画
  const progress = document.getElementById('interpretProgress');
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  progress.style.display = 'flex';
  progressText.textContent = progressMessages[0];
  progressFill.style.width = '0%';
  
  // 进度计数器
  let progressIndex = 0;
  let progressPercent = 0;
  
  // 更新进度动画
  const progressInterval = setInterval(() => {
    if (progressIndex < progressMessages.length) {
      progressText.textContent = progressMessages[progressIndex];
      progressIndex++;
      progressPercent = Math.min(progressPercent + 25, 100);
      progressFill.style.width = progressPercent + '%';
    }
  }, 500);

  // 准备卡牌数据
  const cards = drawnList.map(item => ({
    id: item.card.id,
    name: item.card.name,
    num: item.card.num,
    meaning: item.card.meaning
  }));
  
  const question = document.getElementById('questionInput').value.trim();

  // 调用后端API
  fetch('/api/interpret', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question, cards })
  })
  .then(response => response.json())
  .then(result => {
    // 清除进度动画
    clearInterval(progressInterval);
    progress.style.display = 'none';
    progressFill.style.width = '0%';
    
    if (result.success) {
      // 显示AI解读结果
      let readingHtml = '';
      drawnList.forEach((item, idx) => {
        const labels = SPREAD_LABELS[currentSpread];
        const label = labels[idx] || '';
        readingHtml += `
          <div style="margin-bottom:24px;">
            <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:#d4a853;margin-bottom:8px;">${label}</div>
            <div style="font-family:'Cinzel',serif;font-size:14px;color:#1a1614;margin-bottom:8px;">${item.card.name}</div>
            <p style="font-size:15px;line-height:2.1;color:#1a1614;opacity:0.85;">${item.card.meaning}</p>
          </div>
        `;
      });
      // 添加AI解读
      readingHtml += `
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(212,168,83,0.2);">
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:#d4a853;margin-bottom:12px;">AI 解读</div>
          <p style="font-size:16px;line-height:2.2;color:#1a1614;">${result.interpretation}</p>
        </div>
      `;
      
      document.getElementById('readingText').innerHTML = readingHtml;
    } else {
      // 显示错误信息
      document.getElementById('readingText').innerHTML = `
        <p style="color:#c4857a;text-align:center;">${result.message}</p>
      `;
    }
    
    document.getElementById('readingSection').classList.add('show');
    document.querySelectorAll('.fb-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('feedbackThanks').classList.remove('show');
    interpreting = false;
    btn.style.opacity = ''; btn.style.pointerEvents = '';
    document.getElementById('readingSection').scrollIntoView({behavior:'smooth',block:'start'});
  })
  .catch(error => {
    // 清除进度动画
    clearInterval(progressInterval);
    progress.style.display = 'none';
    progressFill.style.width = '0%';
    
    console.error('解读请求失败:', error);
    document.getElementById('readingText').innerHTML = `
      <p style="color:#c4857a;text-align:center;">网络连接失败，请检查后端服务是否启动</p>
    `;
    document.getElementById('readingSection').classList.add('show');
    interpreting = false;
    btn.style.opacity = ''; btn.style.pointerEvents = '';
  });
}

function closeNoQuestionModal() {
  document.getElementById('noQuestionModal').style.display = 'none';
}

function continueInterpret() {
  closeNoQuestionModal();
  doInterpret();
}

function goToQuestionInput() {
  closeNoQuestionModal();
  document.getElementById('questionInput').focus();
  document.getElementById('questionInput').scrollIntoView({behavior:'smooth',block:'center'});
}

/* ── FEEDBACK ── */
// 反馈计数统计
const feedbackCounts = {
  accurate: 0,
  interesting: 0,
  irrelevant: 0
};

// 反馈弹窗配置
const feedbackConfig = {
  accurate: {
    icon: '✓',
    title: '心有灵犀',
    message: '很高兴这次解读能与你的内心产生共鸣。每一个准确的回应，都是你与潜意识的深度连接。继续保持这份觉察，让内在的智慧引导你前行。'
  },
  interesting: {
    icon: '◈',
    title: '有所启发',
    message: '解读中的某些部分触动了你，这本身就是一种收获。有时候，最珍贵的洞见需要时间来慢慢沉淀。请允许这些信息在你内心自然发酵。'
  },
  irrelevant: {
    icon: '○',
    title: '保持开放',
    message: '这次的解读可能暂时还未与你产生共鸣。请记住，听澜是一面镜子，它反映的是当下的状态。也许在未来的某个时刻，这些信息会变得清晰起来。'
  }
};

function feedback(el) {
  // 如果已经提交过反馈，不允许再次点击
  if (feedbackSubmitted) return;
  
  const fbType = el.dataset.fbType;
  
  // 更新计数
  feedbackCounts[fbType]++;
  
  // 设置反馈已提交状态
  feedbackSubmitted = true;
  
  // 百度统计埋点上报
  if (window._hmt) {
    _hmt.push(['_trackEvent', '情绪反馈', '点击', fbType]);
  }
  
  // 更新按钮状态
  document.querySelectorAll('.fb-btn').forEach(b => {
    b.classList.remove('selected');
    b.style.opacity = '0.4';
    b.style.pointerEvents = 'none';
  });
  el.classList.add('selected');
  el.style.opacity = '1';
  
  // 隐藏感谢文字
  document.getElementById('feedbackThanks').classList.remove('show');
  
  // 隐藏之前的消息
  const feedbackMsg = document.getElementById('feedbackMessage');
  feedbackMsg.classList.remove('show');
  
  // 延迟显示新消息以产生动画效果
  setTimeout(() => {
    const config = feedbackConfig[fbType];
    feedbackMsg.textContent = config.message;
    feedbackMsg.classList.add('show');
  }, 50);
  
  // 输出日志便于后期统计（可在浏览器控制台查看）
  console.log('反馈统计:', feedbackCounts);
}

function closeModal() {
  document.getElementById('feedbackModal').classList.remove('show');
}
