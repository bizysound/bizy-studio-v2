import { renderNav } from "../components/nav.js";
import { revealAnimation } from "../utils/animations.js";
import { gsap } from "gsap";
import * as Tone from "tone";

export function initHome() {
  renderNav();

  document.getElementById("app").innerHTML = `
    <main class="home-main">
      <!-- 页面右上角黑胶图标按钮（与左侧 LOGO 水平对齐） -->
      <div class="top-right-vinyl">
        <button class="vinyl-icon-btn" id="vinylIconBtn" title="开启黑胶氛围 (LOFI)">
          <span class="icon">📻</span>
        </button>
      </div>

      <!-- 首屏：工作室照片背景 -->
      <section class="hero hero-bg">
        <div class="hero-title align-left">
          <h1 class="reveal-text main-brand-title">Bizy Sound</h1>
          <h1 class="reveal-text accent hero-text" id="heroText">
            <span class="note-letter" data-note="C4">E</span>
            <span class="note-letter" data-note="E4">N</span>
            <span class="note-letter" data-note="G4">G</span>
            <span class="note-letter" data-note="B4">I</span>
            <span class="note-letter" data-note="D5">N</span>
            <span class="note-letter" data-note="E5">E</span>
            <span class="note-letter" data-note="G5">E</span>
            <span class="note-letter" data-note="A5">R</span>
            <span class="note-letter" data-note="B5">I</span>
            <span class="note-letter" data-note="D6">N</span>
            <span class="note-letter" data-note="E6">G</span>
          </h1>
        </div>
        <div class="scroll-hint">↓ SCROLL TO EXPLORE WORKS</div>
      </section>

      <!-- 下滑内容区：纯白色背景 -->
      <section class="content-section white-bg">
        <div class="section-container">
          <div class="section-title">01 / Web Development Tools (独立开发)</div>
          <div class="grid-container">
            <div class="glass-card" id="cardMidi">
              <div class="card-tag">WEB AUDIO</div>
              <div class="card-title">MIDI Visualizer 舞台</div>
              <div class="card-desc">内置和弦识别引擎与实时音符渲染的 Web MIDI 播放器，支持粒子效果与速度自适应。</div>
            </div>

            <div class="glass-card">
              <div class="card-tag">CREATIVE CODE</div>
              <div class="card-title">Web Audio Lab</div>
              <div class="card-desc">基于 Tone.js 与 Glassmorphism 设计的轻量级纯前端声学采样与可视化套件。</div>
            </div>
          </div>

          <div class="section-title">02 / Music Production & Projects (音乐作品)</div>
          <div class="grid-container">
            <div class="glass-card">
              <div class="card-tag">NEO-CLASSICAL</div>
              <div class="card-title">《围城》 Instrumental</div>
              <div class="card-desc">结合独奏琴弦与山间采样的大气纯音乐作品，描绘独立创作的静谧空间。</div>
            </div>

            <div class="glass-card">
              <div class="card-tag">INDIE / EMO TRAP</div>
              <div class="card-title">Summer Echoes 编曲</div>
              <div class="card-desc">融合日系 J-Pop 情绪与 Emo Trap 鼓组节奏的实验性 Instrumental 试听。</div>
            </div>
          </div>
        </div>
      </section>

      <footer class="site-footer white-bg">
        BIZY SOUND / MUSIC PRODUCER & WEB DEVELOPER. © 2026
      </footer>
    </main>
  `;

  revealAnimation();
  initHomeInteractions();
}

function initHomeInteractions() {
  let synth = null;
  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let isVinylPlaying = false;

  function initAudioEngine() {
    if (synth) return;

    // 琴键音效
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 1.2 }
    }).toDestination();
    synth.volume.value = -8;

    // Web Audio 生成黑胶底噪
    audioCtx = Tone.getContext().rawContext;
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.011;
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    noiseNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  }

  // 琴键滑动触发
  const letters = document.querySelectorAll(".note-letter");
  letters.forEach(letter => {
    letter.addEventListener("mouseenter", async () => {
      if (Tone.context.state !== "running") await Tone.start();
      initAudioEngine();

      const note = letter.dataset.note;
      synth.triggerAttackRelease(note, "8n");
      letter.classList.add("active");

      gsap.to(letter, {
        y: -12,
        scale: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          letter.classList.remove("active");
          gsap.set(letter, { clearProps: "transform" });
        }
      });
    });
  });

  // 点击右上角图标开关声音
  const vinylBtn = document.getElementById("vinylIconBtn");
  if (vinylBtn) {
    vinylBtn.addEventListener("click", async () => {
      if (Tone.context.state !== "running") await Tone.start();
      initAudioEngine();

      if (!isVinylPlaying) {
        gainNode.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.5);
        vinylBtn.classList.add("playing");
      } else {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        vinylBtn.classList.remove("playing");
      }
      isVinylPlaying = !isVinylPlaying;
    });
  }

  // MIDI 卡片点击跳转
  const cardMidi = document.getElementById("cardMidi");
  if (cardMidi) {
    cardMidi.addEventListener("click", () => {
      window.location.href = "#/midi";
    });
  }
}

initHome();