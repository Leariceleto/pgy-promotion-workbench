import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  FluentProvider,
  Input,
  Textarea,
  Tooltip,
  createDarkTheme,
  createLightTheme,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowDownload24Regular,
  ArrowRight24Regular,
  BookInformation24Regular,
  CalendarLtr24Regular,
  CheckmarkCircle24Regular,
  Copy24Regular,
  Cube24Regular,
  DataTrending24Regular,
  Dismiss24Regular,
  DocumentText24Regular,
  Lightbulb24Regular,
  Navigation24Regular,
  Save24Regular,
  Search24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
} from "@fluentui/react-icons";
import productsData from "./data/products.json";
import contentData from "./data/content-performance.json";
import salesData from "./data/sales-summary.json";
import "./styles.css";

const forestBrand = {
  10: "#07150f",
  20: "#0d241a",
  30: "#123426",
  40: "#174432",
  50: "#1c5540",
  60: "#23674e",
  70: "#2b795d",
  80: "#368b6d",
  90: "#469d7e",
  100: "#5aaf90",
  110: "#70c0a2",
  120: "#87d0b4",
  130: "#a0dfc6",
  140: "#bae9d8",
  150: "#d5f3e9",
  160: "#eefcf7",
};

const lightTheme = createLightTheme(forestBrand);
const darkTheme = createDarkTheme(forestBrand);

const NAV_ITEMS = [
  { id: "studio", label: "推广构思", icon: Lightbulb24Regular },
  { id: "products", label: "产品与服务", icon: Cube24Regular },
  { id: "content", label: "标题与内容", icon: DocumentText24Regular },
  { id: "rhythm", label: "推广节奏", icon: CalendarLtr24Regular },
  { id: "insights", label: "数据洞察", icon: DataTrending24Regular },
  { id: "sources", label: "资料来源", icon: BookInformation24Regular },
];

const NAV_META = Object.fromEntries(NAV_ITEMS.map((item) => [item.id, item]));

const DEFAULT_SELECTED = ["product-01", "product-46", "product-53"];

const DEFAULT_RHYTHM = [
  {
    id: "phase-1",
    phase: "议题预热",
    time: "第 1-2 周",
    goal: "让目标人群先看见问题，建立共同语境。",
    format: "趋势观察 / 问题稿",
    channel: "公众号头条 + 社群讨论",
  },
  {
    id: "phase-2",
    phase: "认知深化",
    time: "第 3-4 周",
    goal: "用方法、案例和判断解释问题为何值得解决。",
    format: "案例拆解 / 方法清单",
    channel: "公众号副一 + 视频号",
  },
  {
    id: "phase-3",
    phase: "产品解释",
    time: "第 5-6 周",
    goal: "把产品价值放回真实场景，说明适用对象与边界。",
    format: "产品深稿 / 场景问答",
    channel: "公众号 + 定向社群",
  },
  {
    id: "phase-4",
    phase: "行动转化",
    time: "第 7-8 周",
    goal: "用证据、体验与明确入口推动咨询或购买。",
    format: "客户案例 / 活动 / 销售跟进",
    channel: "社群 + 销售私域 + 商城",
  },
];

const PRODUCT_ALIASES = {
  AI学伴: ["AI学伴", "人工智能", "AI"],
  深度陪伴服务: ["深度陪伴", "陪伴式"],
  "2026《新校长》": ["新校长"],
  "2026《星教师》": ["星教师"],
  乐高森林课程联盟: ["乐高森林", "森林课程"],
  蒲公英教育智库k12学校一体化专业支持平台: ["一体化平台", "一体化专业支持"],
};

function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatPercent(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function monthLabel(month) {
  return `${Number(month.slice(5))}月`;
}

function productKeywords(product) {
  return [product.name, ...(PRODUCT_ALIASES[product.name] || [])]
    .filter(Boolean)
    .map((item) => item.toLowerCase());
}

function articleMatchesProduct(article, product) {
  const haystack = `${article.title || ""} ${article.product || ""}`.toLowerCase();
  return productKeywords(product).some((keyword) => haystack.includes(keyword));
}

function salesMatchesProduct(item, product) {
  const name = item.name.toLowerCase();
  return productKeywords(product).some((keyword) => name.includes(keyword));
}

function titleIdeas(selectedProducts, audience) {
  const names = selectedProducts.map((item) => item.name);
  const lead = names[0] || "一个重点产品";
  const pair = names.slice(0, 2).join("与") || "产品与服务";
  const audienceName = audience || "学校管理者";
  return [
    `当${audienceName}开始重新理解学习，${lead}真正解决的是什么？`,
    `${lead}落地学校的 5 个关键场景，哪一个最值得先做？`,
    `从真实问题出发：${audienceName}为什么需要${pair}？`,
    `一所学校如何把新理念变成日常行动？从${lead}说起`,
    `${pair}不是简单叠加，学校需要的是一条完整路径`,
    `先别急着谈产品，${audienceName}正在面对的 3 个变化更重要`,
  ];
}

function buildBrief({ selectedProducts, objective, audience, phase, channels, notes }) {
  const related = contentData.articles
    .filter((article) => selectedProducts.some((product) => articleMatchesProduct(article, product)))
    .sort((a, b) => b.reads - a.reads)
    .slice(0, 8);
  const articleEvidence = related.length ? related : contentData.topByReads.slice(0, 6);
  const salesEvidence = salesData.topProducts
    .filter((item) => selectedProducts.some((product) => salesMatchesProduct(item, product)))
    .slice(0, 6);

  const productSection = selectedProducts.length
    ? selectedProducts
        .map(
          (product, index) =>
            `${index + 1}. ${product.name}\n- 类别：${product.category}\n- 适用对象：${product.audience || "原始资料未明确"}\n- 核心价值：${product.value || product.description || "原始资料未明确"}`,
        )
        .join("\n\n")
    : "尚未选择推广对象。请先帮助我识别应该补充哪些对象。";

  const articleSection = articleEvidence
    .map(
      (article, index) =>
        `${index + 1}. ${article.title}｜${article.account}｜阅读 ${formatNumber(article.reads)}｜分享 ${formatNumber(article.shares)}`,
    )
    .join("\n");

  const salesSection = salesEvidence.length
    ? salesEvidence
        .map(
          (item, index) =>
            `${index + 1}. ${item.name}｜销量 ${formatNumber(item.units)}｜单品订单口径收入 ${formatCurrency(item.singleProductRevenue)}`,
        )
        .join("\n")
    : "当前销售聚合榜未匹配到所选对象，不能据此判断该对象没有销售。";

  return `你正在协助蒲公英教育智库进行一项长周期推广构思。\n\n【本轮任务】\n目标：${objective}\n目标人群：${audience}\n推广阶段：${phase}\n优先渠道：${channels}\n补充考虑：${notes || "暂无"}\n\n【推广对象】\n${productSection}\n\n【历史内容证据】\n${articleSection}\n\n【商城销售证据】\n${salesSection}\n\n【公司级参考口径】\n- 2026-01-01 至 2026-07-19，三个公众号共收录 ${formatNumber(contentData.overall.articleCount)} 篇有标题内容，平均阅读 ${formatNumber(contentData.overall.averageReads)}，中位阅读 ${formatNumber(contentData.overall.medianReads)}。\n- 2026-01-01 至 2026-07-16，商城实付订单 ${formatNumber(salesData.totals.paidOrders)} 单，净销售额 ${formatCurrency(salesData.totals.netSales)}。\n- 历史标题结构分类属于启发式分析，只可作为选题参考，不能直接当成因果结论。\n\n【请输出】\n1. 给出 3 条不同的推广主线，并说明各自服务的业务目标。\n2. 每条主线提供 5 个可继续打磨的标题，不要只替换关键词。\n3. 设计内容结构，区分议题内容、产品内容、案例内容和行动内容。\n4. 给出 8 周推广节奏，说明每个阶段的重点、渠道和承接动作。\n5. 判断这些对象应该独立推广还是组合推广，并说明产品排布逻辑。\n6. 明确列出还缺哪些事实、案例或数据，禁止自行补造。\n\n【边界】\n- 产品介绍来自 2026-07-14 的原始梳理材料，尚未逐条确认为正式口径。\n- 所有策略、标题和节奏都先作为建议，不自动改变正式任务状态。\n- 区分已知事实、基于数据的推断和创意建议。`;
}

function App() {
  const [view, setView] = useState("studio");
  const [themeMode, setThemeMode] = usePersistedState("pgy-workbench:theme", "light");
  const [selectedIds, setSelectedIds] = usePersistedState("pgy-workbench:selected", DEFAULT_SELECTED);
  const [thinkingRecords, setThinkingRecords] = usePersistedState("pgy-workbench:thinking", []);
  const [formalTasks, setFormalTasks] = usePersistedState("pgy-workbench:formal", []);
  const [rhythm, setRhythm] = usePersistedState("pgy-workbench:rhythm", DEFAULT_RHYTHM);
  const [composer, setComposer] = usePersistedState("pgy-workbench:composer", {
    objective: "形成一条可持续迭代的产品推广主线",
    audience: "校长与学校管理者",
    phase: "长期运营",
    channels: "公众号、社群、销售跟进",
    notes: "",
  });
  const [productFocusId, setProductFocusId] = useState(DEFAULT_SELECTED[0]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState("");

  const selectedProducts = useMemo(
    () => productsData.objects.filter((product) => selectedIds.includes(product.id)),
    [selectedIds],
  );

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const toggleProduct = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const goTo = (nextView) => {
    setView(nextView);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0 });
  };

  const copyBrief = async () => {
    const brief = buildBrief({ selectedProducts, ...composer });
    try {
      await navigator.clipboard.writeText(brief);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = brief;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast("已复制完整推广任务，可交给外部 AI 继续构思");
  };

  const saveThinking = () => {
    const record = {
      id: `thinking-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "思考记录",
      productIds: selectedIds,
      ...composer,
      brief: buildBrief({ selectedProducts, ...composer }),
    };
    setThinkingRecords((current) => [record, ...current]);
    showToast("已保存为思考记录，不会改变正式任务");
  };

  const makeFormal = (record) => {
    const confirmed = window.confirm(
      "确认转为正式推广任务？这一步会把当前构思加入正式任务清单，原思考记录仍会保留。",
    );
    if (!confirmed) return;
    setFormalTasks((current) => [
      {
        ...record,
        id: `formal-${Date.now()}`,
        sourceThinkingId: record.id,
        status: "正式任务",
        confirmedAt: new Date().toISOString(),
      },
      ...current,
    ]);
    showToast("已确认并转为正式推广任务");
  };

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      selectedIds,
      composer,
      thinkingRecords,
      formalTasks,
      rhythm,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `推广工作台备份-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("本地备份已导出");
  };

  return (
    <FluentProvider theme={themeMode === "dark" ? darkTheme : lightTheme}>
      <div className={`app-shell ${themeMode}`}>
        <Sidebar
          view={view}
          goTo={goTo}
          open={mobileNavOpen}
          close={() => setMobileNavOpen(false)}
          thinkingCount={thinkingRecords.length}
          formalCount={formalTasks.length}
        />
        <main className="main-shell">
          <Topbar
            view={view}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            openNav={() => setMobileNavOpen(true)}
            exportBackup={exportBackup}
          />
          <div className="page-frame">
            {view === "studio" && (
              <StudioView
                selectedProducts={selectedProducts}
                selectedIds={selectedIds}
                toggleProduct={toggleProduct}
                composer={composer}
                setComposer={setComposer}
                copyBrief={copyBrief}
                saveThinking={saveThinking}
                thinkingRecords={thinkingRecords}
                formalTasks={formalTasks}
                makeFormal={makeFormal}
                goTo={goTo}
                setProductFocusId={setProductFocusId}
              />
            )}
            {view === "products" && (
              <ProductsView
                selectedIds={selectedIds}
                toggleProduct={toggleProduct}
                focusId={productFocusId}
                setFocusId={setProductFocusId}
                goTo={goTo}
              />
            )}
            {view === "content" && <ContentView />}
            {view === "rhythm" && (
              <RhythmView
                rhythm={rhythm}
                setRhythm={setRhythm}
                selectedProducts={selectedProducts}
                showToast={showToast}
              />
            )}
            {view === "insights" && <InsightsView />}
            {view === "sources" && <SourcesView />}
          </div>
        </main>
        {toast && (
          <div className="toast" role="status">
            <CheckmarkCircle24Regular />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </FluentProvider>
  );
}

function Sidebar({ view, goTo, open, close, thinkingCount, formalCount }) {
  return (
    <>
      {open && <button className="nav-scrim" aria-label="关闭导航" onClick={close} />}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark">蒲</div>
          <div>
            <strong>推广工作台</strong>
            <span>蒲公英教育智库</span>
          </div>
          <Button
            className="mobile-close"
            appearance="subtle"
            icon={<Dismiss24Regular />}
            aria-label="关闭导航"
            onClick={close}
          />
        </div>
        <nav className="side-nav" aria-label="工作台导航">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => goTo(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-status">
          <div>
            <span>思考记录</span>
            <strong>{thinkingCount}</strong>
          </div>
          <div>
            <span>正式任务</span>
            <strong>{formalCount}</strong>
          </div>
          <p>内容保存在本机浏览器。转正式任务前始终需要确认。</p>
        </div>
      </aside>
    </>
  );
}

function Topbar({ view, themeMode, setThemeMode, openNav, exportBackup }) {
  const current = NAV_META[view];
  return (
    <header className="topbar">
      <div className="topbar-title">
        <Button
          className="mobile-menu"
          appearance="subtle"
          icon={<Navigation24Regular />}
          aria-label="打开导航"
          onClick={openNav}
        />
        <div>
          <span>公司知识底座 / 通用能力板块</span>
          <h1>{current.label}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <Tooltip content="导出本地构思与任务备份" relationship="label">
          <Button appearance="subtle" icon={<ArrowDownload24Regular />} onClick={exportBackup}>
            <span className="desktop-label">导出备份</span>
          </Button>
        </Tooltip>
        <Tooltip content={themeMode === "light" ? "切换深色模式" : "切换浅色模式"} relationship="label">
          <Button
            appearance="subtle"
            icon={themeMode === "light" ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
            aria-label="切换显示模式"
            onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
          />
        </Tooltip>
      </div>
    </header>
  );
}

function PageIntro({ eyebrow, title, description, aside }) {
  return (
    <section className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {aside && <div className="page-intro-aside">{aside}</div>}
    </section>
  );
}

function StudioView({
  selectedProducts,
  selectedIds,
  toggleProduct,
  composer,
  setComposer,
  copyBrief,
  saveThinking,
  thinkingRecords,
  formalTasks,
  makeFormal,
  goTo,
  setProductFocusId,
}) {
  const ideas = titleIdeas(selectedProducts, composer.audience);
  const updateField = (field, value) => setComposer((current) => ({ ...current, [field]: value }));
  return (
    <>
      <PageIntro
        eyebrow="从问题开始，而不是从一篇推文开始"
        title="搭一轮完整的推广构思"
        description="选择产品或服务，定义目标与人群，再把真实资料和历史数据整理成可交给 AI 深挖的任务。所有输出先停留在思考层，确认后才进入正式任务。"
        aside={
          <div className="scope-marker">
            <span>当前层级</span>
            <strong>通用推广能力</strong>
            <small>可调用全部产品与服务</small>
          </div>
        }
      />

      <section className="workflow-strip" aria-label="推广构思流程">
        {[
          ["01", "选推广对象"],
          ["02", "定义业务目标"],
          ["03", "生成构思任务"],
          ["04", "确认转正式任务"],
        ].map(([number, label], index) => (
          <React.Fragment key={number}>
            <div className={index === 0 ? "current" : ""}>
              <span>{number}</span>
              <strong>{label}</strong>
            </div>
            {index < 3 && <ArrowRight24Regular />}
          </React.Fragment>
        ))}
      </section>

      <div className="studio-grid">
        <section className="work-panel composer-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">构思输入</span>
              <h3>这一次要推广什么</h3>
            </div>
            <Button appearance="subtle" onClick={() => goTo("products")}>
              查看对象库
            </Button>
          </div>

          <div className="selected-products">
            {selectedProducts.length ? (
              selectedProducts.map((product) => (
                <button
                  key={product.id}
                  className="selected-product"
                  onClick={() => {
                    setProductFocusId(product.id);
                    goTo("products");
                  }}
                >
                  <span>{product.category}</span>
                  <strong>{product.name}</strong>
                </button>
              ))
            ) : (
              <div className="empty-inline">还没有选择推广对象，可从右侧快速选择或进入对象库。</div>
            )}
          </div>

          <div className="quick-select">
            <span>快速选择</span>
            {productsData.objects
              .filter((product) => ["product-01", "product-46", "product-48", "product-53"].includes(product.id))
              .map((product) => (
                <button
                  key={product.id}
                  className={selectedIds.includes(product.id) ? "is-selected" : ""}
                  onClick={() => toggleProduct(product.id)}
                >
                  {selectedIds.includes(product.id) && <CheckmarkCircle24Regular />}
                  {product.name}
                </button>
              ))}
          </div>

          <div className="form-grid">
            <label className="field full">
              <span>本轮业务目标</span>
              <Input value={composer.objective} onChange={(_, data) => updateField("objective", data.value)} />
            </label>
            <label className="field">
              <span>目标人群</span>
              <Input value={composer.audience} onChange={(_, data) => updateField("audience", data.value)} />
            </label>
            <label className="field">
              <span>推广阶段</span>
              <select value={composer.phase} onChange={(event) => updateField("phase", event.target.value)}>
                <option>市场教育</option>
                <option>产品认知</option>
                <option>集中转化</option>
                <option>长期运营</option>
                <option>复盘迭代</option>
              </select>
            </label>
            <label className="field full">
              <span>优先渠道</span>
              <Input value={composer.channels} onChange={(_, data) => updateField("channels", data.value)} />
            </label>
            <label className="field full">
              <span>老板此刻特别想考虑的问题</span>
              <Textarea
                resize="vertical"
                value={composer.notes}
                placeholder="例如：三个产品要不要放在同一条主线里？AI 学伴应该先讲趋势还是先讲使用场景？"
                onChange={(_, data) => updateField("notes", data.value)}
              />
            </label>
          </div>
          <div className="primary-actions">
            <Button appearance="primary" icon={<Copy24Regular />} onClick={copyBrief}>
              复制给 AI 深挖
            </Button>
            <Button appearance="secondary" icon={<Save24Regular />} onClick={saveThinking}>
              保存思考记录
            </Button>
          </div>
          <p className="action-note">复制内容会自动带上所选对象资料、相关历史推文、销售聚合数据与事实边界。</p>
        </section>

        <aside className="evidence-rail">
          <section className="evidence-block">
            <div className="evidence-heading">
              <span>内容样本</span>
              <strong>{formatNumber(contentData.overall.articleCount)} 篇</strong>
            </div>
            <p>三个公众号，时间覆盖至 {contentData.overall.dateRange.end}。</p>
            <div className="mini-metrics">
              <div>
                <span>平均阅读</span>
                <strong>{formatNumber(contentData.overall.averageReads)}</strong>
              </div>
              <div>
                <span>中位阅读</span>
                <strong>{formatNumber(contentData.overall.medianReads)}</strong>
              </div>
            </div>
            <button className="text-link" onClick={() => goTo("content")}>查看标题与内容证据 <ArrowRight24Regular /></button>
          </section>
          <section className="evidence-block">
            <div className="evidence-heading">
              <span>商城样本</span>
              <strong>{formatNumber(salesData.totals.paidOrders)} 单</strong>
            </div>
            <p>2026-01-01 至 2026-07-16，仅展示聚合结果。</p>
            <div className="mini-metrics">
              <div>
                <span>净销售额</span>
                <strong>{formatCurrency(salesData.totals.netSales)}</strong>
              </div>
              <div>
                <span>客单价</span>
                <strong>{formatCurrency(salesData.totals.averageOrderValue)}</strong>
              </div>
            </div>
            <button className="text-link" onClick={() => goTo("insights")}>查看销售与传播趋势 <ArrowRight24Regular /></button>
          </section>
          <section className="boundary-note">
            <BookInformation24Regular />
            <div>
              <strong>口径提醒</strong>
              <p>产品介绍仍是原始材料。数据可帮助发现线索，但不能自动替代业务判断。</p>
            </div>
          </section>
        </aside>
      </div>

      <section className="title-starters page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">历史高频结构 × 当前对象</span>
            <h3>标题起点</h3>
          </div>
          <p>这些是继续思考的起点，不是待发布成稿。</p>
        </div>
        <div className="title-grid">
          {ideas.map((idea, index) => (
            <article key={idea}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{idea}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="records-section page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">确认边界清晰</span>
            <h3>构思记录与正式任务</h3>
          </div>
          <div className="record-counts">
            <span>思考 {thinkingRecords.length}</span>
            <span>正式 {formalTasks.length}</span>
          </div>
        </div>
        {thinkingRecords.length === 0 && formalTasks.length === 0 ? (
          <div className="empty-state">
            <Lightbulb24Regular />
            <strong>还没有保存过构思</strong>
            <p>完成上方输入后保存一条思考记录。只有明确点击确认，记录才会进入正式任务。</p>
          </div>
        ) : (
          <div className="records-grid">
            {thinkingRecords.slice(0, 6).map((record) => (
              <article className="record-card" key={record.id}>
                <div className="record-card-top">
                  <span className="status thinking">思考记录</span>
                  <time>{formatDateTime(record.createdAt)}</time>
                </div>
                <h4>{record.objective}</h4>
                <p>{record.audience} · {record.phase}</p>
                <div className="record-products">
                  {productsData.objects
                    .filter((product) => record.productIds.includes(product.id))
                    .slice(0, 3)
                    .map((product) => <span key={product.id}>{product.name}</span>)}
                </div>
                <Button appearance="secondary" onClick={() => makeFormal(record)}>
                  确认转为正式任务
                </Button>
              </article>
            ))}
            {formalTasks.slice(0, 6).map((task) => (
              <article className="record-card formal" key={task.id}>
                <div className="record-card-top">
                  <span className="status formal">正式任务</span>
                  <time>{formatDateTime(task.confirmedAt)}</time>
                </div>
                <h4>{task.objective}</h4>
                <p>{task.audience} · {task.phase}</p>
                <div className="confirmation-line"><CheckmarkCircle24Regular /> 已由使用者明确确认</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ProductsView({ selectedIds, toggleProduct, focusId, setFocusId, goTo }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const filtered = productsData.objects.filter((product) => {
    const matchesCategory = category === "全部" || product.category === category;
    const haystack = `${product.name} ${product.description} ${product.audience} ${product.value}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  });
  const focus = productsData.objects.find((product) => product.id === focusId) || filtered[0] || productsData.objects[0];
  const relatedArticles = contentData.articles
    .filter((article) => articleMatchesProduct(article, focus))
    .sort((a, b) => b.reads - a.reads)
    .slice(0, 5);
  const relatedSales = salesData.topProducts.filter((item) => salesMatchesProduct(item, focus)).slice(0, 4);

  return (
    <>
      <PageIntro
        eyebrow={`${productsData.categories.length} 个类别，${productsData.objects.length} 个对象`}
        title="产品与服务对象库"
        description="把产品、服务、课程、出版物与会议放在同一个对象库里。这里保留原始材料状态，方便后续逐条补充正式口径、案例、数据和限制。"
        aside={<span className="source-badge">资料版本 {productsData.sourceDate}</span>}
      />
      <div className="library-toolbar">
        <Input
          contentBefore={<Search24Regular />}
          placeholder="搜索产品、服务、受众或价值"
          value={query}
          onChange={(_, data) => setQuery(data.value)}
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>全部</option>
          {productsData.categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <span>{filtered.length} 个结果</span>
      </div>
      <div className="product-browser">
        <div className="product-list" role="listbox" aria-label="产品与服务列表">
          {filtered.map((product) => (
            <button
              key={product.id}
              className={focus.id === product.id ? "active" : ""}
              onClick={() => setFocusId(product.id)}
            >
              <span>{product.category}</span>
              <strong>{product.name}</strong>
              <small>{product.audience || "受众待补充"}</small>
              {selectedIds.includes(product.id) && <CheckmarkCircle24Regular />}
            </button>
          ))}
          {filtered.length === 0 && <div className="empty-list">没有匹配的对象。</div>}
        </div>
        <article className="product-detail">
          <div className="product-detail-head">
            <div>
              <div className="detail-meta">
                <span>{focus.category}</span>
                <span>{focus.level}</span>
                <span className="raw">{focus.informationStatus}</span>
              </div>
              <h3>{focus.name}</h3>
            </div>
            <Button
              appearance={selectedIds.includes(focus.id) ? "secondary" : "primary"}
              icon={selectedIds.includes(focus.id) ? <CheckmarkCircle24Regular /> : <Add24Regular />}
              onClick={() => toggleProduct(focus.id)}
            >
              {selectedIds.includes(focus.id) ? "已加入本轮构思" : "加入本轮构思"}
            </Button>
          </div>
          <div className="detail-sections">
            <section>
              <h4>产品说明</h4>
              <p>{focus.description || "原始资料暂未提供说明。"}</p>
            </section>
            <section className="detail-two-col">
              <div>
                <h4>适用对象</h4>
                <p>{focus.audience || "原始资料待补充。"}</p>
              </div>
              <div>
                <h4>核心价值</h4>
                <p>{focus.value || "原始资料待补充。"}</p>
              </div>
            </section>
          </div>
          <div className="linked-evidence">
            <section>
              <div className="subsection-heading">
                <h4>相关历史推文</h4>
                <span>{relatedArticles.length ? `${relatedArticles.length} 条高相关` : "未匹配"}</span>
              </div>
              {relatedArticles.length ? relatedArticles.map((article) => (
                <a href={article.link || undefined} target="_blank" rel="noreferrer" key={article.id}>
                  <span>{article.account} · {article.date}</span>
                  <strong>{article.title}</strong>
                  <small>阅读 {formatNumber(article.reads)} · 分享 {formatNumber(article.shares)}</small>
                </a>
              )) : <p className="muted-note">当前按名称与别名未匹配到历史推文，不能据此判断从未推广。</p>}
            </section>
            <section>
              <div className="subsection-heading">
                <h4>销售聚合榜匹配</h4>
                <span>{relatedSales.length ? `${relatedSales.length} 项` : "未匹配"}</span>
              </div>
              {relatedSales.length ? relatedSales.map((item) => (
                <div className="sales-match" key={item.name}>
                  <strong>{item.name}</strong>
                  <span>销量 {formatNumber(item.units)}</span>
                  <small>单品订单口径收入 {formatCurrency(item.singleProductRevenue)}</small>
                </div>
              )) : <p className="muted-note">当前只读取销售聚合榜前列商品，未匹配不等于没有订单。</p>}
            </section>
          </div>
          {focus.promotionLinks?.length > 0 && (
            <section className="source-links">
              <h4>原始资料附带推广链接</h4>
              {focus.promotionLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.title}</a>
              ))}
            </section>
          )}
          <div className="detail-footer">
            <span>来源：{focus.source} · 第 {focus.sourceParagraph} 段</span>
            <Button appearance="subtle" onClick={() => goTo("studio")}>返回推广构思</Button>
          </div>
        </article>
      </div>
    </>
  );
}

function ContentView() {
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState("全部账号");
  const [pattern, setPattern] = useState("全部结构");
  const [sort, setSort] = useState("reads");
  const patterns = contentData.overall.titlePatterns.map((item) => item.pattern);
  const filtered = useMemo(() => {
    const items = contentData.articles.filter((article) => {
      const accountMatch = account === "全部账号" || article.account === account;
      const patternMatch = pattern === "全部结构" || article.patterns.includes(pattern);
      const queryMatch = `${article.title} ${article.product || ""}`.toLowerCase().includes(query.toLowerCase());
      return accountMatch && patternMatch && queryMatch;
    });
    return items.sort((a, b) => {
      if (sort === "date") return b.date.localeCompare(a.date);
      if (sort === "shareRate") return b.shareRate - a.shareRate;
      return b.reads - a.reads;
    });
  }, [query, account, pattern, sort]);

  return (
    <>
      <PageIntro
        eyebrow="用历史内容做参照，不把历史表现当标准答案"
        title="标题与内容证据"
        description="检索三个公众号的历史标题、内容位置与传播表现。标题结构由规则辅助分类，适合发现切入角度，不用于直接证明某种写法一定有效。"
        aside={<span className="source-badge">更新至 {contentData.overall.dateRange.end}</span>}
      />
      <section className="account-band">
        {contentData.accounts.map((item) => (
          <button
            key={item.name}
            className={account === item.name ? "active" : ""}
            onClick={() => setAccount(account === item.name ? "全部账号" : item.name)}
          >
            <span>{item.name}</span>
            <strong>{formatNumber(item.articleCount)}</strong>
            <small>平均阅读 {formatNumber(item.averageReads)}</small>
          </button>
        ))}
      </section>
      <div className="content-toolbar">
        <Input
          contentBefore={<Search24Regular />}
          placeholder="搜索标题或关联产品"
          value={query}
          onChange={(_, data) => setQuery(data.value)}
        />
        <select value={pattern} onChange={(event) => setPattern(event.target.value)}>
          <option>全部结构</option>
          {patterns.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="reads">按阅读排序</option>
          <option value="shareRate">按分享率排序</option>
          <option value="date">按时间排序</option>
        </select>
        <span>{formatNumber(filtered.length)} 条</span>
      </div>
      <div className="article-table-wrap">
        <table className="article-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>账号 / 位置</th>
              <th>日期</th>
              <th>阅读</th>
              <th>分享</th>
              <th>结构</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 60).map((article) => (
              <tr key={article.id}>
                <td>
                  {article.link ? <a href={article.link} target="_blank" rel="noreferrer">{article.title}</a> : article.title}
                  {article.product && <small>{article.product}</small>}
                </td>
                <td>{article.account}<small>{article.slot || "位置未标注"}</small></td>
                <td>{article.date}</td>
                <td><strong>{formatNumber(article.reads)}</strong></td>
                <td>{formatNumber(article.shares)}<small>{formatPercent(article.shareRate)}</small></td>
                <td><div className="pattern-tags">{article.patterns.map((item) => <span key={item}>{item}</span>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 60 && <div className="table-footnote">当前展示前 60 条，可继续通过搜索和筛选缩小范围。</div>}
      </div>
    </>
  );
}

function RhythmView({ rhythm, setRhythm, selectedProducts, showToast }) {
  const updatePhase = (id, field, value) => {
    setRhythm((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const addPhase = () => {
    setRhythm((current) => [...current, {
      id: `phase-${Date.now()}`,
      phase: "新增阶段",
      time: "待安排",
      goal: "",
      format: "",
      channel: "",
    }]);
  };
  const copyRhythm = async () => {
    const text = rhythm.map((item, index) => `${index + 1}. ${item.phase}（${item.time}）\n目标：${item.goal}\n内容：${item.format}\n渠道：${item.channel}`).join("\n\n");
    await navigator.clipboard.writeText(`推广对象：${selectedProducts.map((item) => item.name).join("、") || "待选择"}\n\n${text}`);
    showToast("推广节奏已复制");
  };
  return (
    <>
      <PageIntro
        eyebrow="从单篇排期升级为阶段经营"
        title="推广节奏"
        description="先安排每个阶段要解决的认知与业务问题，再决定发什么内容、放在哪个渠道。下方是一份可编辑的 8 周起始模板。"
        aside={<Button appearance="primary" icon={<Copy24Regular />} onClick={copyRhythm}>复制节奏</Button>}
      />
      <div className="rhythm-summary">
        <span>当前对象</span>
        <strong>{selectedProducts.map((item) => item.name).join("、") || "尚未选择"}</strong>
      </div>
      <section className="rhythm-board">
        {rhythm.map((item, index) => (
          <article className="rhythm-column" key={item.id}>
            <div className="phase-number">{String(index + 1).padStart(2, "0")}</div>
            <label>
              <span>阶段</span>
              <input value={item.phase} onChange={(event) => updatePhase(item.id, "phase", event.target.value)} />
            </label>
            <label>
              <span>时间</span>
              <input value={item.time} onChange={(event) => updatePhase(item.id, "time", event.target.value)} />
            </label>
            <label>
              <span>本阶段目标</span>
              <textarea value={item.goal} onChange={(event) => updatePhase(item.id, "goal", event.target.value)} />
            </label>
            <label>
              <span>内容形态</span>
              <textarea value={item.format} onChange={(event) => updatePhase(item.id, "format", event.target.value)} />
            </label>
            <label>
              <span>渠道与承接</span>
              <textarea value={item.channel} onChange={(event) => updatePhase(item.id, "channel", event.target.value)} />
            </label>
          </article>
        ))}
        <button className="add-phase" onClick={addPhase}><Add24Regular /><span>增加阶段</span></button>
      </section>
      <section className="cadence-principles">
        <h3>安排节奏时检查这四件事</h3>
        <div>
          <p><strong>认知是否递进</strong><span>前一阶段为后一阶段解决了什么疑问。</span></p>
          <p><strong>产品是否抢跑</strong><span>受众还没看见问题时，不急着进入功能介绍。</span></p>
          <p><strong>渠道是否分工</strong><span>公域负责建立认知，私域负责解释与承接。</span></p>
          <p><strong>每轮是否能复盘</strong><span>为阅读、咨询、成交与反馈预留记录位置。</span></p>
        </div>
      </section>
    </>
  );
}

function BarChart({ items, valueKey, labelKey, formatValue = formatNumber }) {
  const max = Math.max(...items.map((item) => item[valueKey]), 1);
  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div className="bar-row" key={item[labelKey]}>
          <span>{item[labelKey]}</span>
          <div><i style={{ width: `${Math.max((item[valueKey] / max) * 100, 2)}%` }} /></div>
          <strong>{formatValue(item[valueKey])}</strong>
        </div>
      ))}
    </div>
  );
}

function InsightsView() {
  return (
    <>
      <PageIntro
        eyebrow="已知事实与待验证判断分开呈现"
        title="传播与销售数据洞察"
        description="这里提供公司级参考背景，帮助老板判断选题、产品组合和推广节奏。任何策略结论仍需结合产品目标、渠道动作和业务反馈验证。"
        aside={<span className="source-badge">两类数据源 · 隐私聚合</span>}
      />
      <section className="kpi-band">
        <div><span>历史内容</span><strong>{formatNumber(contentData.overall.articleCount)}</strong><small>有标题文章</small></div>
        <div><span>累计阅读</span><strong>{formatNumber(contentData.overall.totalReads)}</strong><small>三个账号合计</small></div>
        <div><span>商城净销售额</span><strong>{formatCurrency(salesData.totals.netSales)}</strong><small>实付减退款</small></div>
        <div><span>实付订单</span><strong>{formatNumber(salesData.totals.paidOrders)}</strong><small>平均客单 {formatCurrency(salesData.totals.averageOrderValue)}</small></div>
      </section>
      <div className="insight-grid">
        <section className="insight-panel wide">
          <div className="panel-heading">
            <div><span className="step-label">传播趋势</span><h3>月度平均阅读</h3></div>
            <span className="fact-pill">已知事实</span>
          </div>
          <div className="column-chart">
            {contentData.overall.monthly.map((item) => {
              const max = Math.max(...contentData.overall.monthly.map((month) => month.averageReads));
              return <div key={item.month}><strong>{formatNumber(item.averageReads)}</strong><i style={{ height: `${(item.averageReads / max) * 150}px` }} /><span>{monthLabel(item.month)}</span></div>;
            })}
          </div>
          <p className="chart-note">7 月数据截至 7 月 19 日。月均阅读受选题、账号、位置和发布时间共同影响。</p>
        </section>
        <section className="insight-panel">
          <div className="panel-heading">
            <div><span className="step-label">标题结构</span><h3>历史高频类型</h3></div>
            <span className="heuristic-pill">启发式</span>
          </div>
          <BarChart items={contentData.overall.titlePatterns} valueKey="count" labelKey="pattern" />
          <p className="chart-note">同一标题可能命中多个结构，因此数量不可直接相加。</p>
        </section>
        <section className="insight-panel wide">
          <div className="panel-heading">
            <div><span className="step-label">销售趋势</span><h3>商城月度实付金额</h3></div>
            <span className="fact-pill">已知事实</span>
          </div>
          <BarChart items={salesData.monthly.map((item) => ({ ...item, label: monthLabel(item.month) }))} valueKey="sales" labelKey="label" formatValue={formatCurrency} />
          <p className="chart-note">7 月数据截至 7 月 16 日，不能直接与完整月份比较。</p>
        </section>
        <section className="insight-panel">
          <div className="panel-heading">
            <div><span className="step-label">商品线索</span><h3>销量前列商品</h3></div>
            <span className="fact-pill">已知事实</span>
          </div>
          <ol className="rank-list">
            {salesData.topProducts.slice(0, 8).map((item, index) => (
              <li key={item.name}><span>{index + 1}</span><div><strong>{item.name}</strong><small>销量 {formatNumber(item.units)}</small></div></li>
            ))}
          </ol>
        </section>
      </div>
      <section className="inference-band">
        <div>
          <span className="eyebrow">可以继续验证的判断</span>
          <h3>数据给出的不是答案，是下一步问题</h3>
        </div>
        <div className="inference-list">
          <p><span>01</span>人物案例与数字清单在历史标题中出现较多，能否成为不同产品的稳定内容骨架？</p>
          <p><span>02</span>3 月平均阅读较高，当月选题、账号排布与头条位置分别贡献了什么？</p>
          <p><span>03</span>商城销量前列以出版物和工具型产品为主，能否作为高客单服务的低门槛认知入口？</p>
          <p><span>04</span>公众号传播与商城成交尚未做同源归因，下一步需要怎样记录链接、活动和销售反馈？</p>
        </div>
      </section>
    </>
  );
}

function SourcesView() {
  const sources = [
    {
      type: "产品资料",
      name: productsData.source,
      status: "已整理",
      coverage: `${productsData.categories.length} 类 · ${productsData.objects.length} 个对象`,
      date: productsData.sourceDate,
      note: "产品介绍、受众、价值与原始推广链接已结构化。所有条目目前仍标注为原始材料，待业务逐条确认。",
    },
    {
      type: "历史推文",
      name: "飞书多维表格：三个公众号推文数据",
      status: "已全量读取",
      coverage: `${contentData.overall.articleCount} 篇有标题内容`,
      date: contentData.overall.dateRange.end,
      note: "云端聚合查询权限不足，已改用逐页完整读取后在本地统计。结构分类为启发式分析。",
    },
    {
      type: "商城订单",
      name: salesData.source,
      status: "已聚合",
      coverage: `${formatNumber(salesData.totals.exportedOrders)} 条导出订单`,
      date: salesData.sourceRange.end,
      note: "工作台只使用订单数、金额、商品、月份和渠道等聚合结果，不展示姓名、电话、昵称和详细地址。",
    },
  ];
  return (
    <>
      <PageIntro
        eyebrow="每条判断都应该知道自己从哪里来"
        title="资料来源与使用边界"
        description="统一记录资料版本、覆盖范围、处理方式和限制。后续补充品牌方法论、案例、正式产品口径时，也沿用同一套来源说明。"
        aside={<span className="source-badge">当前 3 类核心来源</span>}
      />
      <div className="source-list">
        {sources.map((source) => (
          <article key={source.type}>
            <div className="source-type">{source.type}</div>
            <div className="source-main">
              <div><h3>{source.name}</h3><span>{source.coverage}</span></div>
              <p>{source.note}</p>
            </div>
            <div className="source-state"><strong>{source.status}</strong><span>更新至 {source.date}</span></div>
          </article>
        ))}
      </div>
      <section className="source-principles">
        <div>
          <span className="eyebrow">工作台口径</span>
          <h3>从资料进入正式任务，要经过四道边界</h3>
        </div>
        <ol>
          <li><span>01</span><div><strong>来源可追溯</strong><p>保留文件名、更新时间、数据范围和提取方式。</p></div></li>
          <li><span>02</span><div><strong>事实与推断分开</strong><p>原始数据、分析线索和创意建议使用不同标签。</p></div></li>
          <li><span>03</span><div><strong>AI 只负责辅助构思</strong><p>工作台生成结构化任务，交给外部 AI 深挖，不内置自动代理。</p></div></li>
          <li><span>04</span><div><strong>正式写回需要确认</strong><p>AI 输出先保存为思考记录，使用者确认后才进入正式任务。</p></div></li>
        </ol>
      </section>
      <section className="knowledge-next">
        <BookInformation24Regular />
        <div><strong>下一批适合补进来的资料</strong><p>公司品牌表达、正式产品口径、典型客户案例、销售常见问答、渠道规则、历史复盘与已验证的方法论。</p></div>
      </section>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
