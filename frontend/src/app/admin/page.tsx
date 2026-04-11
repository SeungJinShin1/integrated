'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TopNavBar from '@/components/layout/TopNavBar';
import Icon from '@/components/ui/Icon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Teacher {
  id: string;
  username: string;
  email: string;
  authCode: string;
  role?: string;
}

interface Student {
  id: string;
  studentName: string;
  authCode: string;
  lastActive?: string;
  stages?: Record<string, unknown>;
}

interface DashboardData {
  success: boolean;
  teachersTotal: number;
  studentsTotal: number;
  teachers: Teacher[];
  students: Student[];
}

interface ResetResult {
  username: string;
  email: string;
  authCode: string;
  tempPassword: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user?.authCode ?? ''}`,
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: authHeaders(),
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
        setErrorMessage('');
      } else {
        setErrorMessage(result.detail || '데이터를 불러오지 못했습니다.');
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('서버 연결 오류입니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.push('/start');
      return;
    }
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, router]);

  const handleDeleteTeacher = async (teacher: Teacher) => {
    const ok = confirm(
      `정말 "${teacher.username}" 교사 계정을 삭제하시겠어요?\n` +
        `학급(${teacher.authCode})에 속한 모든 학생 기록도 함께 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다.`,
    );
    if (!ok) return;
    setBusyId(teacher.id);
    try {
      const res = await fetch(`${API_URL}/api/admin/teachers/${teacher.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.detail || '삭제에 실패했습니다.');
      } else {
        alert(`교사 계정이 삭제되었습니다. (학생 기록 ${result.deletedStudents}건 함께 삭제)`);
        await fetchDashboard();
      }
    } catch (e) {
      console.error(e);
      alert('서버 연결 오류입니다.');
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (teacher: Teacher) => {
    const customPw = prompt(
      `"${teacher.username}" 교사의 새 비밀번호를 입력하세요.\n` +
        `비워두고 확인을 누르면 임시 비밀번호가 자동 발급됩니다.`,
      '',
    );
    // prompt returns null when cancelled
    if (customPw === null) return;
    setBusyId(teacher.id);
    try {
      const res = await fetch(`${API_URL}/api/admin/teachers/${teacher.id}/reset-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ newPassword: customPw || null }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.detail || '비밀번호 재설정에 실패했습니다.');
      } else {
        setResetResult({
          username: result.username,
          email: result.email,
          authCode: result.authCode,
          tempPassword: result.tempPassword,
        });
      }
    } catch (e) {
      console.error(e);
      alert('서버 연결 오류입니다.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    const ok = confirm(
      `학생 기록 "${student.studentName}" (학급 ${student.authCode}) 을(를) 삭제하시겠어요?`,
    );
    if (!ok) return;
    setBusyId(student.id);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/students/${student.authCode}/${student.id}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.detail || '삭제에 실패했습니다.');
      } else {
        await fetchDashboard();
      }
    } catch (e) {
      console.error(e);
      alert('서버 연결 오류입니다.');
    } finally {
      setBusyId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => alert('복사되었습니다.'),
      () => alert('복사에 실패했습니다. 직접 선택해서 복사해 주세요.'),
    );
  };

  if (!user || !isAdmin) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <TopNavBar />

      <main style={{ flex: 1, padding: '32px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="shield" alt="관리자" />
              최고 관리자 대시보드
            </h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>
              교사 계정을 관리하고 분실된 비밀번호를 재설정할 수 있어요.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            style={{
              padding: '12px 24px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontWeight: 700,
              color: '#475569',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            }}
          >
            <Icon name="refresh" size={16} alt="새로고침" /> 새로고침
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
          <StatCard color="#3b82f6" label="가입 교사 수" value={data?.teachersTotal ?? 0} />
          <StatCard color="#10b981" label="누적 학생(세션) 수" value={data?.studentsTotal ?? 0} />
          <StatCard
            color="#8b5cf6"
            label="개설된 학급 수"
            value={data ? new Set(data.students?.map((s) => s.authCode)).size : 0}
          />
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            <TabButton active={activeTab === 'teachers'} accent="#3b82f6" onClick={() => setActiveTab('teachers')}>
              교사 관리
            </TabButton>
            <TabButton active={activeTab === 'students'} accent="#10b981" onClick={() => setActiveTab('students')}>
              학생 기록
            </TabButton>
          </div>

          <div style={{ padding: 24, minHeight: 400 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8' }}>
                데이터 불러오는 중...
              </div>
            ) : activeTab === 'teachers' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: 13 }}>
                    <th style={{ padding: '12px 16px' }}>아이디</th>
                    <th style={{ padding: '12px 16px' }}>이메일</th>
                    <th style={{ padding: '12px 16px' }}>인증번호</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.teachers?.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#334155' }}>{t.username}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{t.email}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#3b82f6' }}>{t.authCode}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleResetPassword(t)}
                            disabled={busyId === t.id}
                            title="비밀번호 재설정"
                            style={iconBtnStyle('#0ea5e9')}
                          >
                            <Icon name="key" size={14} alt="키" /> 비밀번호 재설정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(t)}
                            disabled={busyId === t.id}
                            title="교사 계정 삭제"
                            style={iconBtnStyle('#ef4444')}
                          >
                            <Icon name="trash" size={14} alt="삭제" /> 삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.teachers.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        등록된 교사가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: 13 }}>
                    <th style={{ padding: '12px 16px' }}>이름</th>
                    <th style={{ padding: '12px 16px' }}>학급(인증번호)</th>
                    <th style={{ padding: '12px 16px' }}>마지막 접속</th>
                    <th style={{ padding: '12px 16px' }}>진행도</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.students?.map((s) => (
                    <tr key={`${s.authCode}-${s.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#334155' }}>{s.studentName}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            background: '#e0e7ff',
                            color: '#4f46e5',
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {s.authCode}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {s.lastActive ? new Date(s.lastActive).toLocaleString() : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 700 }}>
                        {Object.keys(s.stages || {}).length}단계 완료
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(s)}
                            disabled={busyId === s.id}
                            title="학생 기록 삭제"
                            style={iconBtnStyle('#ef4444')}
                          >
                            <Icon name="trash" size={14} alt="삭제" /> 삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.students.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                        학생 기록이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {resetResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setResetResult(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 24,
              padding: 32,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Icon name="key" alt="키" /> 임시 비밀번호 발급 완료
              </h2>
              <button
                onClick={() => setResetResult(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}
              >
                <Icon name="close" size={18} alt="닫기" />
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
              교사에게 아래 정보를 안내해 주세요. 처음 로그인 후 직접 비밀번호를 변경하도록 권장합니다.
            </p>

            <ResetField label="아이디" value={resetResult.username} onCopy={copyToClipboard} />
            <ResetField label="이메일" value={resetResult.email} onCopy={copyToClipboard} />
            <ResetField label="학급 인증번호" value={resetResult.authCode} onCopy={copyToClipboard} />
            <ResetField label="임시 비밀번호" value={resetResult.tempPassword} onCopy={copyToClipboard} highlight />

            <button
              onClick={() => setResetResult(null)}
              style={{
                width: '100%',
                marginTop: 16,
                padding: 14,
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        color: 'white',
        borderRadius: 24,
        padding: 24,
        boxShadow: `0 10px 25px ${color}44`,
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 40, fontWeight: 900, margin: 0 }}>{value}</p>
    </div>
  );
}

function TabButton({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 20,
        background: active ? '#f8fafc' : 'white',
        border: 'none',
        borderBottom: active ? `3px solid ${accent}` : '3px solid transparent',
        fontSize: 16,
        fontWeight: 800,
        color: active ? '#1e293b' : '#64748b',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function ResetField({
  label,
  value,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  onCopy: (text: string) => void;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: highlight ? '#ecfeff' : '#f8fafc',
        border: `1px solid ${highlight ? '#a5f3fc' : '#e2e8f0'}`,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 700, margin: 0 }}>{label}</p>
        <p
          style={{
            fontSize: highlight ? 18 : 15,
            color: highlight ? '#0e7490' : '#1e293b',
            fontWeight: highlight ? 900 : 700,
            margin: 0,
            wordBreak: 'break-all',
          }}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value)}
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          padding: '8px 12px',
          borderRadius: 10,
          cursor: 'pointer',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        <Icon name="copy" size={14} alt="복사" /> 복사
      </button>
    </div>
  );
}

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    background: 'white',
    border: `1px solid ${color}55`,
    color,
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };
}
