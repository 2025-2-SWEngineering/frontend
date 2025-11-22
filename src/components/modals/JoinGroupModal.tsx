import React from "react";
import { InviteAcceptor } from "../shared";
import "../../pages/GroupSelectPage.css";

interface JoinGroupModalProps {
  onClose: () => void;
  onJoined: (groupId: number) => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose, onJoined }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">초대 코드로 참여</h2>
        <InviteAcceptor
          onAccepted={(gid) => {
            onJoined(gid);
          }}
        />
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button type="button" className="modal-button cancel" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupModal;
