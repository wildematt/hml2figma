// toolbar.js — 浮动捕获模式选择控制条
(function () {
    const HOST_ID = '__h2f_toolbar_host__';

    // 如果已存在，先移除
    const existing = document.getElementById(HOST_ID);
    if (existing) existing.remove();

    // ── 设备尺寸预设 ──
    const DEVICE_PRESETS = [
        { group: 'Phone', items: [
            { name: 'iPhone 17',               w: 402, h: 874 },
            { name: 'iPhone 16 & 17 Pro',      w: 402, h: 874 },
            { name: 'iPhone 16',               w: 393, h: 852 },
            { name: 'iPhone 16 & 17 Pro Max',  w: 440, h: 956 },
            { name: 'iPhone 16 Plus',          w: 430, h: 932 },
            { name: 'iPhone Air',              w: 420, h: 912 },
            { name: 'iPhone 14 & 15 Pro Max',  w: 430, h: 932 },
            { name: 'iPhone 14 & 15 Pro',      w: 393, h: 852 },
            { name: 'iPhone 13 & 14',          w: 390, h: 844 },
            { name: 'iPhone 14 Plus',          w: 428, h: 926 },
            { name: 'Android Compact',         w: 412, h: 917 },
            { name: 'Android Medium',          w: 700, h: 840 },
        ]},
        { group: 'Tablet', items: [
            { name: 'iPad mini 8.3',           w: 744, h: 1133 },
            { name: 'Surface Pro 8',           w: 1440, h: 960 },
            { name: 'iPad Pro 11"',            w: 834, h: 1194 },
            { name: 'iPad Pro 12.9"',          w: 1024, h: 1366 },
            { name: 'Android Expanded',        w: 1280, h: 800 },
        ]},
        { group: 'Desktop', items: [
            { name: 'MacBook Air',             w: 1280, h: 832 },
            { name: 'MacBook Pro 14"',         w: 1512, h: 982 },
            { name: 'MacBook Pro 16"',         w: 1728, h: 1117 },
            { name: 'Desktop',                 w: 1440, h: 1024 },
            { name: 'Wireframes',              w: 1440, h: 1024 },
            { name: 'TV',                      w: 1280, h: 720 },
        ]},
    ];

    let selectedDevice = null; // null = 自适应

    // ── 创建 Shadow DOM 宿主 ──
    const host = document.createElement('div');
    host.id = HOST_ID;
    const shadow = host.attachShadow({ mode: 'closed' });

    // ── 样式 ──
    const style = document.createElement('style');
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    :host {
      all: initial;
    }

    @keyframes toolbar-pop {
      from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.92); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    }
    @keyframes toolbar-fade {
      to { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.96); }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(13,153,255,0.4); }
      50%      { box-shadow: 0 0 0 6px rgba(13,153,255,0); }
    }

    .toolbar-wrapper {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      animation: toolbar-pop .35s cubic-bezier(0.16, 1, 0.3, 1) both;
      font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .toolbar-wrapper.closing {
      animation: toolbar-fade .22s ease-out forwards;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 44px;
      padding: 0 6px;
      border-radius: 14px;
      background: #1e1e1e;
      box-shadow: 0 4px 24px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.08);
      user-select: none;
      -webkit-user-select: none;
    }

    .toolbar-label {
      color: rgba(255,255,255,.55);
      font-size: 12px;
      font-weight: 500;
      padding: 0 8px 0 10px;
      white-space: nowrap;
      letter-spacing: 0.01em;
    }

    .divider {
      width: 1px;
      align-self: stretch;
      margin: 10px 2px;
      background: rgba(255,255,255,.12);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 12px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(255,255,255,.9);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.01em;
      cursor: pointer;
      white-space: nowrap;
      transition: background .15s, color .15s;
    }
    .btn:hover {
      background: rgba(255,255,255,.1);
    }
    .btn:active {
      background: rgba(255,255,255,.16);
    }
    .btn svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .btn-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      transition: background .15s;
    }
    .btn-close:hover {
      background: rgba(255,255,255,.1);
    }
    .btn-close:active {
      background: rgba(255,255,255,.16);
    }
    .btn-close svg {
      width: 18px;
      height: 18px;
    }

    /* ── 元素选择模式 ── */
    .highlight-overlay {
      position: fixed;
      pointer-events: none;
      border: 2px dashed #0d99ff;
      background: rgba(13,153,255,.08);
      border-radius: 4px;
      z-index: 2147483645;
      box-sizing: border-box;
      transition: top .1s, left .1s, width .1s, height .1s;
    }

    .element-tooltip {
      position: fixed;
      pointer-events: none;
      background: rgba(255,255,255,.95);
      color: #1e1e1e;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      font-weight: 500;
      z-index: 2147483646;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
    }

    .selecting-hint {
      color: rgba(13,153,255,1);
      font-size: 12px;
      font-weight: 500;
      padding: 0 8px;
      white-space: nowrap;
    }

    /* ── 设备尺寸选择器 ── */
    .size-selector {
      position: relative;
    }

    .size-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 32px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(255,255,255,.9);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background .15s;
    }
    .size-btn:hover {
      background: rgba(255,255,255,.1);
    }
    .size-btn:active, .size-btn.active {
      background: rgba(255,255,255,.16);
    }
    .size-btn svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    .size-btn .chevron {
      width: 10px;
      height: 10px;
      opacity: .5;
      transition: transform .2s;
    }
    .size-btn.active .chevron {
      transform: rotate(180deg);
    }
    .size-label-text {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .size-dims {
      color: rgba(255,255,255,.4);
      font-size: 11px;
      font-weight: 400;
    }

    .size-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      min-width: 240px;
      max-height: 420px;
      overflow-y: auto;
      background: #2c2c2c;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08);
      padding: 6px;
      z-index: 2147483647;
      animation: toolbar-pop .2s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .size-dropdown::-webkit-scrollbar {
      width: 6px;
    }
    .size-dropdown::-webkit-scrollbar-track {
      background: transparent;
    }
    .size-dropdown::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,.15);
      border-radius: 3px;
    }

    .size-group-label {
      color: rgba(255,255,255,.35);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 8px 10px 4px;
    }

    .size-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: background .12s;
      border: none;
      background: transparent;
      width: 100%;
      font-family: inherit;
      text-align: left;
    }
    .size-option:hover {
      background: rgba(255,255,255,.08);
    }
    .size-option.selected {
      background: rgba(13,153,255,.18);
    }
    .size-option-name {
      color: rgba(255,255,255,.85);
      font-size: 12px;
      font-weight: 500;
    }
    .size-option-dims {
      color: rgba(255,255,255,.35);
      font-size: 11px;
      font-weight: 400;
      font-variant-numeric: tabular-nums;
    }
    .size-option.selected .size-option-name {
      color: #5bb8ff;
    }
    .size-option.selected .size-option-dims {
      color: rgba(91,184,255,.5);
    }

    .size-divider {
      height: 1px;
      background: rgba(255,255,255,.08);
      margin: 4px 6px;
    }
  `;
    shadow.appendChild(style);

    // ── SVG 图标 ──
    const icons = {
        page: `<svg viewBox="0 0 24 24" fill="none"><path d="M17 6a2 2 0 0 1 2 2v8l-.01.204a2 2 0 0 1-1.786 1.785L17 18H7l-.204-.01a2 2 0 0 1-1.785-1.786L5 16V8a2 2 0 0 1 2-2zM6 16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5H6zm1-9a1 1 0 0 0-.995.897L6 8v2h12V8a1 1 0 0 0-1-1zm.5 1a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1m2 0a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1" fill="rgba(255,255,255,.9)"/></svg>`,
        select: `<svg viewBox="0 0 24 24" fill="none"><path d="M9.321 5.532a.5.5 0 0 1 .653.27l.777 1.876c.102.245-.039.524-.285.626s-.537.002-.639-.244L9.05 6.186a.5.5 0 0 1 .271-.654m-1.26 4.295L6.186 9.05a.5.5 0 0 0-.383.924l1.875.777c.246.101.524-.04.626-.285.102-.246.003-.537-.243-.64m-.383 3.422-1.875.776a.5.5 0 1 0 .383.924l1.875-.777c.246-.102.345-.393.243-.639s-.38-.386-.626-.284m2.149 2.69-.777 1.874a.5.5 0 0 0 .924.383l.777-1.875c.102-.245-.04-.524-.285-.626s-.537-.002-.639.244m6.495-5.188 1.874-.777a.5.5 0 1 0-.382-.924l-1.875.777c-.246.101-.346.393-.244.639s.381.386.627.285m-2.15-2.69.777-1.875a.5.5 0 1 0-.924-.383l-.776 1.875c-.102.245.039.524.284.626.246.102.538.002.64-.244m-1.82 3.002a1 1 0 0 0-1.288 1.288l2.25 6a1 1 0 0 0 1.906-.109l.605-2.418 2.418-.604a1 1 0 0 0 .108-1.907zm3.94 3.614L15 15l-.323 1.29L14.25 18l-.618-1.65-1.166-3.108L12 12l1.243.466 3.108 1.165L18 14.25z" fill="rgba(255,255,255,.9)" fill-rule="evenodd"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none"><path d="M17.354 6.646a.5.5 0 0 1 0 .708L12.707 12l4.647 4.646a.5.5 0 0 1-.708.708L12 12.707l-4.646 4.647a.5.5 0 0 1-.708-.708L11.293 12 6.646 7.354a.5.5 0 0 1 .708-.707L12 11.293l4.646-4.647a.5.5 0 0 1 .708 0" fill="rgba(255,255,255,.5)" fill-rule="evenodd"/></svg>`,
        device: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H7zm5 13.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" fill="rgba(255,255,255,.9)" fill-rule="evenodd"/></svg>`,
        chevron: `<svg class="chevron" viewBox="0 0 10 10" fill="none"><path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="rgba(255,255,255,.7)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };

    // ── 构建 DOM ──
    const wrapper = document.createElement('div');
    wrapper.className = 'toolbar-wrapper';

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    // 标签
    const label = document.createElement('span');
    label.className = 'toolbar-label';
    label.textContent = 'Html2Figma';

    // 分隔线
    const makeDivider = () => { const d = document.createElement('div'); d.className = 'divider'; return d; };

    // ── 设备尺寸选择器 ──
    const sizeSelector = document.createElement('div');
    sizeSelector.className = 'size-selector';

    const sizeBtn = document.createElement('button');
    sizeBtn.className = 'size-btn';
    function updateSizeBtnLabel() {
        if (selectedDevice) {
            sizeBtn.innerHTML = icons.device +
                `<span class="size-label-text">${selectedDevice.name}</span>` +
                `<span class="size-dims">${selectedDevice.w}×${selectedDevice.h}</span>` +
                icons.chevron;
        } else {
            sizeBtn.innerHTML = icons.device +
                `<span class="size-label-text">自适应</span>` +
                icons.chevron;
        }
    }
    updateSizeBtnLabel();

    let dropdownEl = null;

    function closeDropdown() {
        if (dropdownEl) { dropdownEl.remove(); dropdownEl = null; }
        sizeBtn.classList.remove('active');
    }

    function buildDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'size-dropdown';

        // "自适应"选项
        const autoOpt = document.createElement('button');
        autoOpt.className = 'size-option' + (selectedDevice === null ? ' selected' : '');
        autoOpt.innerHTML = '<span class="size-option-name">自适应</span><span class="size-option-dims">当前视口</span>';
        autoOpt.onclick = (e) => {
            e.stopPropagation();
            selectedDevice = null;
            updateSizeBtnLabel();
            closeDropdown();
        };
        dropdown.appendChild(autoOpt);

        DEVICE_PRESETS.forEach((group, gi) => {
            const divider = document.createElement('div');
            divider.className = 'size-divider';
            dropdown.appendChild(divider);

            const groupLabel = document.createElement('div');
            groupLabel.className = 'size-group-label';
            groupLabel.textContent = group.group;
            dropdown.appendChild(groupLabel);

            group.items.forEach(item => {
                const opt = document.createElement('button');
                const isSelected = selectedDevice && selectedDevice.name === item.name;
                opt.className = 'size-option' + (isSelected ? ' selected' : '');
                opt.innerHTML =
                    `<span class="size-option-name">${item.name}</span>` +
                    `<span class="size-option-dims">${item.w}×${item.h}</span>`;
                opt.onclick = (e) => {
                    e.stopPropagation();
                    selectedDevice = { name: item.name, w: item.w, h: item.h };
                    updateSizeBtnLabel();
                    closeDropdown();
                };
                dropdown.appendChild(opt);
            });
        });

        return dropdown;
    }

    sizeBtn.onclick = (e) => {
        e.stopPropagation();
        if (dropdownEl) {
            closeDropdown();
        } else {
            dropdownEl = buildDropdown();
            sizeSelector.appendChild(dropdownEl);
            sizeBtn.classList.add('active');
        }
    };

    sizeSelector.appendChild(sizeBtn);

    // 点击外部关闭下拉
    shadow.addEventListener('click', (e) => {
        if (!sizeSelector.contains(e.target)) closeDropdown();
    });

    // 按钮：捕获全页面
    const btnPage = document.createElement('button');
    btnPage.className = 'btn';
    btnPage.innerHTML = icons.page + '<span>捕获全页面</span>';

    // 按钮：选择模块
    const btnSelect = document.createElement('button');
    btnSelect.className = 'btn';
    btnSelect.innerHTML = icons.select + '<span>选择模块</span>';

    // 关闭按钮
    const btnClose = document.createElement('button');
    btnClose.className = 'btn-close';
    btnClose.innerHTML = icons.close;
    btnClose.title = '关闭';

    toolbar.appendChild(label);
    toolbar.appendChild(makeDivider());
    toolbar.appendChild(sizeSelector);
    toolbar.appendChild(makeDivider());
    toolbar.appendChild(btnPage);
    toolbar.appendChild(btnSelect);
    toolbar.appendChild(makeDivider());
    toolbar.appendChild(btnClose);
    wrapper.appendChild(toolbar);
    shadow.appendChild(wrapper);

    // ── 元素选择模式相关 ──
    let highlightEl = null;
    let tooltipEl = null;
    let hoveredElement = null;
    let selecting = false;
    let cursorStyle = null;

    function getSelector(el) {
        if (el === document.body) return 'body';
        if (el === document.documentElement) return 'html';
        if (el.id) return `#${CSS.escape(el.id)}`;
        // 尝试用 class
        if (el.classList.length > 0) {
            for (const cls of el.classList) {
                const sel = `.${CSS.escape(cls)}`;
                if (document.querySelectorAll(sel).length === 1) return sel;
            }
        }
        // 回退到路径
        const parts = [];
        let node = el;
        while (node && node !== document.body && node !== document.documentElement) {
            let tag = node.tagName.toLowerCase();
            if (node.id) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
            const parent = node.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
                if (siblings.length > 1) {
                    const idx = siblings.indexOf(node) + 1;
                    tag += `:nth-of-type(${idx})`;
                }
            }
            parts.unshift(tag);
            node = node.parentElement;
        }
        return parts.join(' > ');
    }

    function getLabel(el) {
        let t = el.tagName.toLowerCase();
        if (el.id) t += `#${el.id}`;
        else if (el.classList.length > 0) {
            t += '.' + Array.from(el.classList).slice(0, 2).join('.');
            if (el.classList.length > 2) t += '...';
        }
        if (t.length > 40) t = t.slice(0, 37) + '...';
        return t;
    }

    function positionTooltip(rect) {
        if (!tooltipEl) return;
        const tooltipRect = tooltipEl.getBoundingClientRect();
        let top, left;
        // 优先放在元素下方
        if (window.innerHeight - rect.bottom - 8 >= tooltipRect.height) {
            top = rect.bottom + 8;
        } else if (rect.top - 56 - 8 >= tooltipRect.height) {
            top = rect.top - tooltipRect.height - 8;
        } else {
            top = Math.max(60, Math.min(rect.bottom + 8, window.innerHeight - tooltipRect.height - 8));
        }
        left = rect.left;
        if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8;
        if (left < 8) left = 8;
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
    }

    function onMouseMove(e) {
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const target = els.find(el => el !== host && !host.contains(el));
        if (!target || target === hoveredElement) return;
        hoveredElement = target;
        const rect = target.getBoundingClientRect();
        if (highlightEl) {
            highlightEl.style.display = 'block';
            highlightEl.style.top = `${rect.top}px`;
            highlightEl.style.left = `${rect.left}px`;
            highlightEl.style.width = `${rect.width}px`;
            highlightEl.style.height = `${rect.height}px`;
        }
        if (tooltipEl) {
            tooltipEl.textContent = getLabel(target);
            tooltipEl.style.display = 'block';
            positionTooltip(rect);
        }
    }

    function onElementClick(e) {
        if (host.contains(e.target) || e.target === host) return;
        e.preventDefault();
        e.stopPropagation();
        const el = hoveredElement;
        if (!el) return;
        const selector = getSelector(el);
        exitSelecting();
        removeToolbar();
        captureWithSize({ selector });
    }

    function onKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (selecting) {
                exitSelecting();
                showMainToolbar();
            } else {
                removeToolbar();
            }
        }
    }

    function enterSelecting() {
        selecting = true;
        // 修改工具栏为选择提示
        toolbar.innerHTML = '';
        const hint = document.createElement('span');
        hint.className = 'selecting-hint';
        hint.textContent = '🎯 点击选择要捕获的元素';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => { exitSelecting(); showMainToolbar(); };
        toolbar.appendChild(hint);
        toolbar.appendChild(makeDivider());
        toolbar.appendChild(cancelBtn);

        // 添加高亮和 tooltip
        highlightEl = document.createElement('div');
        highlightEl.className = 'highlight-overlay';
        highlightEl.style.display = 'none';
        shadow.appendChild(highlightEl);

        tooltipEl = document.createElement('div');
        tooltipEl.className = 'element-tooltip';
        tooltipEl.style.display = 'none';
        shadow.appendChild(tooltipEl);

        // 添加十字光标
        cursorStyle = document.createElement('style');
        cursorStyle.id = '__h2f_cursor__';
        cursorStyle.textContent = '* { cursor: crosshair !important; }';
        document.head.appendChild(cursorStyle);

        document.addEventListener('mousemove', onMouseMove, true);
        document.addEventListener('click', onElementClick, true);
    }

    function exitSelecting() {
        selecting = false;
        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('click', onElementClick, true);
        if (highlightEl) { highlightEl.remove(); highlightEl = null; }
        if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
        if (cursorStyle) { cursorStyle.remove(); cursorStyle = null; }
        hoveredElement = null;
    }

    function showMainToolbar() {
        toolbar.innerHTML = '';
        toolbar.appendChild(label);
        toolbar.appendChild(makeDivider());
        toolbar.appendChild(sizeSelector);
        toolbar.appendChild(makeDivider());
        toolbar.appendChild(btnPage);
        toolbar.appendChild(btnSelect);
        toolbar.appendChild(makeDivider());
        toolbar.appendChild(btnClose);
    }

    function removeToolbar() {
        exitSelecting();
        document.removeEventListener('keydown', onKeyDown, true);
        wrapper.classList.add('closing');
        setTimeout(() => host.remove(), 250);
    }

    // ── 视口尺寸调整 ──
    let viewportStyleEl = null;
    const H2F_ROOT_ATTR = 'data-h2f-root';
    let didResizeWindow = false;

    function sendToBackground(msg) {
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendMessage(msg, (resp) => {
                    if (chrome.runtime.lastError) resolve(null);
                    else resolve(resp);
                });
            } catch (_) {
                resolve(null);
            }
        });
    }

    async function resizeWindowTo(device) {
        const chromeW = window.outerWidth - window.innerWidth;
        const chromeH = window.outerHeight - window.innerHeight;
        const resp = await sendToBackground({
            type: 'h2f-resize',
            width: device.w + chromeW,
            height: device.h + chromeH,
        });
        if (resp && resp.success) {
            didResizeWindow = true;
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        }
        return didResizeWindow;
    }

    async function restoreWindow() {
        if (didResizeWindow) {
            didResizeWindow = false;
            await sendToBackground({ type: 'h2f-restore' });
        }
    }

    function applyFrameCSS(device, isFullPage) {
        viewportStyleEl = document.createElement('style');
        viewportStyleEl.id = '__h2f_viewport__';

        if (isFullPage) {
            viewportStyleEl.textContent = `
                body, [${H2F_ROOT_ATTR}] {
                    width: ${device.w}px !important;
                    min-width: ${device.w}px !important;
                    max-width: ${device.w}px !important;
                    height: ${device.h}px !important;
                    min-height: ${device.h}px !important;
                    max-height: ${device.h}px !important;
                    overflow: hidden !important;
                    margin: 0 !important;
                    box-sizing: border-box !important;
                }
            `;
        } else {
            viewportStyleEl.textContent = `
                body {
                    width: ${device.w}px !important;
                    min-width: ${device.w}px !important;
                    max-width: ${device.w}px !important;
                    overflow-x: hidden !important;
                }
            `;
        }

        document.head.appendChild(viewportStyleEl);
    }

    function cleanupCSS() {
        if (viewportStyleEl) {
            viewportStyleEl.remove();
            viewportStyleEl = null;
        }
        document.body.removeAttribute(H2F_ROOT_ATTR);
    }

    async function captureWithSize(options) {
        if (!window.figma || !window.figma.captureForDesign) return;

        const device = selectedDevice;
        const isFullPage = !options.selector || options.selector === 'body';

        if (device) {
            await resizeWindowTo(device);

            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            applyFrameCSS(device, isFullPage);

            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            if (isFullPage) {
                document.body.setAttribute(H2F_ROOT_ATTR, '');
                options = Object.assign({}, options, { selector: `[${H2F_ROOT_ATTR}]` });
            }
        }

        try {
            await window.figma.captureForDesign(options);
        } finally {
            if (device) {
                cleanupCSS();
                restoreWindow();
            }
        }
    }

    // ── 按钮事件 ──
    btnPage.onclick = () => {
        closeDropdown();
        removeToolbar();
        captureWithSize({});
    };

    btnSelect.onclick = () => {
        closeDropdown();
        enterSelecting();
    };

    btnClose.onclick = () => {
        closeDropdown();
        removeToolbar();
    };

    // ESC 键关闭
    document.addEventListener('keydown', onKeyDown, true);

    // ── 插入页面 ──
    if (document.body) {
        document.body.appendChild(host);
    } else {
        const obs = new MutationObserver(() => {
            if (document.body) { obs.disconnect(); document.body.appendChild(host); }
        });
        obs.observe(document.documentElement, { childList: true });
    }
})();
