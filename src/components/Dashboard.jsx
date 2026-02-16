import { useEffect, useRef } from 'react';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { useGame } from '../GameContext';
import { TOOLS, STAGE_NAMES } from '../gameData';
import { FaTabletScreenButton, FaHeadphones, FaHourglassHalf, FaImages, FaMap, FaRibbon, FaBook, FaRotateLeft, FaToolbox } from 'react-icons/fa6';

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
                scales: { r: { min: 0, max: 100, ticks: { stepSize: 20, display: false }, grid: { color: '#e2e8f0' }, pointLabels: { font: { size: 11, family: 'Noto Sans KR' } } } },
                plugins: { legend: { display: false } },
                animation: { duration: 600 }
            }
        });
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [state.stats]);

    return (
        <div className="w-72 bg-white border-l-2 border-indigo-100 flex flex-col p-4 shrink-0">
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">📊 미션 리포트</h2>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 mb-4">
                <canvas ref={chartRef} width={240} height={200} />
            </div>
            <div className="text-center text-sm text-slate-500 mb-4">
                <span className="font-bold text-indigo-600">{STAGE_NAMES[state.currentStage] || state.currentStage}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-700 mb-2"><FaToolbox className="inline mr-1 text-amber-500" />도구함</h3>
                <div className="grid grid-cols-2 gap-2">
                    {state.inventory.map(id => {
                        const t = TOOLS[id];
                        if (!t) return null;
                        const used = state.usedTools.includes(id);
                        const IconComp = ICON_MAP[t.icon];
                        return (
                            <div key={id}
                                onClick={() => !used && onToolUse(id)}
                                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer hover:-translate-y-0.5 ${used ? 'border-emerald-300 bg-emerald-50 opacity-50' : t.color}`}>
                                {IconComp && <IconComp className="text-xl mb-1" />}
                                <span className="text-xs font-medium text-center">{t.name}</span>
                                {used && <span className="text-[10px] text-emerald-600">✓ 사용됨</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                <button onClick={onShowEncyclopedia} className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-all cursor-pointer">
                    <FaBook className="inline mr-1" />도감
                </button>
                <button onClick={resetGame} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-all cursor-pointer">
                    <FaRotateLeft className="inline mr-1" />초기화
                </button>
            </div>
        </div>
    );
}
