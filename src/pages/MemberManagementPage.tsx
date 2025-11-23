import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGroupMembers, kickMemberApi, fetchGroups, createInvitationCode } from "../api/client";
import { useOverviewData } from "../hooks/useOverviewData";
import { LoadingOverlay } from "../components/ui";
import { notifyError, confirmAsync } from "../utils/notify";
import "./MemberManagementPage.css";

type Member = { user_id: number; user_name: string; role: "admin" | "member" };

const MemberManagementPage: React.FC = () => {
  const { groupId: groupIdParam } = useParams<{ groupId: string }>();
  const groupId = Number(groupIdParam);
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Use overview data hook to get unpaid count (dues)
  const { dues, loading: overviewLoading } = useOverviewData(groupId);

  const unpaidCount = useMemo(() => {
    return dues.filter((d) => d.status === "unpaid").length;
  }, [dues]);

  useEffect(() => {
    if (!groupId) return;
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch group info to get name and check admin role
      const groups = await fetchGroups();
      const currentGroup = groups.find((g) => g.id === groupId);
      if (currentGroup) {
        setGroupName(currentGroup.name);
        setIsAdmin(currentGroup.user_role === "admin");
      }

      // Fetch members
      const membersList = await fetchGroupMembers(groupId);
      setMembers(membersList || []);
    } catch (e) {
      notifyError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async (member: Member) => {
    if (!isAdmin) return;
    const ok = await confirmAsync(`정말 ${member.user_name} 님을 추방하시겠습니까?`);
    if (!ok) return;

    try {
      setLoading(true);
      await kickMemberApi(groupId, member.user_id);
      await loadData(); // Reload list
    } catch (e) {
      notifyError("추방에 실패했습니다.");
      setLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    try {
      setLoading(true);
      const result = await createInvitationCode(groupId);
      setInviteCode(result.code);
    } catch (e) {
      notifyError("초대코드 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert("초대코드가 복사되었습니다.");
    }
  };

  return (
    <div className="member-management-container">
      <LoadingOverlay visible={loading || overviewLoading} label="로딩 중..." />

      {/* Header */}
      <div className="member-header-section">
        <div className="member-header-top">
          <button className="member-back-button" onClick={() => navigate("/dashboard")}>
            {"<"}
          </button>
          <span className="member-header-title">멤버 관리</span>
        </div>
        <div className="group-name-display">{groupName}</div>
      </div>

      {/* Stats Card */}
      <div className="member-stats-card">
        <div className="stat-item">
          <span className="stat-value">{members.length}명</span>
          <span className="stat-label">멤버 수</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">27건</span>
          <span className="stat-label">알람 수</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{unpaidCount}건</span>
          <span className="stat-label">회비 미납</span>
        </div>
      </div>

      {/* Member List */}
      <div className="member-content-section">
        <div className="section-label">그룹 멤버</div>
        <div className="member-list-card">
          <div className="member-list-header">
            <span style={{ flex: 1 }}>이름</span>
            <span style={{ flex: 1, textAlign: "center" }}>역할</span>
            <span style={{ flex: 1, textAlign: "right" }}>관리</span>
          </div>
          {members.map((member) => (
            <div key={member.user_id} className="member-list-item">
              <div className="member-info-col">{member.user_name}</div>
              <div className="member-role-col">
                {member.role === "admin" ? "팀장" : member.role === "member" ? "팀원" : "총무"}
                <span style={{ fontSize: 10, color: "#999" }}>v</span>
              </div>
              <div className="member-action-col">
                {isAdmin && member.role !== "admin" && (
                  <button className="kick-button" onClick={() => handleKick(member)}>
                    추방
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification History Placeholder */}
      <div className="member-content-section">
        <div className="section-label">알림 내역</div>
        <div className="empty-card">
          알림 내역이 없습니다.
        </div>
      </div>

      {/* Invite Code Generation */}
      <div className="member-content-section">
        <div className="section-label">초대코드 생성</div>
        {!inviteCode ? (
          <div className="invite-create-card" onClick={handleCreateInvite}>
            <span className="invite-create-text">초대코드를 생성하려면 클릭하세요.</span>
          </div>
        ) : (
          <div className="invite-code-display">
            <div className="invite-code-label">생성된 초대코드</div>
            <div className="invite-code-value">{inviteCode}</div>
            <button className="copy-button" onClick={copyToClipboard}>
              복사하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManagementPage;
