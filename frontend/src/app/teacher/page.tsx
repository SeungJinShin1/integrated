'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TopNavBar from '@/components/layout/TopNavBar';
import Icon from '@/components/ui/Icon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface StageEntry {
  status?: 'in_progress' | 'completed';
  score?: number;
  startedAt?: string;
  completedAt?: string;
  usedTools?: string[];
  logs?: Record<string, unknown>;
}

interface StudentData {
  id: string;
  studentName: string;
  lastActive: string;
  gradeMode?: string;
  stages: Record<string, StageEntry>;
}

interface StageColumn {
  key: string;
  label: string;
  title: string;
}

const HIGH_COLUMNS: StageColumn[] = [
  { key: 'stage-1', label: '1단계', title: '앵무새의 숲' },
  { key: 'stage-2', label: '2단계', title: '폭탄이 터졌다!' },
  { key: 'stage-3', label: '3단계', title: '기차는 멈추지 않아' },
  { key: 'stage-4', label: '4단계', title: '사라진 퍼즐 조각' },
  { key: 'stage-5', label: '5단계', title: '갈림길의 기억' },
  { key: 'stage-6', label: '6단계', title: '빛나는 우리 반' },
];

const LOW_COLUMNS: StageColumn[] = [1, 2, 3, 4, 5].map(n => ({
  key: `low_stage${n}`,
  label: `에피소드 ${n}`,
  title: '',
}));

type StageStatus = 'none' | 'in_progress' | 'completed';

const LIGHT: Record<StageStatus, { color: string; label: string }> = {
  none: { color: '#ef4444', label: '시작 전' },
  in_progress: { color: '#f59e0b', label: '진행 중' },
  completed: { color: '#22c55e', label: '완료' },
};

function stageStatusOf(student: StudentData, key: string): StageStatus {
  const entry = student.stages?.[key];
  if (!entry) return 'none';
  // 완료 증거(completedAt/status)가 있으면 항상 완료로 판정 —
  // 진행중/완료 전송이 엇갈려 도착해도 초록불이 유지되도록.
  if (entry.completedAt || entry.status === 'completed') return 'completed';
  if (entry.status === 'in_progress') return 'in_progress';
  // 예전 기록에는 status 필드가 없음 → 완료로 취급
  return 'completed';
}

function TrafficLight({ status, tooltip }: { status: StageStatus; tooltip: string }) {
  const { color } = LIGHT[status];
  return (
    <span
      title={tooltip}
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}55`,
        verticalAlign: 'middle',
      }}
    />
  );
}

function formatLastActive(lastActive?: string): string {
  if (!lastActive) return '-';
  try {
    return new Date(lastActive + 'Z').toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return '-';
  }
}

function ProgressTable({
  title,
  students,
  columns,
  onDelete,
}: {
  title: string;
  students: StudentData[];
  columns: StageColumn[];
  onDelete: (studentId: string) => void;
}) {
  if (students.length === 0) return null;

  const thStyle: React.CSSProperties = {
    padding: '12px 10px',
    fontSize: 13,
    fontWeight: 800,
    color: '#475569',
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#334155', margin: '0 0 12px 4px' }}>{title} ({students.length}명)</h3>
      <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 16 }}>이름</th>
              {columns.map(col => (
                <th key={col.key} style={thStyle} title={col.title}>{col.label}</th>
              ))}
              <th style={thStyle}>최근 활동</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: '#4f46e5', flexShrink: 0,
                    }}>
                      {(student.studentName || '?').charAt(0)}
                    </div>
                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: 14 }}>{student.studentName}</span>
                  </div>
                </td>
                {columns.map(col => {
                  const status = stageStatusOf(student, col.key);
                  const score = student.stages?.[col.key]?.score;
                  const tooltip = `${col.label}${col.title ? ` (${col.title})` : ''} · ${LIGHT[status].label}${status === 'completed' && typeof score === 'number' ? ` · 점수 ${score}` : ''}`;
                  return (
                    <td key={col.key} style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <TrafficLight status={status} tooltip={tooltip} />
                    </td>
                  );
                })}
                <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                  {formatLastActive(student.lastActive)}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button
                    onClick={() => onDelete(student.id)}
                    title="학생 삭제"
                    style={{
                      width: 30, height: 30, borderRadius: '50%', background: '#fef2f2',
                      border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#ef4444',
                    }}
                  >
                    <Icon name="trash" size={14} alt="삭제" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isTeacher, isAdmin } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const deleteStudent = async (studentId: string) => {
    if (!user?.authCode) return;
    if (!confirm('이 학생의 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_URL}/api/teacher/students/${user.authCode}/${encodeURIComponent(studentId)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.authCode}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDashboard = useCallback(async () => {
    if (!user?.authCode) return;
    try {
      const res = await fetch(`${API_URL}/api/teacher/dashboard/${user.authCode}`, {
        headers: {
          'Authorization': `Bearer ${user.authCode}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        console.error(data.detail);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.authCode]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!isTeacher && !isAdmin) {
      router.push('/start');
      return;
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, [user, isTeacher, isAdmin, router, fetchDashboard]);

  if (!user || (!isTeacher && !isAdmin)) return null;

  // 저학년(에피소드)과 고학년(단계) 학생을 나눠서 표시.
  // 두 모드 기록이 모두 있는 학생은 양쪽 표에 모두 나타나 이력이 숨지 않습니다.
  const hasLow = (s: StudentData) => LOW_COLUMNS.some(c => s.stages?.[c.key]);
  const hasHigh = (s: StudentData) => HIGH_COLUMNS.some(c => s.stages?.[c.key]);
  const byName = (a: StudentData, b: StudentData) =>
    (a.studentName || '').localeCompare(b.studentName || '', 'ko');
  const lowStudents = students
    .filter(s => hasLow(s) || (s.gradeMode === 'low_grade' && !hasHigh(s)))
    .sort(byName);
  const highStudents = students
    .filter(s => hasHigh(s) || (s.gradeMode !== 'low_grade' && !hasLow(s)))
    .sort(byName);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <TopNavBar />

      <main style={{ flex: 1, padding: '32px 16px', paddingTop: 'calc(var(--nav-height, 56px) + 32px)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="shield" alt="관리자" />
              학급 대시보드
            </h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>학생들의 학습 현황을 실시간으로 확인하세요.</p>
          </div>
          <div style={{ background: 'white', padding: '16px 24px', borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>학생 접속용 인증번호</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: '#4f46e5', letterSpacing: 4, margin: 0, lineHeight: 1 }}>{user.authCode}</p>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="users" size={26} alt="학생들" />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#334155', margin: 0 }}>학생 진행 현황 ({students.length}명)</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* 신호등 범례 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                {(['none', 'in_progress', 'completed'] as StageStatus[]).map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <TrafficLight status={s} tooltip={LIGHT[s].label} />
                    {LIGHT[s].label}
                  </span>
                ))}
              </div>
              <button onClick={fetchDashboard} title="새로고침" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <Icon name="refresh" size={20} alt="새로고침" />
              </button>
            </div>
          </div>

          {loading && students.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: 16 }}>아직 접속한 학생이 없습니다.</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>인증번호 {user.authCode} 를 학생들에게 안내해 주세요.</p>
            </div>
          ) : (
            <>
              <ProgressTable title="🌱 저학년 (에피소드)" students={lowStudents} columns={LOW_COLUMNS} onDelete={deleteStudent} />
              <ProgressTable title="🔍 고학년 (보물찾기)" students={highStudents} columns={HIGH_COLUMNS} onDelete={deleteStudent} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
