import { useState } from 'react';
import { useGame } from '../GameContext';
import { TOOLS } from '../gameData';
import { FaArrowLeft, FaTabletScreenButton, FaHeadphones, FaHourglassHalf, FaImages, FaMap, FaRibbon } from 'react-icons/fa6';

const ICON_MAP = { FaTabletScreenButton, FaHeadphones, FaHourglassHalf, FaImages, FaMap, FaRibbon };

export default function Encyclopedia({ onBack }) {
    const { state } = useGame();
    const [selectedTool, setSelectedTool] = useState(null);
    const allToolIds = Object.keys(TOOLS);

    return (
        <div className="h-full flex flex-col items-center bg-gradient-to-b from-slate-50 to-indigo-50 p-6 animate-fade-in overflow-y-auto">
            <div className="flex items-center gap-3 mb-6 w-full max-w-lg">
                <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                    <FaArrowLeft className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">📖 도구 도감</h2>
                    <p className="text-sm text-slate-500">이 도구는 언제 쓰나요?</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg">
                {allToolIds.map(id => {
                    const t = TOOLS[id];
                    const unlocked = state.encyclopediaUnlocked.includes(id);
                    const IconComp = ICON_MAP[t.icon];
                    return (
                        <div key={id}
                            onClick={() => unlocked && setSelectedTool(id)}
                            className={`bg-white rounded-2xl p-4 border-2 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 ${unlocked ? 'border-indigo-100 hover:shadow-md' : 'border-slate-200 opacity-40 grayscale pointer-events-none'}`}>
                            <div className="text-3xl mb-2">{IconComp && <IconComp className={unlocked ? 'text-indigo-500' : 'text-slate-300'} />}</div>
                            <div className={`font-bold text-sm ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>{unlocked ? t.name : '???'}</div>
                            <div className={`text-xs mt-1 ${unlocked ? 'text-emerald-500' : 'text-slate-400'}`}>{unlocked ? '✅ 획득' : '🔒 미획득'}</div>
                        </div>
                    );
                })}
            </div>
            {/* Detail modal */}
            {selectedTool && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTool(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="text-4xl mb-3">
                            {(() => { const IC = ICON_MAP[TOOLS[selectedTool].icon]; return IC ? <IC className="text-indigo-500" /> : null; })()}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{TOOLS[selectedTool].name}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{TOOLS[selectedTool].desc}</p>
                        <button onClick={() => setSelectedTool(null)}
                            className="mt-4 w-full py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-200 cursor-pointer">닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
}
