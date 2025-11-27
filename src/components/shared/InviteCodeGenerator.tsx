import React, { useState } from "react";
import { createInvitationCode } from "../../api/client";
import { Button, colors } from "../../styles/primitives";

type Props = {
  groupId: number;
  isAdmin: boolean;
};

const InviteCodeGenerator: React.FC<Props> = ({ groupId, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const create = async () => {
    if (!isAdmin) {
      alert("초대코드는 팀장만 생성할 수 있습니다");
      return;
    }
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
      <Button onClick={create} disabled={loading}>
        {loading ? "생성 중..." : "초대 코드 생성"}
      </Button>
      {code && (
        <span style={{ marginLeft: 8, color: colors.text }}>
          코드: <strong>{code}</strong>
          <Button
            $variant="outline"
            onClick={() => navigator.clipboard.writeText(code)}
            style={{ marginLeft: 6, padding: "4px 8px" }}
          >
            복사
          </Button>
        </span>
      )}
    </span>
  );
};

export default InviteCodeGenerator;
