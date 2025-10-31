import api from "../services/api";
import type {
    GroupsListResponse,
    GroupMembersResponse,
    TransactionsListResponse,
    TransactionsStatsResponse,
    MonthlyResponse,
    DuesListResponse,
    UserPreferencesResponse,
    UploadModeResponse,
    PresignPutResponse,
    DirectUploadResponse,
    InvitationAcceptResponse,
    InvitationCreateResponse,
    CategoryAggResponse,
} from "../types/api";

// Groups
export async function fetchGroups() {
    const { data } = await api.get<GroupsListResponse>("/groups");
    return data.groups || [];
}

export async function createNewGroup(name: string) {
    const { data } = await api.post<{ group: { id: number } }>("/groups", { name });
    return data.group;
}

export async function fetchGroupMembers(groupId: number) {
    const { data } = await api.get<GroupMembersResponse>(`/groups/${groupId}/members`);
    return data.members || [];
}

export async function createInvitationCode(groupId: number) {
    const { data } = await api.post<InvitationCreateResponse>(`/groups/${groupId}/invitations`, {});
    return data.invitation;
}

export async function acceptInvitation(code: string) {
    const { data } = await api.post<InvitationAcceptResponse>("/invitations/accept", { code });
    return data;
}

export async function deleteGroupApi(groupId: number) {
    await api.delete(`/groups/${groupId}`);
}

export async function leaveGroupApi(groupId: number) {
    await api.post(`/groups/${groupId}/leave`, {});
}

// Transactions
export async function fetchTxStats(groupId: number) {
    const { data } = await api.get<TransactionsStatsResponse>("/transactions/stats", { params: { groupId } });
    return data.stats;
}

export async function fetchTransactions(groupId: number, limit = 20, page = 1) {
    const { data } = await api.get<TransactionsListResponse>("/transactions", { params: { groupId, limit, page } });
    return data;
}

export async function fetchMonthly(groupId: number, months = 6) {
    const { data } = await api.get<MonthlyResponse>("/transactions/monthly", { params: { groupId, months } });
    return data.data || [];
}

export async function fetchByCategory(groupId: number, opts?: { from?: string; to?: string }) {
    const { data } = await api.get<CategoryAggResponse>("/transactions/by-category", {
        params: { groupId, from: opts?.from, to: opts?.to },
    });
    return data.data || [];
}

export async function createTransactionApi(payload: {
    groupId: number;
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
    category?: string;
    receiptUrl?: string;
}) {
    await api.post("/transactions", payload);
}

export async function removeTransaction(id: number, groupId: number) {
    await api.delete(`/transactions/${id}`, { params: { groupId } });
}

// Dues
export async function fetchDues(groupId: number) {
    const { data } = await api.get<DuesListResponse>("/dues", { params: { groupId } });
    return data.items || [];
}

export async function setDues(groupId: number, userId: number, isPaid: boolean) {
    const { data } = await api.put<{ item: { user_id: number; is_paid: boolean; paid_at?: string } }>("/dues", {
        groupId,
        userId,
        isPaid,
    });
    return data.item;
}

// Preferences
export async function fetchPreferences() {
    const { data } = await api.get<UserPreferencesResponse>("/user/preferences");
    return data.preferences;
}

export async function updatePreferences(prefs: { receive_dues_reminders: boolean }) {
    await api.put("/user/preferences", prefs);
}

// Uploads
export async function getUploadMode() {
    const { data } = await api.get<UploadModeResponse>("/uploads/mode");
    return data.mode;
}

export async function presignPut(filename: string, contentType: string) {
    const { data } = await api.post<PresignPutResponse>("/uploads/presign/put", { filename, contentType });
    return data;
}

export async function uploadDirect(fd: FormData) {
    const { data } = await api.post<DirectUploadResponse>("/uploads/direct", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}
