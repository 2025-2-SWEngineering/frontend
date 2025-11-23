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

  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"transactions" | "dues" | "charts">("transactions");

  // Refs for scrolling
  const transactionsRef = React.useRef<HTMLDivElement>(null);
  const duesRef = React.useRef<HTMLDivElement>(null);
  const chartsRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    return categoryData.map((c, idx) => ({
      name: c.category,
      value: Number(c.expense),
      color: COLORS[idx % COLORS.length], // Fallback color
    }));
  }, [categoryData]);


  return (
    <div className="dashboard-container">
      <LoadingOverlay visible={loading} label="데이터 불러오는 중..." />

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-top">
          <button className="back-button" onClick={() => navigate("/group")}>
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
          <span
            className="view-all"
            onClick={() => setIsTransactionModalOpen(true)}
          >
            전체보기 {">"}
          </span>
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
                <div className="receipt-link">영수증 {">"}</div>
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
        </div>

        <div className="member-status-card">
          <div className="member-row">
            <span className="member-header">이름</span>
            <span className="member-header">상태</span>
            <span className="member-header">마지막 납부일</span>
          </div>
          {dues.map((member, idx) => (
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
            </div>
          ))}
          {dues.length === 0 && (
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
              <div className="donut-label">지출</div>
              <div className="donut-value">
                {formatCurrencyKRW(stats?.totalExpense ?? 0)}
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
                      <div className="receipt-link">영수증 {">"}</div>
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
    </div>
  );
};

export default DashboardPage;
