import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useGroupsSelection } from "../hooks/useGroupsSelection";
import { useOverviewData } from "../hooks/useOverviewData";
import { getPresignedUrl, setDues, createTransactionApi } from "../api/client";
import DuesModal from "../components/modals/DuesModal";
import DuesSettingsModal from "../components/modals/DuesSettingsModal";
import TransactionCreateModal from "../components/modals/TransactionCreateModal";
import { useCategoryAgg } from "../hooks/useCategoryAgg";
import { formatCurrencyKRW } from "../utils/format";
import { LoadingOverlay } from "../components/ui";
import "./DashboardPage.css";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    groups,
    groupId,
    setGroupId,
    loading: groupsLoading,
  } = useGroupsSelection();

  const {
    loading: overviewLoading,
    stats,
    items: recentTransactions,
    monthly,
    dues,
  } = useOverviewData(groupId);

  const { data: categoryData } = useCategoryAgg(groupId);

  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"transactions" | "dues" | "charts">("transactions");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  // Dues Management State
  const [isDuesModalOpen, setIsDuesModalOpen] = useState(false);
  const [isDuesSettingsModalOpen, setIsDuesSettingsModalOpen] = useState(false);
  const [isCreateTransactionModalOpen, setIsCreateTransactionModalOpen] = useState(false);
  const [editingDues, setEditingDues] = useState<{
    name: string;
    isPaid: boolean;
    date: string;
    isGuest: boolean;
    userId?: number;
  } | null>(null);
  const [guestDues, setGuestDues] = useState<Array<{ userName: string; isPaid: boolean; paidAt?: string; userId?: number }>>([]);

  useEffect(() => {
    if (groupId) {
      const saved = localStorage.getItem(`guest_dues_${groupId}`);
      if (saved) {
        setGuestDues(JSON.parse(saved));
      } else {
        setGuestDues([]);
      }
    }
  }, [groupId]);

  const handleSaveDues = async (data: { name: string; isPaid: boolean; date: string; isGuest: boolean; userId?: number }) => {
    try {
      // Check for automatic transaction creation
      // Logic: If transitioning to "Paid" (isPaid=true), create income transaction
      // We need to know previous state. For simplicity, we assume if user clicks "Save" with "Paid", and it's a positive action, we record it.
      // Better: Check if it was already paid? 
      // Current logic in DuesModal sets initialData. If initialData.isPaid was false, and now data.isPaid is true -> Create Transaction.
      
      const wasPaid = editingDues?.isPaid || false;
      if (data.isPaid && !wasPaid && groupId) {
        const savedAmount = localStorage.getItem(`dues_amount_${groupId}`);
        const amount = savedAmount ? parseInt(savedAmount, 10) : 0;
        
        if (amount > 0) {
          await createTransactionApi({
            groupId,
            type: "income",
            amount,
            description: `회비 납부 - ${data.name}`,
            date: new Date().toISOString(),
            category: "회비"
          });
          // Refresh transactions will happen via window.location.reload() below or we can refetch
        }
      }

      if (data.isGuest) {
        // Handle Guest (LocalStorage)
        const newGuest = {
          userName: data.name,
          isPaid: data.isPaid,
          paidAt: data.date || undefined,
        };

        let updatedGuests;
        if (editingDues && editingDues.isGuest) {
          // Update existing guest
          updatedGuests = guestDues.map(g => g.userName === editingDues.name ? newGuest : g);
        } else {
          // Add new guest
          updatedGuests = [...guestDues, newGuest];
        }
        
        setGuestDues(updatedGuests);
        localStorage.setItem(`guest_dues_${groupId}`, JSON.stringify(updatedGuests));
      } else {
        // Handle Member (API)
        if (data.userId) {
          setLoading(true);
          await setDues(groupId!, data.userId, data.isPaid);
          // Note: Backend sets date to NOW() automatically. We can't set custom date for members without backend change.
          // We will refresh the data to show updated status.
          window.location.reload(); // Simple refresh to fetch updated data
          return; 
        }
      }
      setIsDuesModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllDues = async () => {
    try {
      if (!groupId) return;
      setLoading(true);

      // 1. Reset Guests (LocalStorage)
      const resetGuests = guestDues.map(g => ({ ...g, isPaid: false, paidAt: undefined }));
      setGuestDues(resetGuests);
      localStorage.setItem(`guest_dues_${groupId}`, JSON.stringify(resetGuests));

      // 2. Reset Members (API)
      // Filter only paid members to minimize requests
      const paidMembers = dues.filter(d => d.isPaid && d.userId);
      
      // Execute sequentially or parallel? Parallel is faster but might hit rate limits. 
      // Given "Frontend Only" constraint, we just loop.
      await Promise.all(paidMembers.map(member => 
        setDues(groupId, member.userId!, false)
      ));

      alert("모든 회비 납부 상태가 초기화되었습니다.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("초기화 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Refs for scrolling
  const transactionsRef = React.useRef<HTMLDivElement>(null);
  const duesRef = React.useRef<HTMLDivElement>(null);
  const chartsRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReceiptClick = async (key?: string) => {
    if (!key) {
      alert("등록된 영수증이 없습니다.");
      return;
    }
    try {
      setLoading(true);
      const url = await getPresignedUrl(key);
      setSelectedReceiptUrl(url);
    } catch (e) {
      console.error(e);
      alert("영수증을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Adjust trigger zone
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === transactionsRef.current) setActiveSection("transactions");
          else if (entry.target === duesRef.current) setActiveSection("dues");
          else if (entry.target === chartsRef.current) setActiveSection("charts");
        }
      });
    }, observerOptions);

    if (transactionsRef.current) observer.observe(transactionsRef.current);
    if (duesRef.current) observer.observe(duesRef.current);
    if (chartsRef.current) observer.observe(chartsRef.current);

    return () => observer.disconnect();
  }, [loading]); // Re-run when loading finishes and refs are attached

  useEffect(() => {
    if (!groupsLoading && !groupId) setLoading(false);
  }, [groupsLoading, groupId]);

  useEffect(() => {
    setLoading(overviewLoading || groupsLoading);
  }, [overviewLoading, groupsLoading]);

  // Get current group name
  const currentGroupName = useMemo(() => {
    return groups.find((g) => g.id === groupId)?.name || "그룹 선택";
  }, [groups, groupId]);

  const currentUserRole = useMemo(() => {
    return groups.find((g) => g.id === groupId)?.user_role;
  }, [groups, groupId]);

  // Format balance
  const currentBalance = formatCurrencyKRW(stats?.currentBalance ?? 0);

  // Prepare chart data
  const monthlyChartData = useMemo(() => {
    if (!monthly) return [];
    // Take last 5 months for the chart
    return monthly.slice(-5).map((m) => ({
      name: `${m.month}월`,
      income: m.income,
      expense: m.expense,
    }));
  }, [monthly]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const categoryChartData = useMemo(() => {
    if (!categoryData) return [];
    return categoryData
      .filter((c) => c.category !== "회비" && Number(c.expense) > 0) // Filter out "회비" and non-expenses
      .map((c, idx) => ({
        name: c.category,
        value: Number(c.expense),
        color: COLORS[idx % COLORS.length], // Fallback color
      }));
  }, [categoryData]);


  const totalExpense = useMemo(() => {
    return categoryChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [categoryChartData]);

  return (
    <div className="dashboard-container">
      <LoadingOverlay visible={loading} label="데이터 불러오는 중..." />

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-top">
          <button className="back-button" onClick={() => navigate("/groups")}>
            {"<"}
          </button>
          <span
            className="member-manage-link"
            onClick={() => groupId && navigate(`/groups/${groupId}/members`)}
          >
            멤버 관리
          </span>
        </div>

        <div className="balance-section">
          <div className="balance-label">현재 잔액</div>
          <div className="balance-amount">
            {currentBalance} <span className="info-icon">ⓘ</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className={`action-btn ${activeSection === "transactions" ? "primary" : "secondary"}`}
            onClick={() => scrollToSection(transactionsRef)}
          >
            거래내역
          </button>
          <button 
            className={`action-btn ${activeSection === "dues" ? "primary" : "secondary"}`}
            onClick={() => scrollToSection(duesRef)}
          >
            회비납부
          </button>
          <button 
            className={`action-btn ${activeSection === "charts" ? "primary" : "secondary"}`}
            onClick={() => scrollToSection(chartsRef)}
          >
            그래프
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="dashboard-content">
        {/* Recent Transactions */}
        <div className="section-title-row" ref={transactionsRef}>
          <span className="section-title">최근거래 내역</span>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>

            <span
              className="view-all"
              onClick={() => setIsTransactionModalOpen(true)}
            >
              전체보기 {">"}
            </span>
            {currentUserRole === "admin" && (
              <span
                className="view-all"
                style={{ color: "#007bff", marginRight: 0, cursor: "pointer", marginLeft: "12px" }}
                onClick={() => setIsCreateTransactionModalOpen(true)}
              >
                + 추가
              </span>
            )}
          </div>
        </div>

        <div className="transaction-list">
          {recentTransactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="trans-info">
                <div className="trans-title-row">
                  <span className="trans-title">{tx.description}</span>
                  <span className="trans-tag">{tx.category}</span>
                </div>
                <span className="trans-date">{tx.date}</span>
              </div>
              <div className="trans-amount-col">
                <div
                  className={`trans-amount ${
                    tx.type === "expense" ? "expense" : "income"
                  }`}
                >
                  {tx.type === "expense" ? "-" : "+"} {formatCurrencyKRW(tx.amount)}
                </div>
                <div 
                  className="receipt-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReceiptClick(tx.receiptUrl);
                  }}
                >
                  영수증 {">"}
                </div>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              거래 내역이 없습니다.
            </div>
          )}
        </div>

        {/* Member Status (Dues) */}
        <div className="section-title-row" ref={duesRef}>
          <span className="section-title">회비납부 현황</span>
          {/* <span
            className="view-all"
            style={{ color: "#007bff", marginRight: 0, cursor: "pointer" }}
            onClick={() => {
              setEditingDues(null);
              setIsDuesModalOpen(true);
            }}
          >
            + 추가하기
          </span> */}
          <span
            className="view-all"
            style={{ color: "#666", marginRight: 0, cursor: "pointer", fontSize: "14px", marginLeft: "12px" }}
            onClick={() => setIsDuesSettingsModalOpen(true)}
          >
            ⚙️ 회비 설정
          </span>
        </div>

        <div className="member-status-card">
          <div className="member-row">
            <span className="member-header">이름</span>
            <span className="member-header">상태</span>
            <span className="member-header">마지막 납부일</span>
            <span className="member-header" style={{ width: 40 }}></span>
          </div>
          {[...dues, ...guestDues].map((member, idx) => (
            <div key={idx} className="member-row">
              <span className="member-name">{member.userName}</span>
              <span
                className={`member-status ${
                  member.isPaid ? "status-paid" : "status-unpaid"
                }`}
              >
                {member.isPaid ? "납부" : "미납"}
              </span>
              <span className="member-date">
                {member.paidAt ? member.paidAt.slice(0, 10) : "-"}
              </span>
              <span 
                className="edit-icon" 
                onClick={() => {
                  setEditingDues({
                    name: member.userName,
                    isPaid: member.isPaid || false,
                    date: member.paidAt ? member.paidAt.slice(0, 10) : "",
                    isGuest: !member.userId, // If no userId, it's a guest
                    userId: member.userId,
                  });
                  setIsDuesModalOpen(true);
                }}
                style={{ cursor: "pointer", fontSize: "14px" }}
              >
                ✏️
              </span>
            </div>
          ))}
          {[...dues, ...guestDues].length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              멤버 정보가 없습니다.
            </div>
          )}
        </div>

        {/* Monthly Chart */}
        <div className="section-title-row" ref={chartsRef}>
          <span className="section-title">월별 수입/지출 추이</span>
        </div>

        <div className="chart-container">
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="income" fill="#28a745" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="#e03e3e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Summary */}
        <div className="section-title-row">
          <span className="section-title">항목별 집계</span>
        </div>

        <div className="chart-container">
          <div className="donut-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
              <div className="donut-center-text">
                <div className="donut-label">지출 총 합</div>
                <div className="donut-value">
                  {formatCurrencyKRW(totalExpense)}
                </div>
              </div>
          </div>

          <div className="chart-legend">
             {categoryChartData.slice(0, 3).map((entry, index) => (
               <div key={index} className="legend-item">
                 <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                 <span>{entry.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTransactionModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">전체 거래 내역</span>
              <button
                className="modal-close"
                onClick={() => setIsTransactionModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="transaction-list">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="transaction-card">
                    <div className="trans-info">
                      <div className="trans-title-row">
                        <span className="trans-title">{tx.description}</span>
                        <span className="trans-tag">{tx.category}</span>
                      </div>
                      <span className="trans-date">{tx.date}</span>
                    </div>
                    <div className="trans-amount-col">
                      <div
                        className={`trans-amount ${
                          tx.type === "expense" ? "expense" : "income"
                        }`}
                      >
                        {tx.type === "expense" ? "-" : "+"} {formatCurrencyKRW(tx.amount)}
                      </div>
                      <div 
                        className="receipt-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReceiptClick(tx.receiptUrl);
                        }}
                      >
                        영수증 {">"}
                      </div>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <div className="modal-empty">
                    거래 내역이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceiptUrl && (
        <div className="modal-overlay" onClick={() => setSelectedReceiptUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <span className="modal-title">영수증 이미지</span>
              <button
                className="modal-close"
                onClick={() => setSelectedReceiptUrl(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="receipt-image-container">
                <img src={selectedReceiptUrl} alt="영수증" className="receipt-image" />
              </div>
            </div>
          </div>
        </div>
      )}

      {isDuesModalOpen && (
        <DuesModal
          onClose={() => setIsDuesModalOpen(false)}
          onSave={handleSaveDues}
          initialData={editingDues || undefined}
          existingMemberNames={dues.map(d => d.userName)}
        />
      )}

      {isDuesSettingsModalOpen && groupId && (
        <DuesSettingsModal
          onClose={() => setIsDuesSettingsModalOpen(false)}
          groupId={groupId}
          onResetAll={handleResetAllDues}
        />
      )}

      {isCreateTransactionModalOpen && groupId && (
        <TransactionCreateModal
          groupId={groupId}
          onClose={() => setIsCreateTransactionModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default DashboardPage;
