/* ============================================
   数据结构学习网站 - 主应用逻辑
   ============================================ */

// --- 页面路由 ---
let currentPage = 'home';
let currentTopic = null;

function navigateTo(page) {
  currentPage = page;
  // 更新导航标签
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.page === page);
  });
  // 切换页面
  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === `page-${page}`);
  });

  if (page === 'data-structures') {
    renderSidebar();
    // 默认展示第一个主题
    const firstTopic = DS_DATA.modules[0].topics[0];
    selectTopic(firstTopic, DS_DATA.modules[0]);
  }

  if (page === 'home' || page === 'ai-tool') {
    currentTopic = null;
    window._dsContext = { moduleTitle: '', topicTitle: '', topicContent: '', topicErrors: '' };
    if (typeof AIAssistant !== 'undefined') AIAssistant.updateContext();
  }

  // 滚动到顶部
  window.scrollTo(0, 0);
}

// --- 首页初始化 ---
function initHome() {
  const cardsContainer = document.getElementById('home-cards');
  if (!cardsContainer) return;

  cardsContainer.innerHTML = `
    <div class="home-card" onclick="navigateTo('data-structures'); setTimeout(() => selectModule('linear'), 100);">
      <div class="home-card-icon">📊</div>
      <h3>线性结构</h3>
      <p>顺序表、链表、栈、队列 —— 最基础的线性数据组织方式</p>
    </div>
    <div class="home-card" onclick="navigateTo('data-structures'); setTimeout(() => selectModule('tree'), 100);">
      <div class="home-card-icon">🌳</div>
      <h3>树形结构</h3>
      <p>二叉树、BST、AVL、堆、哈夫曼树 —— 层次化的数据关系</p>
    </div>
    <div class="home-card" onclick="navigateTo('data-structures'); setTimeout(() => selectModule('graph'), 100);">
      <div class="home-card-icon">🕸️</div>
      <h3>图形结构</h3>
      <p>图的存储、遍历、最短路径、最小生成树 —— 复杂的网络关系</p>
    </div>
    <div class="home-card" onclick="navigateTo('data-structures'); setTimeout(() => selectModule('search'), 100);">
      <div class="home-card-icon">🔍</div>
      <h3>查找算法</h3>
      <p>二分查找、哈希表 —— 快速定位目标数据</p>
    </div>
    <div class="home-card" onclick="navigateTo('data-structures'); setTimeout(() => selectModule('sort'), 100);">
      <div class="home-card-icon">📋</div>
      <h3>排序算法</h3>
      <p>冒泡、选择、插入、快排、归并、堆排 —— 让数据井然有序</p>
    </div>
    <div class="home-card" onclick="navigateTo('ai-tool');">
      <div class="home-card-icon">🤖</div>
      <h3>AI 代码评估</h3>
      <p>提交你的代码，AI 帮你分析问题并提供修正建议</p>
    </div>
  `;
}

// --- 侧边栏渲染 ---
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  let html = '<div class="sidebar-title">📚 知识模块</div>';

  DS_DATA.modules.forEach(mod => {
    html += `
      <div class="module-group">
        <button class="module-header" onclick="toggleModule(this, '${mod.id}')">
          <span>${mod.icon}</span> ${mod.title}
          <span class="arrow">▶</span>
        </button>
        <div class="module-topics" id="topics-${mod.id}">
          ${mod.topics.map(t => `
            <button class="topic-link" data-module="${mod.id}" data-topic="${t.id}"
                    onclick="selectTopicById('${mod.id}', '${t.id}')">
              ${t.title}
            </button>
          `).join('')}
        </div>
      </div>`;
  });

  sidebar.innerHTML = html;
}

function toggleModule(btn, moduleId) {
  btn.classList.toggle('open');
  const topics = document.getElementById(`topics-${moduleId}`);
  if (topics) {
    topics.classList.toggle('open');
  }
}

function selectModule(moduleId) {
  // 展开对应模块
  const topics = document.getElementById(`topics-${moduleId}`);
  if (topics && !topics.classList.contains('open')) {
    topics.classList.add('open');
    const header = topics.previousElementSibling;
    if (header) header.classList.add('open');
  }
  // 选中第一个主题
  const mod = DS_DATA.modules.find(m => m.id === moduleId);
  if (mod && mod.topics.length > 0) {
    selectTopic(mod.topics[0], mod);
  }
}

function selectTopicById(moduleId, topicId) {
  const mod = DS_DATA.modules.find(m => m.id === moduleId);
  const topic = mod ? mod.topics.find(t => t.id === topicId) : null;
  if (topic && mod) {
    selectTopic(topic, mod);
  }
}

function selectTopic(topic, mod) {
  currentTopic = topic;

  // 更新 AI 助手上下文
  window._dsContext = {
    moduleTitle: mod.title,
    topicTitle: topic.title,
    topicContent: topic.concept + ' ' + topic.keyPoints.join(' '),
    topicErrors: topic.commonErrors ? topic.commonErrors.map(e => e.desc).join('；') : ''
  };
  if (typeof AIAssistant !== 'undefined') {
    AIAssistant.updateContext();
  }
  // 记录访问
  if (typeof StateTracker !== 'undefined') {
    StateTracker.recordVisit(mod.title, topic.title);
  }

  // 更新侧边栏高亮
  document.querySelectorAll('.topic-link').forEach(link => {
    link.classList.toggle('active',
      link.dataset.module === mod.id && link.dataset.topic === topic.id);
  });

  // 确保侧边栏模块展开
  const topicsDiv = document.getElementById(`topics-${mod.id}`);
  if (topicsDiv && !topicsDiv.classList.contains('open')) {
    topicsDiv.classList.add('open');
    const header = topicsDiv.previousElementSibling;
    if (header) header.classList.add('open');
  }

  // 渲染内容
  renderTopicContent(topic, mod);
}

// --- 渲染知识点内容 ---
function renderTopicContent(topic, mod) {
  const container = document.getElementById('content-area');
  if (!container) return;

  const diffStars = (level) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += `<span class="star${i >= level ? ' empty' : ''}">⭐</span>`;
    }
    return stars;
  };

  const errorTags = { error: '严重', warning: '注意', info: '提示' };
  const tagClasses = { error: 'tag-error', warning: 'tag-warning', info: 'tag-info' };

  let html = `
    <div class="content-header">
      <div class="breadcrumb">${mod.icon} ${mod.title} / ${topic.title}</div>
      <h2>${topic.title}</h2>
      <span class="difficulty" title="难度">${diffStars(topic.difficulty)}</span>
    </div>

    <!-- 概念解释 -->
    <div class="content-section">
      <h3>概念解释</h3>
      ${topic.concept}
    </div>

    <!-- 核心知识点 -->
    <div class="content-section">
      <h3>核心知识点</h3>
      <ul>
        ${topic.keyPoints.map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>

    <!-- 常见错误 -->
    <div class="content-section">
      <h3>常见错误</h3>
      ${topic.commonErrors.map(e => `
        <div class="info-card">
          <span class="tag ${tagClasses[e.tag] || 'tag-info'}">${errorTags[e.tag] || e.tag}</span>
          <span style="margin-left:8px;">${e.desc}</span>
        </div>
      `).join('')}
    </div>

    <!-- 对比/注意事项 -->
    ${topic.comparison ? `
    <div class="content-section">
      <h3>对比总结</h3>
      <div class="info-card">
        <p>${topic.comparison}</p>
      </div>
    </div>
    ` : ''}

    <!-- 代码示例 -->
    ${topic.codeExamples && Object.keys(topic.codeExamples).length > 0 ? `
    <div class="content-section">
      <h3>代码示例</h3>
      ${Object.entries(topic.codeExamples).map(([lang, code]) => `
        <div class="code-block">
          <div class="code-block-header">
            <span class="code-lang">${lang === 'cpp' ? 'C++' : 'Python'}</span>
            <button class="code-copy-btn" onclick="copyCode(this, '${escapeHtml(code)}')">📋 复制</button>
          </div>
          <pre><code class="language-${lang === 'cpp' ? 'cpp' : 'python'}">${escapeHtml(code)}</code></pre>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- 排序总结表 -->
    ${topic.comparisonTable ? `
    <div class="content-section">
      <h3>排序算法全面对比</h3>
      <div style="overflow-x:auto;">
      <table class="compare-table">
        <thead>
          <tr>${DS_DATA.sortSummary.columns.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${DS_DATA.sortSummary.rows.map(row => `
            <tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    </div>
    ` : ''}

    <!-- 复杂度 -->
    <div class="content-section">
      <h3>复杂度分析</h3>
      <div class="info-card">
        <h4>⏱ 时间复杂度</h4>
        <p>${topic.complexity.time}</p>
      </div>
      <div class="info-card">
        <h4>💾 空间复杂度</h4>
        <p>${topic.complexity.space}</p>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // 高亮代码
  if (typeof hljs !== 'undefined') {
    container.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }

  // 滚动到顶部
  container.scrollTop = 0;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- 复制代码 ---
function copyCode(btn, code) {
  const decoded = code
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  navigator.clipboard.writeText(decoded).then(() => {
    btn.textContent = '✅ 已复制';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 复制';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ============================================
// AI 代码评估工具
// ============================================
let isAnalyzing = false;

async function analyzeCode() {
  if (isAnalyzing) return;

  const codeInput = document.getElementById('code-input');
  const language = document.getElementById('language-select').value;
  const submitBtn = document.getElementById('submit-btn');
  const resultPanel = document.getElementById('result-panel');

  const code = codeInput.value.trim();
  if (!code) {
    showToast('请先输入代码！', 'warning');
    return;
  }

  if (code.length < 10) {
    showToast('代码太短，请提供更完整的代码片段', 'warning');
    return;
  }

  isAnalyzing = true;
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // 显示加载状态
  resultPanel.innerHTML = `
    <div class="result-empty">
      <div class="icon">🤔</div>
      <p>AI 正在分析你的代码...</p>
      <div style="margin-top:16px;">
        <div class="spinner" style="width:24px;height:24px;border-width:3px;display:block;margin:0 auto;"></div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `请求失败 (${response.status})`);
    }

    const data = await response.json();
    renderAnalysisResult(data);
  } catch (err) {
    resultPanel.innerHTML = `
      <div class="result-empty">
        <div class="icon">⚠️</div>
        <p style="color: var(--error);">分析失败: ${escapeHtml(err.message)}</p>
        <p style="margin-top:8px;font-size:0.85rem;">请确保后端服务已启动，且已配置 API Key</p>
      </div>
    `;
  } finally {
    isAnalyzing = false;
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function renderAnalysisResult(data) {
  const resultPanel = document.getElementById('result-panel');

  if (!data || (!data.issues && !data.overall_assessment)) {
    resultPanel.innerHTML = `
      <div class="result-empty">
        <div class="icon">🤷</div>
        <p>AI 没有返回有效的分析结果，请重试</p>
      </div>
    `;
    return;
  }

  const severityLabels = { error: '严重问题', warning: '需要注意', info: '优化建议' };
  const severityClasses = { error: 'severity-error', warning: 'severity-warning', info: 'severity-info' };

  let html = '';

  // 综合评估
  if (data.overall_assessment) {
    const score = data.issues && data.issues.length === 0 ? 'A+' :
                  data.issues && data.issues.filter(i => i.severity === 'error').length === 0 ? 'B+' : 'C';
    html += `
      <div class="assessment-card">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          <span class="score">${score}</span>
          <span style="font-weight:600;color:var(--text);">综合评估</span>
        </div>
        <p style="color:var(--text-secondary);line-height:1.7;">${escapeHtml(data.overall_assessment)}</p>
      </div>
    `;
  }

  // 问题列表
  if (data.issues && data.issues.length > 0) {
    html += `<h3 style="margin-bottom:16px;color:var(--text);">📋 发现 ${data.issues.length} 个问题</h3>`;
    data.issues.forEach((issue, idx) => {
      const severity = issue.severity || 'info';
      html += `
        <div class="issue-item">
          <div class="issue-header">
            <span class="issue-number ${severityClasses[severity] || 'severity-info'}">${idx + 1}</span>
            <span class="issue-severity ${severityClasses[severity] || 'severity-info'}">${severityLabels[severity] || severity}</span>
            ${issue.line ? `<span style="color:var(--text-light);font-size:0.8rem;">第 ${issue.line} 行</span>` : ''}
          </div>
          <div class="issue-desc">${escapeHtml(issue.description || '')}</div>
          ${issue.fix ? `
            <div class="issue-fix">
              <strong>💡 修正建议：</strong>${escapeHtml(issue.fix)}
            </div>
          ` : ''}
        </div>
      `;
    });
  } else if (data.issues && data.issues.length === 0) {
    html += `
      <div class="assessment-card" style="text-align:center;">
        <div style="font-size:3rem;margin-bottom:8px;">🎉</div>
        <h3 style="color:var(--success);">代码看起来不错！</h3>
        <p style="color:var(--text-secondary);">AI 未发现明显问题</p>
      </div>
    `;
  }

  // 修正后的代码
  if (data.corrected_code) {
    html += `
      <div class="corrected-code-section">
        <h4>✅ 修正后的代码</h4>
        <div class="code-block">
          <div class="code-block-header">
            <span class="code-lang">修正代码</span>
            <button class="code-copy-btn" onclick="copyCode(this, '${escapeHtml(data.corrected_code)}')">📋 复制</button>
          </div>
          <pre><code>${escapeHtml(data.corrected_code)}</code></pre>
        </div>
      </div>
    `;
  }

  resultPanel.innerHTML = html;

  // 高亮代码
  if (typeof hljs !== 'undefined') {
    resultPanel.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
}

// --- Toast 提示 ---
function showToast(message, type) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      padding: 12px 24px; border-radius: 8px; color: white; font-weight: 500;
      z-index: 9999; transition: all 0.3s ease; opacity: 0;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  const colors = { error: '#ef4444', warning: '#f59e0b', success: '#10b981', info: '#6366f1' };
  toast.style.background = colors[type] || colors.info;
  toast.textContent = message;
  toast.style.opacity = '1';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 3000);
}

// --- 键盘快捷键 ---
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter 提交代码分析
  if (e.ctrlKey && e.key === 'Enter' && currentPage === 'ai-tool') {
    e.preventDefault();
    analyzeCode();
  }
  // Ctrl+1/2/3 切换页面
  if (e.ctrlKey && e.key === '1') { e.preventDefault(); navigateTo('home'); }
  if (e.ctrlKey && e.key === '2') { e.preventDefault(); navigateTo('data-structures'); }
  if (e.ctrlKey && e.key === '3') { e.preventDefault(); navigateTo('ai-tool'); }
});

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
  // 页面加载时初始化
  initHome();

  // 绑定导航标签
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      navigateTo(tab.dataset.page);
    });
  });

  // 绑定AI提交按钮
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', analyzeCode);
  }

  // 导航到首页
  navigateTo('home');
});
