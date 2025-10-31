// 공통 API DTO 및 제네릭 응답 타입

export type ApiListResponse<T> = {
    items: T[];
    meta?: { limit: number; page: number };
};

// 그룹
export type GroupSummaryDTO = {
    id: number;
    name: string;
    user_role?: 'admin' | 'member';
};
export type GroupsListResponse = { groups: GroupSummaryDTO[] };
export type GroupMembersDTO = { user_id: number; user_name: string; role: 'admin' | 'member' };
export type GroupMembersResponse = { members: GroupMembersDTO[] };

// 거래
export type TransactionsListItemDTO = {
    id: number;
    type: 'income' | 'expense';
    amount: number | string;
    description: string;
    date: string;
    receipt_url?: string;
    category?: string | null;
    created_by: number;
};
export type TransactionsListResponse = ApiListResponse<TransactionsListItemDTO>;

export type TransactionsStatsDTO = {
    currentBalance: number;
    totalIncome: number;
    totalExpense: number;
};
export type TransactionsStatsResponse = { stats: TransactionsStatsDTO };

export type MonthlyRowDTO = { month: string; income: number | string; expense: number | string };
export type MonthlyResponse = { data: MonthlyRowDTO[] };

// 카테고리 집계
export type CategoryAggRowDTO = { category: string; income: number | string; expense: number | string; total: number | string };
export type CategoryAggResponse = { data: CategoryAggRowDTO[] };

// 회비
export type DuesRowDTO = { user_id: number; user_name: string; is_paid: boolean | null; paid_at?: string | null };
export type DuesListResponse = { items: DuesRowDTO[] };

// 사용자 선호
export type UserPreferencesDTO = { receive_dues_reminders: boolean };
export type UserPreferencesResponse = { preferences?: UserPreferencesDTO };

// 업로드/프리사인
export type UploadModeResponse = { mode: 's3' | 'local' };
export type PresignPutResponse = { url: string; key: string; contentType: string };
export type PresignGetResponse = { url: string };
export type DirectUploadResponse = { url?: string; key?: string; contentType?: string };

// 초대
export type InvitationAcceptResponse = { message: string; groupId: number };
export type InvitationCreateResponse = { invitation: { code: string } };
