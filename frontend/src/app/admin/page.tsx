'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TopNavBar from '@/components/layout/TopNavBar';
import { FaShieldHalved, FaUsers, FaArrowRotateRight, FaMagnifyingGlass } from 'react-icons/fa6';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'students'>('teachers');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${user?.authCode}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        console.error(result.detail);
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
    if (!isAdmin) {
      router.push('/start');
      return;
    }
    
    fetchDashboard();
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <TopNavBar />
      
      <main style={{ flex: 1, padding: '32px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
              <FaShieldHalved style={{ color: '#ef4444' }} />
              최고 관리자 대시보드
            </h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>시스템의 모든 데이터를 조망합니다.</p>
          </div>
          <button onClick={fetchDashboard} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, color: '#475569', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} className="hover:bg-slate-50">
            <FaArrowRotateRight /> 데이터 새로고침
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', borderRadius: 24, padding: 24, boxShadow: '0 10px 25px rgba(59,130,246,0.3)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>가입 교사 수</p>
            <p style={{ fontSize: 40, fontWeight: 900, margin: 0 }}>{data?.teachersTotal || 0}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: 24, padding: 24, boxShadow: '0 10px 25px rgba(16,185,129,0.3)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>생성된 전체 학생(세션) 수</p>
            <p style={{ fontSize: 40, fontWeight: 900, margin: 0 }}>{data?.studentsTotal || 0}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', borderRadius: 24, padding: 24, boxShadow: '0 10px 25px rgba(139,92,246,0.3)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>개설된 학급(세션) 수</p>
            <p style={{ fontSize: 40, fontWeight: 900, margin: 0 }}>{data ? new Set(data.students?.map((s:any)=>s.authCode)).size : 0}</p>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            <button onClick={() => setActiveTab('teachers')} style={{ flex: 1, padding: 20, background: activeTab === 'teachers' ? '#f8fafc' : 'white', border: 'none', borderBottom: activeTab === 'teachers' ? '3px solid #3b82f6' : '3px solid transparent', fontSize: 16, fontWeight: 800, color: activeTab === 'teachers' ? '#1e293b' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
              교사 목록
            </button>
            <button onClick={() => setActiveTab('students')} style={{ flex: 1, padding: 20, background: activeTab === 'students' ? '#f8fafc' : 'white', border: 'none', borderBottom: activeTab === 'students' ? '3px solid #10b981' : '3px solid transparent', fontSize: 16, fontWeight: 800, color: activeTab === 'students' ? '#1e293b' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
              모든 학생 참여 기록
            </button>
          </div>

          <div style={{ padding: 24, minHeight: 400 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8' }}>데이터 불러오는 중...</div>
            ) : activeTab === 'teachers' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>아이디</th>
                    <th style={{ padding: '12px 16px' }}>이메일</th>
                    <th style={{ padding: '12px 16px' }}>인증번호</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.teachers?.map((t:any) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>{t.username}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.email}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#3b82f6' }}>{t.authCode}</td>
                    </tr>
                  ))}
                  {data?.teachers?.length === 0 && <tr><td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>이름</th>
                    <th style={{ padding: '12px 16px' }}>소속 (인증번호)</th>
                    <th style={{ padding: '12px 16px' }}>마지막 접속</th>
                    <th style={{ padding: '12px 16px' }}>진행도</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.students?.map((s:any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>{s.studentName}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}><span style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4f46e5', borderRadius: 12, fontWeight: 700, fontSize: 12 }}>{s.authCode}</span></td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{new Date(s.lastActive).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>{Object.keys(s.stages||{}).length}단계 완료</td>
                    </tr>
                  ))}
                  {data?.students?.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
