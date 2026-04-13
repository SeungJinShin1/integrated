'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TopNavBar from '@/components/layout/TopNavBar';
import Icon from '@/components/ui/Icon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface StudentData {
  id: string;
  studentName: string;
  lastActive: string;
  stages: {
    [key: string]: {
      score: number;
      usedTools: string[];
      logs: any;
      completedAt: string;
    }
  }
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isTeacher, isAdmin } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    if (!user?.authCode) return;
    setLoading(true);
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
  };

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
  }, [user, isTeacher, isAdmin, router]);

  if (!user || (!isTeacher && !isAdmin)) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <TopNavBar />
      
      <main style={{ flex: 1, padding: '32px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="shield" alt="관리자" />
              학급 대시보드
            </h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>학생들의 학습 현황을 실시간으로 확인하세요.</p>
          </div>
          <div style={{ background: 'white', padding: '16px 24px', borderRadius: 16, border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>학생 접속용 인증번호</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#4f46e5', letterSpacing: 4, margin: 0, lineHeight: 1 }}>{user.authCode}</p>
            </div>
            <button onClick={fetchDashboard} style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-indigo-50 hover:text-indigo-600">
              <Icon name="refresh" size={22} alt="새로고침" />
            </button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
            <Icon name="users" size={26} alt="학생들" />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#334155', margin: 0 }}>접속 학생 목록 ({students.length}명)</h2>
          </div>

          {loading && students.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터를 불러오는 중...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: 16 }}>아직 접속한 학생이 없습니다.</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>인증번호 {user.authCode} 를 학생들에게 안내해 주세요.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {students.map(student => (
                <div key={student.id} style={{ background: '#f8fafc', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#4f46e5' }}>
                        {student.studentName.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>{student.studentName}</p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>최근 활동: {new Date(student.lastActive + 'Z').toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.keys(student.stages || {}).map(stageId => (
                      <div key={stageId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: 12, fontSize: 14 }}>
                        <span style={{ fontWeight: 700, color: '#475569' }}>{stageId.replace('stage-', '단계 ')}</span>
                        <span style={{ color: '#6366f1', fontWeight: 800 }}>완료</span>
                      </div>
                    ))}
                    {Object.keys(student.stages || {}).length === 0 && (
                      <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: '8px 0' }}>완료된 단계가 없습니다.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
