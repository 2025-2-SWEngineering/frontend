import React, { useState } from "react";
import { createInvitationCode } from "../../api/client";
import { Button, colors } from "../../styles/primitives";

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
