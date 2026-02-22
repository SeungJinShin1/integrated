import { useState, useRef, useEffect } from 'react';
import { useGame } from '../../GameContext';
import useTTS from '../../utils/useTTS';
import { LOW_BG_IMAGES } from '../../assetMap';
import { FaHeart, FaDownload, FaRotateLeft } from 'react-icons/fa6';

const STICKERS = [
    { id: 'happy', emoji: '😊', label: '기뻐요' },
    { id: 'proud', emoji: '😎', label: '자랑스러워요' },
    { id: 'calm', emoji: '😌', label: '편안해요' },
    { id: 'surprised', emoji: '😲', label: '놀라워요' },
];

export default function LowEnding() {
    const { state, resetGame } = useGame();
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const canvasRef = useRef(null);

    const text = selectedSticker
        ? "정말 멋진 감정이네요. 새싹 요원 수료증을 받으세요! 다운로드 버튼을 눌러 이미지를 저장할 수 있어요."
        : "우와! 4개의 미션을 모두 완료했어요! 지금 기분이 어떤가요? 아래에서 감정 스티커를 하나 골라주세요.";

    useTTS(text, true);

    const handleStickerSelect = (sticker) => {
        setSelectedSticker(sticker);
    };

    const downloadCertificate = () => {
        if (!selectedSticker) return;
        setIsDownloading(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Canvas 크기 설정
        canvas.width = 1200;
        canvas.height = 800;

        // 배경색
        ctx.fillStyle = '#f0fdf4'; // bg-green-50
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 테두리
        ctx.strokeStyle = '#86efac'; // green-300
        ctx.lineWidth = 20;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // 제목
        ctx.fillStyle = '#166534'; // green-800
        ctx.font = 'bold 80px "맑은 고딕", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('새싹 요원 수료증', canvas.width / 2, 180);

        // 부제목
        ctx.fillStyle = '#15803d'; // green-700
        ctx.font = 'bold 40px "맑은 고딕", sans-serif';
        ctx.fillText('위 어린이는 훌륭하게 배려와 기다림을 실천했습니다.', canvas.width / 2, 280);

        // 이름
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 60px "맑은 고딕", sans-serif';
        const playerName = state.player.name === '나' ? '새싹 요원' : `${state.player.name} 요원`;
        ctx.fillText(playerName, canvas.width / 2, 380);

        // 하트 렌더링
        ctx.fillStyle = '#ec4899'; // pink-500
        ctx.font = '60px Arial';
        const heartCount = state.hearts; // Should be 4, but we use the state just in case
        let heartsStr = '';
        for (let i = 0; i < Math.max(1, heartCount); i++) heartsStr += '💖 ';
        ctx.fillText(heartsStr, canvas.width / 2, 500);

        ctx.fillStyle = '#475569';
        ctx.font = '30px "맑은 고딕", sans-serif';
        ctx.fillText(`획득한 하트: ${heartCount}개`, canvas.width / 2, 560);

        // 감정 스티커 렌더링
        ctx.fillStyle = '#334155';
        ctx.font = '40px "맑은 고딕", sans-serif';
        ctx.fillText('나의 감정:', canvas.width / 2 - 80, 680);
        ctx.font = '80px Arial';
        ctx.fillText(selectedSticker.emoji, canvas.width / 2 + 80, 700);

        // 로고/워터마크
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 24px "맑은 고딕", sans-serif';
        ctx.fillText('원팀 프로젝트: 히든 피스', 200, 740);

        // 다운로드 트리거
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `새싹요원_수료증_${playerName.replace(' ', '_')}.png`;
        link.href = dataUrl;
        link.click();

        setTimeout(() => setIsDownloading(false), 1000);
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-green-50 overflow-hidden">
            <img src={LOW_BG_IMAGES.ending} alt="배경" className="absolute inset-0 w-full h-full object-cover opacity-10" />

            {/* Hidden Canvas for Image Generation */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col items-center">

                <div className="bg-white/90 backdrop-blur-md px-10 py-6 rounded-3xl shadow-xl flex flex-col items-center w-full min-h-[500px] border-4 border-green-300">

                    {!selectedSticker ? (
                        <>
                            <div className="text-6xl mb-6">🎉</div>
                            <h2 className="text-3xl font-bold text-green-800 mb-4 font-['CookieRun_Regular']">모든 미션 완료!</h2>
                            <div className="flex items-center gap-2 bg-pink-50 px-6 py-2 rounded-full border border-pink-200 mb-8">
                                <span className="font-bold text-pink-700">모은 하트:</span>
                                {[...Array(Math.max(1, state.hearts))].map((_, i) => (
                                    <FaHeart key={i} className="text-pink-500" />
                                ))}
                            </div>

                            <p className="text-xl text-slate-700 mb-8">지금 당신의 기분은 어떤가요?</p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl">
                                {STICKERS.map(sticker => (
                                    <button
                                        key={sticker.id}
                                        onClick={() => handleStickerSelect(sticker)}
                                        className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:bg-green-50 hover:border-green-400 hover:scale-105 transition-all shadow-sm"
                                    >
                                        <span className="text-6xl mb-4">{sticker.emoji}</span>
                                        <span className="font-bold text-slate-700">{sticker.label}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center w-full animate-fade-in-up">
                            <h2 className="text-3xl font-bold text-green-800 mb-6 font-['CookieRun_Regular']">새싹 요원 수료증 발급 준비 완료!</h2>

                            <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-200 w-full max-w-2xl text-center mb-8 relative">
                                <span className="absolute -top-6 -right-6 text-6xl rotate-12">{selectedSticker.emoji}</span>
                                <h3 className="text-2xl font-bold text-green-900 mb-4">{state.player.name === '나' ? '나' : state.player.name} 요원</h3>
                                <p className="text-lg text-green-700 mb-4">훌륭하게 배려와 기다림을 실천했습니다.</p>
                                <div className="flex justify-center gap-2 mb-2">
                                    {[...Array(Math.max(1, state.hearts))].map((_, i) => (
                                        <span key={i} className="text-2xl">💖</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                                <button
                                    onClick={downloadCertificate}
                                    disabled={isDownloading}
                                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isDownloading ? (
                                        <span className="animate-pulse">이미지 생성 중...</span>
                                    ) : (
                                        <><FaDownload /> <span>수료증 저장하기 (패들렛 공유용)</span></>
                                    )}
                                </button>
                                <button
                                    onClick={resetGame}
                                    className="py-4 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaRotateLeft /> <span>처음으로</span>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
