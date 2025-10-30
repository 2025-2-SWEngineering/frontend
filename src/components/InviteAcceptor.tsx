import React, { useState } from "react";
import { acceptInvitation } from "../api/client";

type Props = {
  onAccepted: (groupId: number) => void;
};

const InviteAcceptor: React.FC<Props> = ({ onAccepted }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    try {
      setLoading(true);
      const data = await acceptInvitation(code);
      onAccepted(data.groupId);
      setCode("");
      alert("그룹에 가입되었습니다.");
    } catch (err: unknown) {
      const axiosLike = err as { response?: { data?: { message?: string } } };
      alert(axiosLike.response?.data?.message || "가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "inline-flex", gap: 8 }}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="초대 코드 입력"
        style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "6px 10px",
          background: "#10b981",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "가입 중..." : "코드로 가입"}
      </button>
    </form>
  );
};

export default InviteAcceptor;
