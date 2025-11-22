import React, { useEffect, useState } from "react";
import { fetchGroups } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import CreateGroupModal from "../components/modals/CreateGroupModal";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import LogoutButton from "../components/LogoutButton";
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

  return (
    <div className="group-select-container">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <LogoutButton />
      </div>
      
      <div className="group-select-header">
        <span className="group-select-title">내 그룹</span>
        <button className="group-join-button" onClick={() => setShowJoinModal(true)}>
          참여하기 {">"}
        </button>
      </div>

      <div className="group-grid">
        {groups.map((group) => (
          <div key={group.id} className="group-card">
            {/* Random star for visual effect, logic can be added later */}
            {group.id % 2 === 0 && <div className="group-card-star">★</div>}
            
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

