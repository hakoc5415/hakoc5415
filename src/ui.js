// POLARA — UI katmanı
// Tasarım şablonundaki ekranların birebir DOM karşılığı.
// Olay bağlama: data-click / data-input / data-pd öznitelikleri main.js'te delegasyonla dinlenir;
// data-stop, prototipteki stopPropagation davranışının karşılığıdır (oyun girdisine düşmez).

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderUI(app) {
  const v = app.renderVals();
  const H = app.regHandler; // (fn) => handler id
  const out = [];

  // ---- 1. Açılış (splash) ----
  if (v.showSplash) {
    out.push(`
    <div data-click="${H(v.onSplashTap)}" style="position: absolute; inset: 0; z-index: 50; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(10px, 2.4vh, 20px); text-align: center; padding: 24px; background: #000000; cursor: pointer; overflow: hidden;">
      <div style="position: absolute; width: 96vmin; height: 96vmin; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0%, rgba(111,215,168,0.16) 10%, transparent 28%, rgba(201,165,255,0.13) 42%, transparent 58%, rgba(47,168,201,0.16) 72%, transparent 90%); filter: blur(34px); animation: raySpin 18s linear infinite;"></div>
      <div style="position: absolute; width: 60vmin; height: 60vmin; border-radius: 50%; background: conic-gradient(from 180deg, transparent 0%, rgba(142,245,200,0.1) 20%, transparent 45%, rgba(165,200,255,0.1) 70%, transparent 95%); filter: blur(26px); animation: raySpin 26s linear infinite reverse;"></div>
      <div style="position: absolute; width: 130vmin; height: 78vmin; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,0.92), rgba(0,0,0,0.6) 55%, transparent 100%);"></div>
      <div style="position: relative; z-index: 1; font-family: 'Space Grotesk', sans-serif; font-size: clamp(11px, 1.9vh, 13px); letter-spacing: 0.42em; color: #7c8db0; text-transform: uppercase; animation: splashText 0.7s ease 0.3s both;">Presented by</div>
      <div style="position: relative; z-index: 1; animation: floatY 5s ease-in-out 2.4s infinite;">
        <div style="display: flex; align-items: center; gap: clamp(14px, 2.4vw, 24px); width: clamp(250px, 42vw, 440px); animation: logoWipe 1.3s cubic-bezier(0.65, 0, 0.35, 1) 0.7s both;">
          <svg viewBox="0 0 200 200" style="width: clamp(64px, 10vw, 104px); height: auto; flex-shrink: 0;">
            <circle cx="100" cy="27" r="13" fill="#1C9FE5"></circle>
            <path d="M32 103 L98 69" stroke="#1C9FE5" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <path d="M99 67 Q132 73 167 99" stroke="#23B26D" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <path d="M32 159 L98 125" stroke="#1C9FE5" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <path d="M99 123 Q132 129 167 155" stroke="#23B26D" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <circle cx="100" cy="181" r="13" fill="#1C9FE5"></circle>
          </svg>
          <div style="text-align: left;">
            <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(28px, 4.8vw, 48px); letter-spacing: 0.04em; line-height: 1.05; background: linear-gradient(90deg, #1C9FE5, #23B26D); -webkit-background-clip: text; background-clip: text; color: transparent;">NORIENT</div>
            <div style="margin-top: 6px; font-family: 'Space Grotesk', sans-serif; font-size: clamp(10px, 1.5vw, 14px); letter-spacing: 0.2em; color: #8b9ab5;">Innovation &amp; Development</div>
          </div>
        </div>
      </div>
      <div style="position: relative; z-index: 1; width: clamp(200px, 30vw, 340px); height: 2px; border-radius: 2px; background: linear-gradient(90deg, #2fa8c9, #6fd7a8, #c9a5ff); transform-origin: left center; animation: lineGrow 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.8s both;"></div>
      <div data-stop style="position: absolute; top: calc(14px + env(safe-area-inset-top)); right: calc(16px + env(safe-area-inset-right)); z-index: 5; display: flex; flex-direction: column; align-items: flex-end; animation: splashText 0.8s ease 1s both;">
        <button data-click="${H(v.onToggleLang)}" style="display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid ${v.langBtnBorder}; background: linear-gradient(160deg, rgba(16,24,48,0.85), rgba(6,10,24,0.85)); color: #f2f6ff; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: ${v.langBtnGlow}; transition: border-color 0.2s ease, box-shadow 0.2s ease;">
          <span style="font-size: 16px; line-height: 1;">${v.curLangFlag}</span>
          <span style="letter-spacing: 0.08em; text-transform: uppercase;">${v.curLangCode}</span>
          <span style="color: #8ef5c8; font-size: 8px; transform: ${v.langCaretRot}; transition: transform 0.25s ease;">▼</span>
        </button>
        ${v.langOpen ? `
        <div style="margin-top: 10px; width: 220px; display: flex; flex-direction: column; gap: 2px; padding: 8px; border-radius: 20px; border: 1px solid rgba(142,245,200,0.22); background: linear-gradient(170deg, rgba(14,22,44,0.97), rgba(5,8,20,0.97)); box-shadow: 0 18px 50px rgba(0,0,0,0.65), 0 0 40px rgba(111,215,168,0.1), inset 0 1px 0 rgba(255,255,255,0.06); animation: langPop 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;">
          <div style="font-size: 9.5px; letter-spacing: 0.3em; text-transform: uppercase; color: #5b6b8c; text-align: left; padding: 4px 12px 7px;">Language · Dil</div>
          ${v.langList.map((lg) => `
          <button data-click="${H(lg.onPick)}" class="lang-item" style="display: flex; align-items: center; gap: 11px; min-height: 40px; padding: 0 12px; border-radius: 12px; border: none; background: ${lg.bg}; color: ${lg.color}; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13.5px; cursor: pointer; text-align: left; transition: background 0.15s ease;">
            <span style="width: 29px; height: 29px; border-radius: 50%; background: rgba(124,141,176,0.12); border: 1px solid ${lg.flagRing}; display: inline-flex; align-items: center; justify-content: center; font-size: 15px;">${lg.flag}</span>
            <span style="flex: 1; letter-spacing: 0.03em;">${lg.label}</span>
            <span style="color: #8ef5c8; font-size: 13px; text-shadow: 0 0 10px rgba(142,245,200,0.7);">${lg.check}</span>
          </button>`).join('')}
        </div>` : ''}
      </div>
      <div style="position: relative; z-index: 1; margin-top: clamp(8px, 2.4vh, 18px); font-family: 'Unbounded', sans-serif; font-size: clamp(12px, 2.2vh, 15px); letter-spacing: 0.3em; color: #f2f6ff; text-transform: uppercase; animation: splashText 0.8s ease 2.1s both;">
        <span style="animation: softPulse 1.8s ease-in-out 2.4s infinite; display: inline-block;">${v.L.tapStart || ''}</span>
      </div>
    </div>`);
  }

  // ---- 2. Ana Menü ----
  if (v.showMenu) {
    out.push(`
    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(6px, 1.6vh, 14px); text-align: center; padding: calc(34px + env(safe-area-inset-top)) max(44px, env(safe-area-inset-left)) calc(12px + env(safe-area-inset-bottom)) max(44px, env(safe-area-inset-right)); background: radial-gradient(ellipse at 50% 30%, rgba(8,14,30,0.15), rgba(3,5,14,0.8)); animation: fadeUp 0.5s ease both; pointer-events: none; overflow: hidden;">
      <svg viewBox="0 0 120 120" style="margin-top: clamp(4px, 2vh, 16px); width: clamp(50px, 12vh, 96px); height: auto; flex-shrink: 0; filter: drop-shadow(0 0 28px rgba(111,215,168,0.4)); border-radius: 22%;">
        <defs>
          <linearGradient id="plA" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2fa8c9"></stop><stop offset="1" stop-color="#6fd7a8"></stop></linearGradient>
          <linearGradient id="plB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6fd7a8"></stop><stop offset="1" stop-color="#c9a5ff"></stop></linearGradient>
          <linearGradient id="plC" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4fb3c9"></stop><stop offset="1" stop-color="#8ef5c8"></stop></linearGradient>
        </defs>
        <radialGradient id="plSky" cx="0.5" cy="0.3" r="0.9"><stop offset="0" stop-color="#0d1830"></stop><stop offset="1" stop-color="#04060f"></stop></radialGradient>
        <rect x="0" y="0" width="120" height="120" rx="27" fill="url(#plSky)" stroke="rgba(142,245,200,0.18)" stroke-width="1"></rect>
        <rect x="26" y="40" width="15" height="52" rx="7.5" fill="url(#plA)" opacity="0.9"></rect>
        <rect x="52.5" y="24" width="15" height="68" rx="7.5" fill="url(#plB)"></rect>
        <rect x="79" y="50" width="15" height="42" rx="7.5" fill="url(#plC)" opacity="0.9"></rect>
      </svg>
      <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(24px, 8vh, 68px); line-height: 1.04; color: #f2f6ff; text-shadow: 0 0 50px rgba(111,215,168,0.5); letter-spacing: 0.12em;">POLARA</div>
      <div style="font-family: 'Unbounded', sans-serif; font-size: clamp(9px, 1.6vh, 11px); letter-spacing: 0.5em; color: #6fd7a8; text-transform: uppercase;">Ride the Northern Lights</div>
      <div style="display: flex; gap: 30px; margin-top: 2px;">
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="font-size: clamp(9px, 1.6vh, 11px); letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.record}</div>
          <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(15px, 3vh, 24px); color: #ffe9a3;">${v.bestLabel}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="font-size: clamp(9px, 1.6vh, 11px); letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.rank}</div>
          <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(15px, 3vh, 24px); color: #a5c8ff;">${v.rankName}</div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: clamp(6px, 2vh, 14px); width: min(560px, 88vw); pointer-events: auto; flex-wrap: wrap; justify-content: center;">
        <button data-click="${H(v.onPlay)}" style="flex: 1 1 220px; min-height: clamp(46px, 7vh, 58px); border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.4vh, 16px); letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 34px rgba(111,215,168,0.4);">${v.L.play}</button>
        <button data-click="${H(v.onHelp)}" style="flex: 1 1 220px; min-height: clamp(46px, 7vh, 58px); border: 1px solid rgba(159,176,208,0.4); border-radius: 999px; background: rgba(159,176,208,0.08); color: #cfd9ee; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(12px, 2.2vh, 15px); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;">${v.L.howTo}</button>
      </div>
      <div style="display: flex; gap: 12px; margin-top: clamp(4px, 1.2vh, 10px); width: min(560px, 88vw); pointer-events: auto; flex-wrap: wrap; justify-content: center;">
        <button data-click="${H(v.onOpenProfile)}" style="flex: 1 1 100%; min-height: clamp(46px, 7vh, 58px); display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid rgba(159,176,208,0.4); border-radius: 999px; background: rgba(10,16,34,0.6); color: #cfd9ee; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(12px, 2.2vh, 15px); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;">
          ${v.hasUser ? `<span style="width: 26px; height: 26px; border-radius: 50%; background: ${v.userAvatarBg}; border: 1px solid rgba(255,255,255,0.25); color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.5); font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; justify-content: center;"></span>` : ''}
          <span>${esc(v.userChip)}</span>
        </button>
        <button data-click="${H(v.onOpenShop)}" style="flex: 1 1 100%; min-height: clamp(46px, 7vh, 58px); display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid rgba(255,233,163,0.4); border-radius: 999px; background: rgba(30,24,8,0.55); color: #ffe9a3; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(12px, 2.2vh, 15px); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;">
          <span>${v.L.shop}</span>
          <span style="font-size: clamp(11px, 1.9vh, 13px); padding: 3px 10px; border-radius: 999px; background: rgba(255,233,163,0.12); border: 1px solid rgba(255,233,163,0.25);">✦ ${v.creditsLabel}</span>
        </button>
      </div>
      <div style="margin-top: clamp(4px, 1.4vh, 12px); display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; pointer-events: auto;">
        <button data-click="${H(v.onOpenPrivacy)}" style="border: none; background: transparent; color: #5b6b8c; font-size: clamp(10px, 1.8vh, 12px); letter-spacing: 0.14em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: 6px 12px;">${v.L.privacy}</button>
        <button data-click="${H(v.onOpenAbout)}" style="border: none; background: transparent; color: #5b6b8c; font-size: clamp(10px, 1.8vh, 12px); letter-spacing: 0.14em; text-transform: uppercase; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: 6px 12px;">${v.L.aboutTitle}</button>
      </div>
    </div>`);
  }

  // ---- 3. Gizlilik Politikası ----
  if (v.showPrivacy) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 56; display: flex; flex-direction: column; align-items: center; background: rgba(3,5,14,0.96); animation: fadeUp 0.35s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom)); pointer-events: auto;">
      <div style="width: min(620px, 100%); display: flex; flex-direction: column; gap: clamp(12px, 2.2vh, 18px); text-align: left;">
        <div style="display: flex; align-items: center; gap: 12px; margin-top: clamp(30px, 6vh, 46px);">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(17px, 3.4vh, 24px); color: #f2f6ff;">${v.L.privacy}</div>
            <div style="font-size: clamp(10px, 1.8vh, 11.5px); letter-spacing: 0.14em; color: #5b6b8c; text-transform: uppercase;">${v.L.privUpdated}</div>
          </div>
          <button data-click="${H(v.onClosePrivacy)}" style="width: 40px; height: 40px; border: 1px solid rgba(159,176,208,0.4); border-radius: 50%; background: rgba(159,176,208,0.08); color: #cfd9ee; font-size: 17px; cursor: pointer; flex-shrink: 0;">✕</button>
        </div>
        ${v.privacySections.map((p) => `
        <div style="display: flex; flex-direction: column; gap: 6px; padding: clamp(12px, 2.2vh, 16px) 16px; border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.18);">
          <div style="font-size: clamp(12px, 2.2vh, 14px); font-weight: 700; color: #8ef5c8; letter-spacing: 0.06em;">${p.h}</div>
          <div style="font-size: clamp(11.5px, 2.1vh, 13.5px); line-height: 1.6; color: #cfd9ee;">${p.b}</div>
        </div>`).join('')}
      </div>
    </div>`);
  }

  // ---- 3b. Hakkımızda (Norient) ----
  if (v.showAbout) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 56; display: flex; flex-direction: column; align-items: center; background: rgba(3,5,14,0.96); animation: fadeUp 0.35s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom)); pointer-events: auto;">
      <div style="width: min(620px, 100%); display: flex; flex-direction: column; gap: clamp(12px, 2.2vh, 18px); text-align: left;">
        <div style="display: flex; align-items: center; gap: 14px; margin-top: clamp(30px, 6vh, 46px);">
          <svg viewBox="0 0 200 200" style="width: clamp(40px, 7vh, 56px); height: auto; flex-shrink: 0;">
            <circle cx="100" cy="27" r="13" fill="#1C9FE5"></circle>
            <path d="M32 103 L98 69" stroke="#1C9FE5" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <path d="M99 67 Q132 73 167 99" stroke="#23B26D" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <path d="M32 159 L98 125" stroke="#1C9FE5" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <path d="M99 123 Q132 129 167 155" stroke="#23B26D" stroke-width="27" stroke-linecap="round" fill="none"></path>
            <circle cx="100" cy="181" r="13" fill="#1C9FE5"></circle>
          </svg>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(17px, 3.4vh, 24px); color: #f2f6ff;">${v.L.aboutTitle}</div>
            <div style="font-size: clamp(10px, 1.8vh, 11.5px); letter-spacing: 0.1em; color: #5b6b8c;">${v.L.aboutSub}</div>
          </div>
          <button data-click="${H(v.onCloseAbout)}" style="width: 40px; height: 40px; border: 1px solid rgba(159,176,208,0.4); border-radius: 50%; background: rgba(159,176,208,0.08); color: #cfd9ee; font-size: 17px; cursor: pointer; flex-shrink: 0;">✕</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; padding: clamp(12px, 2.2vh, 16px) 16px; border-radius: 16px; background: rgba(111,215,168,0.07); border: 1px solid rgba(142,245,200,0.3);">
          <div style="font-size: clamp(12px, 2.2vh, 14px); font-weight: 700; color: #8ef5c8; letter-spacing: 0.06em; text-transform: uppercase;">${v.L.aboutWhoH}</div>
          <div style="font-size: clamp(11.5px, 2.1vh, 13.5px); line-height: 1.65; color: #cfd9ee;">${v.L.aboutWhoB}</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="display: flex; flex-direction: column; gap: 2px; align-items: center; padding: clamp(12px, 2.2vh, 16px); border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.18);">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(20px, 4vh, 28px); color: #ffe9a3;">15+</div>
            <div style="font-size: clamp(9.5px, 1.7vh, 11px); letter-spacing: 0.18em; color: #5b6b8c; text-transform: uppercase; text-align: center;">${v.L.aboutStat1}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; align-items: center; padding: clamp(12px, 2.2vh, 16px); border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.18);">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(20px, 4vh, 28px); color: #ffe9a3;">30+</div>
            <div style="font-size: clamp(9.5px, 1.7vh, 11px); letter-spacing: 0.18em; color: #5b6b8c; text-transform: uppercase; text-align: center;">${v.L.aboutStat2}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.5vh, 16px); color: #f2f6ff;">${v.L.aboutMissionH}</div>
          <div style="font-size: clamp(11.5px, 2.1vh, 13.5px); line-height: 1.65; color: #cfd9ee;">${v.L.aboutMissionB}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.5vh, 16px); color: #f2f6ff;">${v.L.aboutApproachH}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
            ${[['aboutAp1h', 'aboutAp1b', '#8ef5c8', 'rgba(142,245,200,0.28)'], ['aboutAp2h', 'aboutAp2b', '#a5c8ff', 'rgba(165,200,255,0.28)'], ['aboutAp3h', 'aboutAp3b', '#ffe9a3', 'rgba(255,233,163,0.28)'], ['aboutAp4h', 'aboutAp4b', '#c9a5ff', 'rgba(201,165,255,0.28)']].map(([h, b, col, bor]) => `
            <div style="display: flex; flex-direction: column; gap: 5px; padding: clamp(10px, 2vh, 14px) 14px; border-radius: 14px; background: rgba(124,141,176,0.07); border: 1px solid ${bor};">
              <div style="font-size: clamp(11px, 2vh, 13px); font-weight: 700; color: ${col}; letter-spacing: 0.06em; text-transform: uppercase;">${v.L[h]}</div>
              <div style="font-size: clamp(11px, 2vh, 13px); line-height: 1.55; color: #9fb0d0;">${v.L[b]}</div>
            </div>`).join('')}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; padding: clamp(12px, 2.2vh, 16px) 16px; border-radius: 16px; background: linear-gradient(160deg, rgba(28,159,229,0.08), rgba(35,178,109,0.07)); border: 1px solid rgba(28,159,229,0.3);">
          <div style="font-size: clamp(12px, 2.2vh, 14px); font-weight: 700; color: #59baf0; letter-spacing: 0.06em; text-transform: uppercase;">${v.L.aboutStudioH}</div>
          <div style="font-size: clamp(11.5px, 2.1vh, 13.5px); line-height: 1.65; color: #cfd9ee;">${v.L.aboutStudioB}</div>
        </div>
        <a href="https://norientinndev.com" target="_blank" rel="noopener" style="display: flex; align-items: center; justify-content: center; min-height: clamp(46px, 7vh, 54px); border-radius: 999px; background: linear-gradient(135deg, #1C9FE5, #23B26D); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(12px, 2.2vh, 14px); letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; cursor: pointer; box-shadow: 0 0 30px rgba(28,159,229,0.3);">${v.L.aboutVisit} ▸</a>
      </div>
    </div>`);
  }

  // ---- 4. Mağaza ----
  if (v.showShop) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 48; display: flex; flex-direction: column; align-items: center; background: rgba(3,5,14,0.94); animation: fadeUp 0.35s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(14px + env(safe-area-inset-bottom)); pointer-events: auto;">
      <div style="width: min(760px, 100%); display: flex; flex-direction: column; gap: clamp(12px, 2.2vh, 18px);">
        <div style="display: flex; align-items: center; gap: 12px; margin-top: clamp(30px, 6vh, 46px);">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; text-align: left;">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(17px, 3.4vh, 24px); color: #f2f6ff;">${v.L.shopTitle}</div>
            <div style="font-size: clamp(10px, 1.8vh, 12px); letter-spacing: 0.14em; color: #5b6b8c; text-transform: uppercase;">${v.L.shopSub}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: rgba(255,233,163,0.1); border: 1px solid rgba(255,233,163,0.35); box-shadow: 0 0 20px rgba(255,233,163,0.12);">
            <span style="color: #ffe9a3; font-size: clamp(15px, 2.6vh, 18px);">✦</span>
            <span style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(15px, 2.8vh, 20px); color: #ffe9a3;">${v.creditsLabel}</span>
          </div>
          <button data-click="${H(v.onCloseShop)}" style="width: 40px; height: 40px; border: 1px solid rgba(159,176,208,0.4); border-radius: 50%; background: rgba(159,176,208,0.08); color: #cfd9ee; font-size: 17px; cursor: pointer; flex-shrink: 0;">✕</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; padding-bottom: 10px;">
          ${v.shopList.map((it) => `
          <div style="display: flex; flex-direction: column; gap: 10px; padding: clamp(14px, 2.4vh, 18px) 16px; border-radius: 18px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.18); text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 46px; height: 46px; border-radius: 14px; background: ${it.symBg}; box-shadow: ${it.symGlow}; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">${it.sym}</div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
                <div style="font-size: clamp(13px, 2.4vh, 15px); font-weight: 700; color: #f2f6ff;">${it.name}</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="font-size: clamp(10px, 1.8vh, 11px); letter-spacing: 0.12em; text-transform: uppercase; color: ${it.statusColor};">${it.statusLabel}</div>
                  <div style="display: flex; gap: 4px;">
                    ${it.pips.map((p) => `<div style="width: 14px; height: 5px; border-radius: 3px; background: ${p.bg};"></div>`).join('')}
                  </div>
                </div>
              </div>
            </div>
            <div style="font-size: clamp(11.5px, 2vh, 13px); line-height: 1.5; color: #9fb0d0; flex: 1;">${it.desc}</div>
            <button data-click="${H(it.onBuy)}" style="min-height: 40px; border: ${it.btnBorder}; border-radius: 999px; background: ${it.btnBg}; color: ${it.btnColor}; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(11px, 2vh, 13px); letter-spacing: 0.12em; cursor: ${it.btnCursor};">${it.btnLabel}</button>
          </div>`).join('')}
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: left; margin-top: 4px;">
          <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(15px, 2.8vh, 20px); color: #f2f6ff;">${v.L.cosTitle}</div>
          <div style="font-size: clamp(10px, 1.8vh, 12px); letter-spacing: 0.14em; color: #5b6b8c; text-transform: uppercase;">${v.L.cosSub}</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; padding-bottom: 10px;">
          ${v.cosList.map((c) => `
          <div style="display: flex; flex-direction: column; gap: 10px; padding: clamp(14px, 2.4vh, 18px) 16px; border-radius: 18px; background: rgba(124,141,176,0.07); border: 1px solid ${c.cardBorder}; text-align: left;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 46px; height: 46px; border-radius: 14px; background: ${c.symBg}; box-shadow: ${c.symGlow}; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; flex-shrink: 0;">${c.sym}</div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 3px;">
                <div style="font-size: clamp(13px, 2.4vh, 15px); font-weight: 700; color: #f2f6ff;">${c.name}</div>
                <div style="font-size: clamp(10px, 1.8vh, 11px); letter-spacing: 0.12em; text-transform: uppercase; color: ${c.statusColor};">${c.statusLabel}</div>
              </div>
            </div>
            <div style="font-size: clamp(11.5px, 2vh, 13px); line-height: 1.5; color: #9fb0d0; flex: 1;">${c.desc}</div>
            <button data-click="${H(c.onTap)}" style="min-height: 40px; border: ${c.btnBorder}; border-radius: 999px; background: ${c.btnBg}; color: ${c.btnColor}; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(11px, 2vh, 13px); letter-spacing: 0.12em; cursor: pointer;">${c.btnLabel}</button>
          </div>`).join('')}
        </div>
      </div>
    </div>`);
  }

  // ---- 5. Dünya Sıralaması ----
  if (v.showBoard) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 48; display: flex; flex-direction: column; align-items: center; background: rgba(3,5,14,0.94); animation: fadeUp 0.35s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(14px + env(safe-area-inset-bottom)); pointer-events: auto;">
      <div style="width: min(560px, 100%); display: flex; flex-direction: column; gap: clamp(12px, 2.2vh, 18px);">
        <div style="display: flex; align-items: center; gap: 12px; margin-top: clamp(30px, 6vh, 46px);">
          <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; text-align: left;">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(17px, 3.4vh, 24px); color: #f2f6ff;">${v.L.boardTitle}</div>
            <div style="font-size: clamp(10px, 1.8vh, 11.5px); color: #5b6b8c; line-height: 1.4;">${v.boardNote}</div>
          </div>
          <button data-click="${H(v.onCloseBoard)}" style="width: 40px; height: 40px; border: 1px solid rgba(159,176,208,0.4); border-radius: 50%; background: rgba(159,176,208,0.08); color: #cfd9ee; font-size: 17px; cursor: pointer; flex-shrink: 0;">✕</button>
        </div>
        <div style="display: flex; align-items: center; gap: 14px; padding: clamp(14px, 2.4vh, 18px) 16px; border-radius: 18px; background: linear-gradient(160deg, rgba(111,215,168,0.14), rgba(79,179,201,0.08)); border: 1px solid rgba(142,245,200,0.35); box-shadow: 0 0 30px rgba(111,215,168,0.12);">
          <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(22px, 4.2vh, 30px); color: #8ef5c8;">${v.myRankLabel}</div>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; text-align: left;">
            <div style="font-size: clamp(13px, 2.3vh, 15px); font-weight: 700; color: #f2f6ff;">${v.myBoardFlag} ${esc(v.myBoardName)}</div>
            <div style="font-size: clamp(10px, 1.8vh, 11px); letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.yourPos}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px; align-items: flex-end;">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(16px, 3vh, 22px); color: #ffe9a3;">${v.myBoardScore}</div>
            <div style="font-size: clamp(10px, 1.8vh, 11px); letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.yourBest}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; padding: 5px; border-radius: 999px; background: rgba(124,141,176,0.08); border: 1px solid rgba(124,141,176,0.15);">
          <button data-click="${H(v.onBoardTabWorld)}" style="flex: 1; min-height: 38px; border: none; border-radius: 999px; background: ${v.boardTabWorldBg}; color: ${v.boardTabWorldColor}; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(12px, 2vh, 13px); letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;">${v.L.tabPlayers}</button>
          <button data-click="${H(v.onBoardTabCountry)}" style="flex: 1; min-height: 38px; border: none; border-radius: 999px; background: ${v.boardTabCountryBg}; color: ${v.boardTabCountryColor}; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(12px, 2vh, 13px); letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;">${v.L.tabCountries}</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; padding: clamp(10px, 1.8vh, 14px) 12px; border-radius: 18px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.15);">
          ${v.boardList.map((l) => `
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: ${l.bg}; font-size: clamp(13px, 2.3vh, 15px);">
            <div style="width: 36px; color: #5b6b8c; font-weight: 700; text-align: left; font-family: 'Unbounded', sans-serif; font-size: clamp(11px, 2vh, 13px);">${l.rank}</div>
            <div>${l.flag}</div>
            <div style="flex: 1; text-align: left; color: ${l.color}; font-weight: 700;">${esc(l.name)}</div>
            <div style="color: #9fb0d0; font-weight: 700;">${l.s}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`);
  }

  // ---- 6. Nasıl Oynanır ----
  if (v.showHelp) {
    out.push(`
    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; background: rgba(3,5,14,0.94); animation: fadeUp 0.35s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(14px + env(safe-area-inset-bottom));">
      <div style="width: min(640px, 100%); display: flex; flex-direction: column; gap: clamp(14px, 2.6vh, 22px); text-align: left;">
        <div style="text-align: center; font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(17px, 3.4vh, 24px); color: #f2f6ff; margin-top: clamp(34px, 7vh, 52px);">${v.L.howTo}</div>
        ${[1, 2, 3, 4, 5, 6, 7].map((i) => `
        <div style="font-size: clamp(13px, 2.4vh, 15px); line-height: 1.75; color: #c4d2ea;">${v.L['help' + i]}</div>`).join('')}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          <div style="display: flex; flex-direction: column; gap: 7px; padding: clamp(10px, 1.8vh, 14px) 16px; border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.15);">
            <div style="font-size: 14px; color: #f2f6ff; font-weight: 700;">${v.L.ranksHeader}</div>
            ${v.ranksList.map((r) => `
            <div style="display: flex; align-items: center; gap: 10px; font-size: clamp(12px, 2.1vh, 13.5px);">
              <div style="color: #f2f6ff; font-weight: 700; flex: 1;">${r.name} ${r.check}</div>
              <div style="color: #7c8db0; font-size: 12px;">${r.minLabel}</div>
            </div>`).join('')}
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; padding: clamp(10px, 1.8vh, 14px) 16px; border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.15);">
            <div style="font-size: 14px; color: #f2f6ff; font-weight: 700;">${v.L.achHeader}</div>
            ${v.achList.map((a) => `
            <div style="display: flex; gap: 8px; align-items: baseline; font-size: clamp(12px, 2.1vh, 13.5px); color: #c4d2ea;">
              <div style="color: #8ef5c8; width: 14px; flex-shrink: 0;">${a.check}</div>
              <div><b style="color:#f2f6ff;">${a.name}</b> — ${a.desc}</div>
            </div>`).join('')}
          </div>
        </div>
        <button data-click="${H(v.onPlay)}" style="min-height: clamp(46px, 7vh, 58px); border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.3vh, 16px); letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; margin-top: 2px;">${v.L.gotIt}</button>
        <button data-click="${H(v.onCloseHelp)}" style="min-height: clamp(40px, 5.5vh, 48px); border: none; border-radius: 999px; background: transparent; color: #7c8db0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; cursor: pointer;">${v.L.back}</button>
      </div>
    </div>`);
  }

  // ---- 7. Kayıt / Giriş ----
  if (v.showRegister) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 45; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 50% 30%, rgba(8,14,30,0.4), rgba(3,5,14,0.93)); animation: fadeUp 0.4s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(14px + env(safe-area-inset-bottom));">
      <div style="width: min(360px, 92vw); display: flex; flex-direction: column; gap: clamp(8px, 1.6vh, 13px); text-align: center;">
        <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(18px, 3.6vh, 26px); color: #f2f6ff;">${v.authTitle}</div>
        <div style="font-size: clamp(11px, 2vh, 13px); color: #9fb0d0;">${v.authSub}</div>
        <div style="display: flex; gap: 6px; padding: 4px; border-radius: 999px; border: 1px solid rgba(159,176,208,0.25); background: rgba(10,16,34,0.6);">
          <button data-click="${H(v.onTabLogin)}" style="flex: 1; min-height: clamp(38px, 5.5vh, 44px); border: none; border-radius: 999px; background: ${v.loginTabBg}; color: ${v.loginTabColor}; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; cursor: pointer;">${v.L.login}</button>
          <button data-click="${H(v.onTabRegister)}" style="flex: 1; min-height: clamp(38px, 5.5vh, 44px); border: none; border-radius: 999px; background: ${v.regTabBg}; color: ${v.regTabColor}; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.06em; cursor: pointer;">${v.L.signup}</button>
        </div>
        <input placeholder="${esc(v.L.username)}" value="${esc(v.regName)}" data-input="${H(v.onRegName)}" style="min-height: clamp(44px, 6.5vh, 50px); padding: 0 18px; border-radius: 12px; border: 1px solid rgba(159,176,208,0.35); background: rgba(10,16,34,0.75); color: #f2f6ff; font-family: 'Space Grotesk', sans-serif; font-size: 15px; outline: none;">
        <input type="password" placeholder="${esc(v.L.password)}" value="${esc(v.regPass)}" data-input="${H(v.onRegPass)}" style="min-height: clamp(44px, 6.5vh, 50px); padding: 0 18px; border-radius: 12px; border: 1px solid rgba(159,176,208,0.35); background: rgba(10,16,34,0.75); color: #f2f6ff; font-family: 'Space Grotesk', sans-serif; font-size: 15px; outline: none;">
        ${v.isRegisterTab ? `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; color: #9fb0d0; text-align: left;">${v.L.pickAvatar} <span style="color: #8ef5c8; font-weight: 700;">${v.regAvatarName}</span></div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; justify-items: center;">
            ${v.avatarList.map((av) => `
            <div data-click="${H(av.onPick)}" style="display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer;">
              <div style="width: 52px; height: 52px; border-radius: 50%; background: ${av.bg}; border: 2px solid ${av.border}; box-shadow: ${av.glow}; transform: scale(${av.scale}); transition: transform 0.15s ease, box-shadow 0.15s ease;"></div>
              <div style="font-size: 9px; color: ${av.nameColor}; white-space: nowrap;">${av.name}</div>
            </div>`).join('')}
          </div>
        </div>
        <select data-input="${H(v.onRegCountry)}" style="min-height: clamp(44px, 6.5vh, 50px); padding: 0 14px; border-radius: 12px; border: 1px solid rgba(159,176,208,0.35); background: rgba(10,16,34,0.75); color: #f2f6ff; font-family: 'Space Grotesk', sans-serif; font-size: 15px; outline: none;">
          ${v.countriesList.map((c) => `<option value="${esc(c.value)}"${c.value === v.regCountry ? ' selected' : ''}>${c.label}</option>`).join('')}
        </select>` : ''}
        ${v.hasRegError ? `<div style="font-size: 13px; color: #ff8a9b;">${esc(v.regError)}</div>` : ''}
        <button data-click="${H(v.onAuthSubmit)}" style="min-height: clamp(46px, 7vh, 54px); border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.3vh, 15px); letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 30px rgba(111,215,168,0.35);">${v.authSubmitLabel}</button>
        <button data-click="${H(v.onSkipReg)}" style="min-height: clamp(38px, 5.5vh, 44px); border: none; border-radius: 999px; background: transparent; color: #7c8db0; font-family: 'Space Grotesk', sans-serif; font-size: 13px; cursor: pointer;">${v.L.guestContinue}</button>
      </div>
    </div>`);
  }

  // ---- 8. Profil ----
  if (v.showProfile) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 45; display: flex; flex-direction: column; align-items: center; background: rgba(3,5,14,0.94); animation: fadeUp 0.35s ease both; overflow-y: auto; touch-action: pan-y; padding: calc(14px + env(safe-area-inset-top)) 20px calc(14px + env(safe-area-inset-bottom));">
      <button data-click="${H(v.onCloseProfile)}" data-pd="${H(v.onCloseProfileDown)}" style="position: fixed; top: calc(12px + env(safe-area-inset-top)); right: calc(14px + env(safe-area-inset-right)); z-index: 60; width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(159,176,208,0.4); background: rgba(10,16,34,0.85); color: #f2f6ff; font-size: 20px; font-family: 'Space Grotesk', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
      <div style="width: min(760px, 100%); display: flex; flex-direction: column; gap: clamp(10px, 2vh, 16px);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: clamp(44px, 8vh, 58px); height: clamp(44px, 8vh, 58px); border-radius: 50%; background: ${v.userAvatarBg}; border: 2px solid rgba(255,255,255,0.25); color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.5); font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(18px, 3.4vh, 24px); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"></div>
          <div style="text-align: left; flex: 1;">
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(16px, 3vh, 22px); color: #f2f6ff;">${esc(v.userName)}</div>
            <div style="font-size: clamp(11px, 2vh, 13px); color: #9fb0d0;">${v.userFlagV} ${esc(v.userCountry)} · <span style="color: #a5c8ff; font-weight: 700;">${v.rankName}</span></div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; padding: clamp(12px, 2vh, 16px) 16px; border-radius: 16px; background: linear-gradient(135deg, rgba(111,215,168,0.1), rgba(79,179,201,0.08)); border: 1px solid rgba(142,245,200,0.3); text-align: left;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 160px;">
              <div style="font-size: 10px; letter-spacing: 0.25em; color: #6fd7a8; text-transform: uppercase;">${v.L.curRank}</div>
              <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(18px, 3.6vh, 28px); color: #8ef5c8; text-shadow: 0 0 24px rgba(142,245,200,0.45);">${v.rankName}</div>
            </div>
            <button data-click="${H(v.onToggleRanks)}" style="min-height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(142,245,200,0.35); background: rgba(142,245,200,0.08); color: #8ef5c8; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer;">${v.ranksToggleLabel}</button>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: clamp(11px, 2vh, 12.5px); color: #9fb0d0;">
            <span>${v.L.yourBest}: <b style="color: #ffe9a3;">${v.bestLabel}</b></span>
            <span>${v.rankRemainLabel}</span>
          </div>
          <div style="height: 12px; border-radius: 999px; background: rgba(10,16,34,0.7); border: 1px solid rgba(124,141,176,0.25); overflow: hidden;">
            <div style="height: 100%; width: ${v.rankProgress}; border-radius: 999px; background: linear-gradient(90deg, #6fd7a8, #4fb3c9, #ffe9a3); box-shadow: 0 0 14px rgba(142,245,200,0.5); transition: width 0.5s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #5b6b8c;">
            <span>${v.rankFloorLabel}</span>
            <span style="color: #a5c8ff; font-weight: 700;">${v.nextRankLabel}</span>
          </div>
          ${v.showRanksChart ? `
          <div style="overflow-x: auto; padding: 6px 2px 2px;">
            <div style="display: flex; align-items: flex-end; gap: 8px; height: 210px; min-width: max-content;">
              ${v.rankChart.map((r) => `
              <div style="width: 74px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; justify-content: flex-end;">
                <div style="font-size: 12px; line-height: 1;">${r.star}</div>
                <div style="font-family: 'Unbounded', sans-serif; font-size: 10px; font-weight: 700; color: ${r.minColor}; white-space: nowrap;">${r.minLabel}</div>
                <div style="width: 100%; height: ${r.h}; border-radius: 10px 10px 4px 4px; background: ${r.bg}; border: 1px solid ${r.border}; box-shadow: ${r.glow}; position: relative; overflow: hidden;">
                  <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.22), transparent 40%);"></div>
                  <div style="position: absolute; bottom: 4px; left: 0; right: 0; text-align: center; font-family: 'Unbounded', sans-serif; font-size: 9px; font-weight: 900; color: ${r.numColor};">${r.num}</div>
                </div>
                <div style="font-size: 10px; line-height: 1.25; color: ${r.nameColor}; font-weight: 700; text-align: center; min-height: 26px; text-wrap: balance;">${r.name}</div>
              </div>`).join('')}
            </div>
          </div>` : ''}
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
          <div style="border-radius: 14px; background: rgba(124,141,176,0.08); border: 1px solid rgba(124,141,176,0.15); padding: 10px; display: flex; flex-direction: column; gap: 2px; align-items: center;">
            <div style="font-size: 10px; letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.record}</div>
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(14px, 2.6vh, 20px); color: #ffe9a3;">${v.bestLabel}</div>
          </div>
          <div style="border-radius: 14px; background: rgba(124,141,176,0.08); border: 1px solid rgba(124,141,176,0.15); padding: 10px; display: flex; flex-direction: column; gap: 2px; align-items: center;">
            <div style="font-size: 10px; letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.games}</div>
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(14px, 2.6vh, 20px); color: #f2f6ff;">${v.gamesCount}</div>
          </div>
          <div style="border-radius: 14px; background: rgba(124,141,176,0.08); border: 1px solid rgba(124,141,176,0.15); padding: 10px; display: flex; flex-direction: column; gap: 2px; align-items: center;">
            <div style="font-size: 10px; letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.average}</div>
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(14px, 2.6vh, 20px); color: #a5c8ff;">${v.avgScore}</div>
          </div>
          <div style="border-radius: 14px; background: rgba(124,141,176,0.08); border: 1px solid rgba(124,141,176,0.15); padding: 10px; display: flex; flex-direction: column; gap: 2px; align-items: center;">
            <div style="font-size: 10px; letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.total}</div>
            <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(14px, 2.6vh, 20px); color: #8ef5c8;">${v.totalScore}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; padding: clamp(10px, 1.8vh, 14px) 14px; border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.15);">
          <div style="font-size: 14px; color: #f2f6ff; font-weight: 700; text-align: left;">${v.L.statsTitle}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
            ${v.statsList.map((st) => `
            <div style="display: flex; flex-direction: column; gap: 2px; align-items: center; padding: 8px 4px; border-radius: 12px; background: rgba(10,16,34,0.4);">
              <div style="font-size: 9.5px; letter-spacing: 0.16em; color: #5b6b8c; text-transform: uppercase; text-align: center;">${st.label}</div>
              <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.4vh, 17px); color: ${st.color};">${st.val}</div>
            </div>`).join('')}
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 10px;">
          <div style="display: flex; flex-direction: column; gap: 6px; padding: clamp(10px, 1.8vh, 14px) 14px; border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.15);">
            <div style="font-size: 14px; color: #f2f6ff; font-weight: 700; text-align: left;">${v.L.scoreHistory}</div>
            ${v.profileHistory.map((h) => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 8px; font-size: clamp(12px, 2.1vh, 13.5px);">
              <div style="width: 24px; color: #5b6b8c; font-weight: 700; text-align: left;">${h.idx}</div>
              <div style="flex: 1; text-align: left; color: #c4d2ea; font-weight: 700;">${h.s}</div>
              <div style="color: #ffe9a3; font-size: 11px;">${h.tag}</div>
            </div>`).join('')}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; padding: clamp(10px, 1.8vh, 14px) 14px; border-radius: 16px; background: rgba(124,141,176,0.07); border: 1px solid rgba(124,141,176,0.15);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="flex: 1; font-size: 14px; color: #f2f6ff; font-weight: 700; text-align: left;">${v.L.boardTitle}</div>
              <button data-click="${H(v.onOpenBoard)}" style="border: 1px solid rgba(165,200,255,0.35); border-radius: 999px; background: rgba(165,200,255,0.08); color: #a5c8ff; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 5px 12px; cursor: pointer; text-transform: uppercase;">${v.L.seeAll}</button>
            </div>
            ${v.leaderboardList.map((l) => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 8px; background: ${l.bg}; font-size: clamp(12px, 2.1vh, 13.5px);">
              <div style="width: 30px; color: #5b6b8c; font-weight: 700; text-align: left;">${l.rank}</div>
              <div>${l.flag}</div>
              <div style="flex: 1; text-align: left; color: ${l.color}; font-weight: 700;">${esc(l.name)}</div>
              <div style="color: #9fb0d0;">${l.s}</div>
            </div>`).join('')}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; padding: clamp(12px, 2vh, 16px) 14px; border-radius: 16px; background: linear-gradient(160deg, rgba(255,233,163,0.05), rgba(124,141,176,0.06)); border: 1px solid rgba(255,233,163,0.18);">
          <div style="display: flex; align-items: baseline; gap: 10px;">
            <div style="font-size: 14px; color: #f2f6ff; font-weight: 700; text-align: left; flex: 1;">${v.L.achHeader}</div>
            <div style="font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 900; color: #ffe9a3;">${v.achEarnedCount}</div>
          </div>
          <div style="height: 6px; border-radius: 999px; background: rgba(10,16,34,0.7); overflow: hidden;">
            <div style="height: 100%; width: ${v.achProgress}; background: linear-gradient(90deg, #6fd7a8, #ffe9a3); border-radius: 999px;"></div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px;">
            ${v.achChips.map((a) => `
            <div data-click="${H(a.onTap)}" class="ach-chip" style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 6px 8px; border-radius: 14px; border: 1px solid ${a.border}; background: ${a.bg}; cursor: pointer; transition: transform 0.15s ease;">
              <div style="width: 40px; height: 40px; border-radius: ${a.medalRadius}; transform: ${a.medalRot}; display: flex; align-items: center; justify-content: center; background: ${a.medalBg}; border: 1.5px solid ${a.medalBorder}; box-shadow: ${a.glow};">
                <div style="width: 22px; height: 22px; background: ${a.iconBg}; transform: ${a.iconRot};"></div>
              </div>
              <div style="font-size: 10.5px; font-weight: 700; color: ${a.nameColor}; text-align: center; line-height: 1.25; text-wrap: balance;">${a.name}</div>
            </div>`).join('')}
          </div>
          ${v.hasAchDetail ? `
          <div style="text-align: left; padding: 12px 14px; border-radius: 12px; background: rgba(255,233,163,0.07); border: 1px solid rgba(255,233,163,0.3); font-size: clamp(12px, 2.1vh, 13.5px); color: #e8dcb0; display: flex; flex-direction: column; gap: 8px;">
            <div><b style="color: #ffe9a3;">${v.achDetailName}</b> · ${v.achDetailStatus}<br>${v.achDetailDesc}</div>
            ${v.showFocusBtn ? `
            <button data-click="${H(v.onFocusAch)}" style="align-self: flex-start; min-height: 38px; padding: 0 18px; border-radius: 999px; border: 1px solid ${v.focusBtnBorder}; background: ${v.focusBtnBg}; color: ${v.focusBtnColor}; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 12.5px; cursor: pointer;">${v.focusBtnLabel}</button>` : ''}
            ${v.isFocusedAch ? `<div style="font-size: 11px; color: #8ef5c8;">${v.L.focusNote}</div>` : ''}
          </div>` : ''}
          ${v.hasAchDetailNot ? `<div style="font-size: 11px; color: #5b6b8c; text-align: center;">${v.L.tapMedal}</div>` : ''}
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button data-click="${H(v.onLogout)}" style="flex: 1 1 160px; min-height: clamp(44px, 6.5vh, 52px); border: 1px solid rgba(255,138,155,0.35); border-radius: 999px; background: rgba(255,138,155,0.06); color: #ff8a9b; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer;">${v.L.logout}</button>
          ${v.showDelete ? `<button data-click="${H(v.onDeleteAccount)}" style="flex: 1 1 160px; min-height: clamp(44px, 6.5vh, 52px); border: 1px solid rgba(255,138,155,0.6); border-radius: 999px; background: rgba(255,60,80,0.14); color: #ff8a9b; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer;">${v.L.delAccount}</button>` : ''}
        </div>
      </div>
    </div>`);
  }

  // ---- 9. Eğitim ----
  if (v.showTut) {
    out.push(`
    <div data-stop style="position: absolute; inset: 0; z-index: 55; display: flex; align-items: center; justify-content: center; background: rgba(3,5,14,0.9); backdrop-filter: blur(6px); animation: fadeUp 0.35s ease both; padding: calc(14px + env(safe-area-inset-top)) 24px calc(14px + env(safe-area-inset-bottom)); pointer-events: auto;">
      <div style="width: min(560px, 94vw); display: flex; flex-direction: column; gap: clamp(10px, 2vh, 16px); text-align: center;">
        <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(18px, 3.6vh, 26px); color: #f2f6ff;">${v.L.tutTitle}</div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 14px; padding: clamp(10px, 2vh, 16px) 18px; border-radius: 16px; background: rgba(111,215,168,0.08); border: 1px solid rgba(142,245,200,0.3); text-align: left;">
            <svg viewBox="0 0 48 48" style="width: clamp(38px, 7vh, 52px); height: auto; flex-shrink: 0;"><circle cx="24" cy="30" r="9" fill="none" stroke="#8ef5c8" stroke-width="2.5"></circle><circle cx="24" cy="30" r="3.5" fill="#8ef5c8"></circle><path d="M24 16 V6 M19 10 L24 5 L29 10" fill="none" stroke="#8ef5c8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <div style="flex: 1; font-size: clamp(13px, 2.4vh, 15.5px); font-weight: 700; color: #d9f4e6; line-height: 1.5;">${v.L.tutHold}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px; padding: clamp(10px, 2vh, 16px) 18px; border-radius: 16px; background: rgba(165,200,255,0.07); border: 1px solid rgba(165,200,255,0.28); text-align: left;">
            <svg viewBox="0 0 48 48" style="width: clamp(38px, 7vh, 52px); height: auto; flex-shrink: 0;"><circle cx="24" cy="18" r="9" fill="none" stroke="#a5c8ff" stroke-width="2.5" stroke-dasharray="3 4"></circle><path d="M24 32 V42 M19 38 L24 43 L29 38" fill="none" stroke="#a5c8ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <div style="flex: 1; font-size: clamp(13px, 2.4vh, 15.5px); font-weight: 700; color: #cfdcf4; line-height: 1.5;">${v.L.tutRelease}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px; padding: clamp(10px, 2vh, 16px) 18px; border-radius: 16px; background: rgba(255,233,163,0.06); border: 1px solid rgba(255,233,163,0.25); text-align: left;">
            <svg viewBox="0 0 48 48" style="width: clamp(38px, 7vh, 52px); height: auto; flex-shrink: 0;"><ellipse cx="16" cy="24" rx="5" ry="13" fill="none" stroke="#ffe9a3" stroke-width="2.5"></ellipse><circle cx="36" cy="15" r="6" fill="rgba(90,100,130,0.55)"></circle><circle cx="40" cy="19" r="5" fill="rgba(90,100,130,0.55)"></circle><path d="M33 34 L43 30" stroke="#ff8a9b" stroke-width="2.5" stroke-linecap="round"></path><path d="M33 30 L43 34" stroke="#ff8a9b" stroke-width="2.5" stroke-linecap="round"></path></svg>
            <div style="flex: 1; font-size: clamp(13px, 2.4vh, 15.5px); font-weight: 700; color: #ede3c2; line-height: 1.5;">${v.L.tutRings}</div>
          </div>
        </div>
        <button data-click="${H(v.onTutGo)}" style="min-height: clamp(48px, 7.5vh, 58px); border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(14px, 2.6vh, 17px); letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 34px rgba(111,215,168,0.45);">${v.L.tutGo}</button>
      </div>
    </div>`);
  }

  // ---- 10. Telefonu Çevir ----
  if (v.showRotate) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 40; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; text-align: center; padding: 32px; background: rgba(3,5,14,0.94);">
      <svg viewBox="0 0 80 80" style="width: 84px; height: 84px; animation: softPulse 2s ease-in-out infinite;">
        <rect x="26" y="10" width="28" height="52" rx="6" fill="none" stroke="#6fd7a8" stroke-width="3"></rect>
        <path d="M 60 30 A 24 24 0 0 1 66 46" fill="none" stroke="#a5c8ff" stroke-width="3" stroke-linecap="round"></path>
        <path d="M 66 46 l -5 -2 m 5 2 l 2 -5" fill="none" stroke="#a5c8ff" stroke-width="3" stroke-linecap="round"></path>
      </svg>
      <div style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: 20px; color: #f2f6ff;">${v.L.rotateTitle}</div>
      <div style="font-size: 14px; line-height: 1.6; color: #9fb0d0; max-width: 280px;">${v.L.rotateSub}</div>
    </div>`);
  }

  // ---- 11. Evre Tanıtımı ----
  if (v.showEventPopup) {
    out.push(`
    <div style="position: absolute; inset: 0; z-index: 40; display: flex; align-items: center; justify-content: center; background: rgba(3,5,14,0.45); backdrop-filter: blur(6px); animation: fadeUp 0.3s ease both; padding: 20px;">
      <div style="width: min(430px, 90vw); display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: clamp(18px, 3.5vh, 28px) 24px; border-radius: 22px; background: rgba(10,16,34,0.72); border: 1px solid rgba(142,245,200,0.3); box-shadow: 0 0 60px rgba(111,215,168,0.2);">
        <div style="font-size: 34px; line-height: 1; color: #8ef5c8; text-shadow: 0 0 24px rgba(142,245,200,0.7);">${v.eventIcon}</div>
        <div style="font-size: 10px; letter-spacing: 0.35em; color: #6fd7a8; text-transform: uppercase;">${v.L.newPhase}</div>
        <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(18px, 3.6vh, 26px); color: #f2f6ff;">${v.eventName}</div>
        <div style="font-size: clamp(13px, 2.3vh, 15px); line-height: 1.7; color: #c4d2ea;">${v.eventDesc}</div>
        <button data-click="${H(v.onCloseEvent)}" data-stop style="min-height: clamp(44px, 6.5vh, 52px); padding: 0 34px; border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(12px, 2.2vh, 14px); letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;">${v.L.cont}</button>
      </div>
    </div>`);
  }

  // ---- 12. Oyun Sonu ----
  if (v.showOver) {
    out.push(`
    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(5px, 1.4vh, 12px); text-align: center; padding: calc(12px + env(safe-area-inset-top)) 24px calc(12px + env(safe-area-inset-bottom)); background: radial-gradient(ellipse at 50% 40%, rgba(8,14,30,0.25), rgba(3,5,14,0.85)); animation: fadeUp 0.4s ease both; pointer-events: none; overflow: hidden;">
      ${v.isRecord ? `<div style="font-family: 'Unbounded', sans-serif; font-size: 13px; letter-spacing: 0.4em; color: #ffe9a3; text-transform: uppercase; text-shadow: 0 0 22px rgba(255,233,163,0.6);">${v.L.newRecord}</div>` : ''}
      <div style="font-size: clamp(10px, 1.8vh, 12px); letter-spacing: 0.3em; color: #5b6b8c; text-transform: uppercase;">${v.L.lightOut}</div>
      <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(34px, 12vh, 100px); color: #f2f6ff; line-height: 1; text-shadow: 0 0 60px rgba(165,200,255,0.4);">${v.scoreLabel}</div>
      <div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center;">
        <div style="font-size: clamp(12px, 2.2vh, 14px); color: #9fb0d0;">${v.L.record} <b style="color:#ffe9a3;">${v.bestLabel}</b></div>
        <div style="font-size: clamp(12px, 2.2vh, 14px); color: #9fb0d0;">${v.L.streakW} <b style="color:#8ef5c8;">${v.maxStreakLabel}</b></div>
        <div style="font-size: clamp(12px, 2.2vh, 14px); color: #9fb0d0;">${v.L.bullseyeW} <b style="color:#c9a5ff;">${v.perfectLabel}</b></div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 999px; background: rgba(255,233,163,0.1); border: 1px solid rgba(255,233,163,0.3);">
        <span style="color: #ffe9a3; font-size: clamp(13px, 2.3vh, 16px);">✦</span>
        <span style="font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.4vh, 17px); color: #ffe9a3;">${v.runCreditsLabel} ${v.L.creditsW}</span>
        <span style="font-size: clamp(10px, 1.8vh, 12px); color: #9fb0d0;">· ${v.L.totalW} ✦ ${v.creditsLabel}</span>
      </div>
      ${v.showChase ? `
      <div style="display: flex; flex-direction: column; gap: 5px; align-items: center; width: min(340px, 70vw);">
        <div style="display: flex; justify-content: space-between; width: 100%; font-size: 12px; color: #7c8db0;">
          <span>${v.chaseRemain}</span>
          <span style="color: #ffe9a3; font-weight: 700;">${v.chasePct}</span>
        </div>
        <div style="width: 100%; height: 8px; border-radius: 999px; background: rgba(124,141,176,0.2); overflow: hidden;">
          <div style="height: 100%; border-radius: 999px; background: linear-gradient(90deg, #ffe9a3, #d9a94f); box-shadow: 0 0 12px rgba(255,233,163,0.5); width: ${v.chasePct};"></div>
        </div>
      </div>` : ''}
      <div style="margin-top: clamp(2px, 1vh, 6px); display: flex; flex-direction: column; gap: 6px; align-items: center; width: min(340px, 70vw);">
        <div style="display: flex; justify-content: space-between; width: 100%; font-size: 12px; color: #7c8db0;">
          <span style="color: #a5c8ff; font-weight: 700;">${v.rankName}</span>
          <span>${v.nextRankLabel}</span>
        </div>
        <div style="width: 100%; height: 6px; border-radius: 999px; background: rgba(124,141,176,0.2); overflow: hidden;">
          <div style="height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6fd7a8, #a5c8ff); width: ${v.rankProgress};"></div>
        </div>
      </div>
      ${v.hasHistory ? `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: center; margin-top: clamp(2px, 1vh, 6px);">
        <div style="font-size: clamp(9px, 1.6vh, 11px); letter-spacing: 0.2em; color: #5b6b8c; text-transform: uppercase;">${v.L.lastGames}</div>
        ${v.historyList.map((h) => `<div style="font-size: clamp(11px, 2vh, 13px); color: #9fb0d0; padding: 3px 10px; border-radius: 999px; background: rgba(124,141,176,0.12);">${h.s}</div>`).join('')}
      </div>` : ''}
      <div data-stop style="margin-top: clamp(8px, 2vh, 16px); display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; pointer-events: auto;">
        <button data-click="${H(v.onPlay)}" style="min-height: clamp(44px, 6.5vh, 52px); padding: 0 34px; border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.2vh, 15px); letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 30px rgba(111,215,168,0.4);">${v.L.playAgain}</button>
        <button data-click="${H(v.onMenu)}" style="min-height: clamp(44px, 6.5vh, 52px); padding: 0 30px; border: 1px solid rgba(159,176,208,0.4); border-radius: 999px; background: rgba(159,176,208,0.08); color: #cfd9ee; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(12px, 2vh, 14px); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;">${v.L.mainMenu}</button>
        <button data-click="${H(v.onOpenShop)}" style="min-height: clamp(44px, 6.5vh, 52px); padding: 0 30px; border: 1px solid rgba(255,233,163,0.4); border-radius: 999px; background: rgba(30,24,8,0.55); color: #ffe9a3; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(12px, 2vh, 14px); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;">${v.L.shop}</button>
      </div>
    </div>`);
  }

  // ---- 13. Oyun içi HUD (duraklat/çık) ----
  if (v.showPlayHud) {
    out.push(`
    <div data-stop style="position: absolute; top: calc(10px + env(safe-area-inset-top)); right: calc(12px + env(safe-area-inset-right)); z-index: 42; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; pointer-events: auto;">
      <div style="display: flex; gap: 8px;">
        <button data-click="${H(v.onPause)}" aria-label="Duraklat" style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid rgba(159,176,208,0.3); border-radius: 999px; background: rgba(6,10,24,0.62); cursor: pointer; padding: 0;"><span style="display: block; width: 3px; height: 11px; border-radius: 2px; background: #cfd9ee;"></span><span style="display: block; width: 3px; height: 11px; border-radius: 2px; background: #cfd9ee;"></span></button>
        <button data-click="${H(v.onQuitRun)}" aria-label="Çıkış" style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,138,155,0.3); border-radius: 999px; background: rgba(24,6,10,0.62); color: #ff8a9b; font-size: 13px; line-height: 1; cursor: pointer; padding: 0;">✕</button>
      </div>
      <div style="font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #7c8db0; text-shadow: 0 1px 6px rgba(3,5,14,0.8); padding-right: 2px;">${v.phaseNameLabel}</div>
    </div>`);
  }

  // ---- 14. Duraklatıldı ----
  if (v.showPaused) {
    out.push(`
    <div data-stop style="position: absolute; inset: 0; z-index: 60; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(8px, 2vh, 16px); text-align: center; padding: 24px; background: rgba(3,5,14,0.88); backdrop-filter: blur(6px); animation: fadeUp 0.3s ease both; pointer-events: auto;">
      <div style="display: flex; gap: 7px;"><span style="display: block; width: 7px; height: 30px; border-radius: 3px; background: #8ef5c8; box-shadow: 0 0 18px rgba(142,245,200,0.5);"></span><span style="display: block; width: 7px; height: 30px; border-radius: 3px; background: #8ef5c8; box-shadow: 0 0 18px rgba(142,245,200,0.5);"></span></div>
      <div style="font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(20px, 4vh, 30px); letter-spacing: 0.18em; color: #f2f6ff;">${v.L.paused}</div>
      <div style="font-size: clamp(12px, 2.2vh, 14px); color: #9fb0d0;">${v.L.curScore} <b style="color: #ffe9a3; font-family: 'Unbounded', sans-serif;">${v.pauseScoreLabel}</b></div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: clamp(6px, 1.6vh, 12px);">
        <button data-click="${H(v.onResume)}" style="min-height: clamp(46px, 7vh, 54px); padding: 0 36px; border: none; border-radius: 999px; background: linear-gradient(135deg, #6fd7a8, #4fb3c9); color: #04121a; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: clamp(13px, 2.2vh, 15px); letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 30px rgba(111,215,168,0.4);">${v.L.resume}</button>
        <button data-click="${H(v.onQuitRun)}" style="min-height: clamp(46px, 7vh, 54px); padding: 0 30px; border: 1px solid rgba(255,138,155,0.4); border-radius: 999px; background: rgba(24,6,10,0.5); color: #ff8a9b; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(12px, 2vh, 14px); letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;">${v.L.quitRun}</button>
      </div>
      <div style="font-size: clamp(11px, 1.9vh, 12.5px); color: #5b6b8c; max-width: 300px; line-height: 1.6;">${v.L.quitNote}</div>
    </div>`);
  }

  return out.join('');
}
