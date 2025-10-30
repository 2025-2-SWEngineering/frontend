import React, { useState } from "react";
import { createInvitationCode } from "../api/client";

type Props = {
  groupId: number;
};

const InviteCodeGenerator: React.FC<Props> = ({ groupId }) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const create = async () => {
    try {
      setLoading(true);
      const invitation = await createInvitationCode(groupId);
      setCode(invitation?.code ?? null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      <button
        onClick={create}
        disabled={loading}
        style={{
          padding: "6px 10px",
          background: "#667eea",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "생성 중..." : "초대 코드 생성"}
      </button>
      {code && (
        <span style={{ marginLeft: 8, color: "#333" }}>
          코드: <strong>{code}</strong>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            style={{
              marginLeft: 6,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            복사
          </button>
        </span>
      )}
    </span>
  );
};

export default InviteCodeGenerator;
