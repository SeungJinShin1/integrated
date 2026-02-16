import { useEffect, useRef, useState } from 'react';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { useGame } from '../GameContext';
import { TOOLS, STAGE_NAMES } from '../gameData';
import { FaTabletScreenButton, FaHeadphones, FaHourglassHalf, FaImages, FaMap, FaRibbon, FaBook, FaRotateLeft, FaToolbox, FaChartBar, FaXmark } from 'react-icons/fa6';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

const ICON_MAP = {
    FaTabletScreenButton: FaTabletScreenButton,
    FaHeadphones: FaHeadphones,
    FaHourglassHalf: FaHourglassHalf,
    FaImages: FaImages,
    FaMap: FaMap,
    FaRibbon: FaRibbon,
};

export default function Dashboard({ onToolUse, onShowEncyclopedia }) {
    const { state, resetGame } = useGame();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [collapsed, setCollapsed] = useState(true); // 스마트폰에서 기본 접힘

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['이해 💡', '신뢰 🤝', '소통 💬', '인내 🧘'],
                datasets: [{
                    label: '역량',
                    data: [state.stats.understanding, state.stats.trust, state.stats.communication, state.stats.patience],
                    backgroundColor: 'rgba(99,102,241,.15)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 4
                }]
            },
            options: {
                scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#e2e8f0' }, pointLabels: { font: { size: 10, family: 'Noto Sans KR' } } } },
                plugins: { legend: { display: false } },
                animation: { duration: 600 }
            }
        });
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [state.stats, collapsed]);

    // 큰 화면에서 항상 펼침
    useEffect(() => {
        const check = () => {
            if (window.innerWidth >= 1024) setCollapsed(false);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // 스마트폰: 접힌 상태 → 토글 버튼만 표시
    if (collapsed && typeof window !== 'undefined' && window.innerWidth < 1024) {
        return (
            <button
                onClick={() => setCollapsed(false)}
                className="fixed top-2 right-2 z-50 w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all cursor-pointer"
                title="미션 리포트"
            >
                <FaChartBar className="text-sm" />
            </button>
        );
    }

    return (
        <>
            {/* 모바일 오버레이 배경 */}
            {typeof window !== 'undefined' && window.innerWidth < 1024 && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCollapsed(true)} />
            )}
            <div className="dashboard-panel bg-white border-l-2 border-indigo-100 flex flex-col p-3 shrink-0 z-50">
                {/* 닫기 버튼 (모바일) */}
                <button
                    onClick={() => setCollapsed(true)}
                    className="dashboard-close absolute top-2 right-2 w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                    <FaXmark className="text-xs" />
                </button>

                <div className="text-center mb-2">
                    <h2 className="text-base font-bold text-slate-800">📊 미션 리포트</h2>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 mb-2">
                    <canvas ref={chartRef} width={200} height={160} />
                </div>
                <div className="text-center text-xs text-slate-500 mb-2">
                    <span className="font-bold text-indigo-600">{STAGE_NAMES[state.currentStage] || state.currentStage}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-700 mb-1.5"><FaToolbox className="inline mr-1 text-amber-500" />도구함</h3>
                    <div className="grid grid-cols-2 gap-1.5">
                        {state.inventory.map(id => {
                            const t = TOOLS[id];
                            if (!t) return null;
                            const used = state.usedTools.includes(id);
                            const IconComp = ICON_MAP[t.icon];
                            return (
                                <div key={id}
                                    onClick={() => !used && onToolUse(id)}
                                    className={`flex flex-col items-center p-1.5 rounded-lg border-2 transition-all cursor-pointer hover:-translate-y-0.5 ${used ? 'border-emerald-300 bg-emerald-50 opacity-50' : t.color}`}>
                                    {IconComp && <IconComp className="text-lg mb-0.5" />}
                                    <span className="text-[10px] font-medium text-center leading-tight">{t.name}</span>
                                    {used && <span className="text-[8px] text-emerald-600">✓</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex gap-1.5">
                    <button onClick={onShowEncyclopedia} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-medium hover:bg-emerald-100 transition-all cursor-pointer">
                        <FaBook className="inline mr-0.5" />도감
                    </button>
                    <button onClick={resetGame} className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium hover:bg-red-100 transition-all cursor-pointer">
                        <FaRotateLeft className="inline mr-0.5" />초기화
                    </button>
                </div>
            </div>
        </>
    );
}
