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

  const { data: categoryData } = useCategoryAgg(groupId);

  const [loading, setLoading] = useState(true);

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

  const categoryChartData = useMemo(() => {
    if (!categoryData) return [];
    
    type ChartItem = {
      name: string;
      value: number;
      type: "income" | "expense";
      color: string;
    };

    const result: ChartItem[] = [];
    
    // Process Income
    categoryData.forEach((c, idx) => {
      const income = Number(c.income);
      if (income > 0) {
        result.push({
          name: c.category,
          value: income,
          type: "income",
          color: COLORS[idx % COLORS.length], // Assign color
        });
      }
    });

    // Process Expense
    categoryData.forEach((c, idx) => {
      const expense = Number(c.expense);
      if (expense > 0) {
        result.push({
          name: c.category,
          value: expense,
          type: "expense",
          color: COLORS[(idx + 2) % COLORS.length], // Offset color for variety
        });
      }
    });

    return result;
  }, [categoryData]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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
          <button className="action-btn primary">거래내역</button>
          <button className="action-btn secondary">회비납부</button>
          <button className="action-btn secondary">그래프</button>
        </div>
      </div>

      {/* Content Section */}
      <div className="dashboard-content">
        {/* Recent Transactions */}
        <div className="section-title-row">
          <span className="section-title">최근거래 내역</span>
          <span className="view-all">전체보기 {">"}</span>
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
        <div className="section-title-row">
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
        <div className="section-title-row">
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

        {/* Category Summary (Gauge Charts) */}
        <div className="section-title-row">
          <span className="section-title">항목별 집계</span>
        </div>

        <div className="charts-row">
          {/* Income Chart */}
          <div className="chart-card">
            <div className="gauge-chart-wrapper">
              {categoryChartData.filter((c) => c.type === "income").length > 0 ? (
                <ResponsiveContainer width="100%" height="200%">
                  <PieChart>
                    <Pie
                      data={categoryChartData.filter((c) => c.type === "income")}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryChartData
                        .filter((c) => c.type === "income")
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ position: "absolute", bottom: 40, color: "#ccc", fontSize: 12 }}>
                  데이터 없음
                </div>
              )}
              <div className="gauge-center-text">
                <div className="gauge-label">수입</div>
                <div className="gauge-value">
                  {formatCurrencyKRW(stats?.totalIncome ?? 0)}
                </div>
              </div>
            </div>
            <div className="category-list">
              {categoryChartData
                .filter((c) => c.type === "income")
                .slice(0, 3)
                .map((item, idx) => (
                  <div key={idx} className="category-item">
                    <div className="category-name">
                      <div
                        className="category-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>
                    <div className="category-amount">
                      {formatCurrencyKRW(item.value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Expense Chart */}
          <div className="chart-card">
            <div className="gauge-chart-wrapper">
              {categoryChartData.filter((c) => c.type === "expense").length > 0 ? (
                <ResponsiveContainer width="100%" height="200%">
                  <PieChart>
                    <Pie
                      data={categoryChartData.filter((c) => c.type === "expense")}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryChartData
                        .filter((c) => c.type === "expense")
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ position: "absolute", bottom: 40, color: "#ccc", fontSize: 12 }}>
                  데이터 없음
                </div>
              )}
              <div className="gauge-center-text">
                <div className="gauge-label">지출</div>
                <div className="gauge-value">
                  {formatCurrencyKRW(stats?.totalExpense ?? 0)}
                </div>
              </div>
            </div>
            <div className="category-list">
              {categoryChartData
                .filter((c) => c.type === "expense")
                .slice(0, 3)
                .map((item, idx) => (
                  <div key={idx} className="category-item">
                    <div className="category-name">
                      <div
                        className="category-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>
                    <div className="category-amount">
                      {formatCurrencyKRW(item.value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

