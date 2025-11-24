import React, { useEffect, useState } from "react";
import { fetchGroups } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import LogoutButton from "../components/LogoutButton";
import logo from "../assets/logo.png";
import "./GroupSelectPage.css";

const GroupSelectPage: React.FC = () => {
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const {
    data: groupsData,
    loading: loadingGroups,
    run: runGroups,
  } = useAsync(
    async () => {
      const list = await fetchGroups();
      return list || [];
    },
    [],
    { immediate: true },
  );

  useEffect(() => {
    setGroups((groupsData as any) || []);
  }, [groupsData]);

  const enterGroup = (gid: number) => {
    localStorage.setItem("selectedGroupId", String(gid));
    window.location.href = "/dashboard";
  };

  const handleGroupCreated = (gid: number) => {
    setShowCreateModal(false);
    enterGroup(gid);
  };

  const handleGroupJoined = async (gid: number) => {
    setShowJoinModal(false);
    await runGroups();
    enterGroup(gid);
  };

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "사용자";

  return (
    <div className="group-select-container">
      <div className="top-section">
        <img src={logo} alt="W" className="top-logo" />
        
        <div className="greeting-text">
          안녕하세요 {userName}님!<br />
          읽지 않은 알림이 3건 있어요.
        </div>
      </div>

      <div className="content-section">
        <div className="group-select-header">
          <span className="group-select-title">내 그룹</span>
          <button className="group-join-button" onClick={() => setShowJoinModal(true)}>
            참여하기 {">"}
          </button>
        </div>

        <div className="group-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              {/* Star icon removed */}
              
              <div className="group-card-title">{group.name}</div>
              <div className="group-card-subtitle">그룹</div>
              
              <div className="group-avatars">
                {/* Placeholder avatars */}
                <div className="group-avatar" style={{ backgroundColor: "#ffadad" }} />
                <div className="group-avatar" style={{ backgroundColor: "#ffd6a5" }} />
                <div className="group-avatar" style={{ backgroundColor: "#fdffb6" }} />
                <div className="group-avatar-more">+2</div>
              </div>

              <button className="group-enter-button" onClick={() => enterGroup(group.id)}>
                입장하기
              </button>
            </div>
          ))}

          {/* Add Group Card */}
          <div className="add-group-card" onClick={() => setShowCreateModal(true)}>
            <div className="add-group-icon">+</div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleGroupCreated}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onJoined={handleGroupJoined}
        />
      )}
    </div>
  );
};

export default GroupSelectPage;

