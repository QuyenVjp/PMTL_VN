import type { AuditLog, AuditLogInput, BeginnerGuide, BeginnerGuideGetPayload, BeginnerGuidePopulateParam, BeginnerGuideInput, BlogComment, BlogCommentGetPayload, BlogCommentPopulateParam, BlogCommentInput, BlogPost, BlogPostGetPayload, BlogPostPopulateParam, BlogPostInput, BlogReaderState, BlogReaderStateGetPayload, BlogReaderStatePopulateParam, BlogReaderStateInput, BlogTag, BlogTagGetPayload, BlogTagPopulateParam, BlogTagInput, Category, CategoryGetPayload, CategoryPopulateParam, CategoryInput, ChantItem, ChantItemGetPayload, ChantItemPopulateParam, ChantItemInput, ChantPlan, ChantPlanGetPayload, ChantPlanPopulateParam, ChantPlanInput, ChantPreference, ChantPreferenceGetPayload, ChantPreferencePopulateParam, ChantPreferenceInput, ChantingSetting, ChantingSettingGetPayload, ChantingSettingPopulateParam, ChantingSettingInput, CommunityComment, CommunityCommentGetPayload, CommunityCommentPopulateParam, CommunityCommentInput, CommunityPost, CommunityPostGetPayload, CommunityPostPopulateParam, CommunityPostInput, ContentHistory, ContentHistoryInput, DownloadItem, DownloadItemGetPayload, DownloadItemPopulateParam, DownloadItemInput, Event, EventGetPayload, EventPopulateParam, EventInput, GalleryItem, GalleryItemGetPayload, GalleryItemPopulateParam, GalleryItemInput, GuestbookEntry, GuestbookEntryGetPayload, GuestbookEntryPopulateParam, GuestbookEntryInput, HubPage, HubPageGetPayload, HubPagePopulateParam, HubPageInput, LunarEvent, LunarEventGetPayload, LunarEventPopulateParam, LunarEventInput, LunarEventChantOverride, LunarEventChantOverrideGetPayload, LunarEventChantOverridePopulateParam, LunarEventChantOverrideInput, PracticeLog, PracticeLogGetPayload, PracticeLogPopulateParam, PracticeLogInput, PushJob, PushJobInput, PushSubscription, PushSubscriptionGetPayload, PushSubscriptionPopulateParam, PushSubscriptionInput, RequestGuard, RequestGuardInput, Setting, SettingGetPayload, SettingPopulateParam, SettingInput, SidebarConfig, SidebarConfigGetPayload, SidebarConfigPopulateParam, SidebarConfigInput, Sutra, SutraGetPayload, SutraPopulateParam, SutraInput, SutraBookmark, SutraBookmarkGetPayload, SutraBookmarkPopulateParam, SutraBookmarkInput, SutraChapter, SutraChapterGetPayload, SutraChapterPopulateParam, SutraChapterInput, SutraGlossary, SutraGlossaryGetPayload, SutraGlossaryPopulateParam, SutraGlossaryInput, SutraReadingProgress, SutraReadingProgressGetPayload, SutraReadingProgressPopulateParam, SutraReadingProgressInput, SutraVolume, SutraVolumeGetPayload, SutraVolumePopulateParam, SutraVolumeInput, UiIcon, UiIconInput, User, UserGetPayload, UserPopulateParam, UserInput } from './types.js';
import type { AuditLogFilters, BeginnerGuideFilters, BlogCommentFilters, BlogPostFilters, BlogReaderStateFilters, BlogTagFilters, CategoryFilters, ChantItemFilters, ChantPlanFilters, ChantPreferenceFilters, ChantingSettingFilters, CommunityCommentFilters, CommunityPostFilters, ContentHistoryFilters, DownloadItemFilters, EventFilters, GalleryItemFilters, GuestbookEntryFilters, HubPageFilters, LunarEventFilters, LunarEventChantOverrideFilters, PracticeLogFilters, PushJobFilters, PushSubscriptionFilters, RequestGuardFilters, SettingFilters, SidebarConfigFilters, SutraFilters, SutraBookmarkFilters, SutraChapterFilters, SutraGlossaryFilters, SutraReadingProgressFilters, SutraVolumeFilters, UiIconFilters, UserFilters } from './types.js';
export interface StrapiResponse<T> {
    data: T;
    meta?: {
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}
/** Custom error class for Strapi API errors */
export declare class StrapiError extends Error {
    /** Clean user-friendly message from Strapi backend */
    userMessage: string;
    /** HTTP status code */
    status: number;
    /** HTTP status text */
    statusText: string;
    /** Additional error details from Strapi */
    details?: any;
    constructor(message: string, userMessage: string, status: number, statusText: string, details?: any);
}
/** Error thrown when the client cannot connect to Strapi (network failures, DNS, timeouts) */
export declare class StrapiConnectionError extends Error {
    /** The URL that was being requested */
    url: string;
    /** The original error that caused the connection failure */
    cause?: Error;
    constructor(message: string, url: string, cause?: Error);
}
declare class BaseAPI {
    protected config: StrapiClientConfig;
    constructor(config: StrapiClientConfig);
    private getErrorHint;
    protected request<R>(url: string, options?: RequestInit, nextOptions?: NextOptions, errorPrefix?: string): Promise<R>;
    protected buildQueryString(params?: QueryParams): string;
}
type StrapiSortOption<T> = Exclude<keyof T & string, '__typename'> | `${Exclude<keyof T & string, '__typename'>}:${"asc" | "desc"}`;
export interface QueryParams<TEntity = any, TFilters = Record<string, any>, TPopulate = any, TFields extends string = Exclude<keyof TEntity & string, '__typename'>> {
    filters?: TFilters;
    sort?: StrapiSortOption<TEntity> | StrapiSortOption<TEntity>[];
    pagination?: {
        page?: number;
        pageSize?: number;
        limit?: number;
        start?: number;
    };
    populate?: TPopulate;
    fields?: TFields[];
    locale?: string;
    status?: 'draft' | 'published';
}
export interface NextOptions {
    revalidate?: number | false;
    tags?: string[];
    cache?: RequestCache;
    headers?: Record<string, string | undefined>;
}
export interface StrapiClientConfig {
    baseURL: string;
    token?: string;
    fetch?: typeof fetch;
    debug?: boolean;
    credentials?: RequestCredentials;
    /** Request timeout in milliseconds. When set, requests that take longer will be aborted. */
    timeout?: number;
    /** Enable schema validation on init (dev mode). Logs warning if types are outdated. */
    validateSchema?: boolean;
}
/** Utility type for exact type equality check */
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
/**
 * Utility type to automatically infer populated type based on base type
 * Uses exact equality instead of extends to avoid structural typing issues
 */
type GetPopulated<TBase, TPopulate> = Equal<TBase, BeginnerGuide> extends true ? BeginnerGuideGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, BlogComment> extends true ? BlogCommentGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, BlogPost> extends true ? BlogPostGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, BlogReaderState> extends true ? BlogReaderStateGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, BlogTag> extends true ? BlogTagGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, Category> extends true ? CategoryGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, ChantItem> extends true ? ChantItemGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, ChantPlan> extends true ? ChantPlanGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, ChantPreference> extends true ? ChantPreferenceGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, ChantingSetting> extends true ? ChantingSettingGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, CommunityComment> extends true ? CommunityCommentGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, CommunityPost> extends true ? CommunityPostGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, DownloadItem> extends true ? DownloadItemGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, Event> extends true ? EventGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, GalleryItem> extends true ? GalleryItemGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, GuestbookEntry> extends true ? GuestbookEntryGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, HubPage> extends true ? HubPageGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, LunarEvent> extends true ? LunarEventGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, LunarEventChantOverride> extends true ? LunarEventChantOverrideGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, PracticeLog> extends true ? PracticeLogGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, PushSubscription> extends true ? PushSubscriptionGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, Setting> extends true ? SettingGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, SidebarConfig> extends true ? SidebarConfigGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, Sutra> extends true ? SutraGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, SutraBookmark> extends true ? SutraBookmarkGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, SutraChapter> extends true ? SutraChapterGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, SutraGlossary> extends true ? SutraGlossaryGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, SutraReadingProgress> extends true ? SutraReadingProgressGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, SutraVolume> extends true ? SutraVolumeGetPayload<{
    populate: TPopulate;
}> : Equal<TBase, User> extends true ? UserGetPayload<{
    populate: TPopulate;
}> : TBase;
/** Utility type for narrowing return type based on fields parameter */
type SelectFields<TFull, TBase, TFields extends string> = [TFields] extends [never] ? TFull : Pick<TBase, Extract<TFields | 'id' | 'documentId', keyof TBase>> & Omit<TFull, keyof TBase>;
export interface LoginCredentials {
    identifier: string;
    password: string;
}
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    referralCode?: string;
    referralSource?: "code" | "link" | "share";
}
export interface AuthResponse {
    jwt: string;
    user: User;
}
export interface ForgotPasswordData {
    email: string;
}
export interface ResetPasswordData {
    code: string;
    password: string;
    passwordConfirmation: string;
}
export interface ChangePasswordData {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
}
export interface EmailConfirmationResponse {
    jwt: string;
    user: User;
}
declare class CollectionAPI<TBase, TInput = Partial<TBase>, TFilters = Record<string, any>, TPopulateKeys extends Record<string, any> = Record<string, any>> extends BaseAPI {
    private endpoint;
    constructor(endpoint: string, config: StrapiClientConfig);
    find<const TPopulate extends TPopulateKeys, const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields>[]>;
    find<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: '*' | true;
    } & QueryParams<TBase, TFilters, '*' | true, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, '*'>, TBase, TFields>[]>;
    find<const TPopulate extends readonly (keyof TPopulateKeys & string)[], const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields>[]>;
    find<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params?: QueryParams<TBase, TFilters, TPopulateKeys | (keyof TPopulateKeys & string)[] | '*' | boolean, TFields>, nextOptions?: NextOptions): Promise<SelectFields<TBase, TBase, TFields>[]>;
    findWithMeta<const TPopulate extends TPopulateKeys, const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<StrapiResponse<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields>[]>>;
    findWithMeta<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: '*' | true;
    } & QueryParams<TBase, TFilters, '*' | true, TFields>, nextOptions?: NextOptions): Promise<StrapiResponse<SelectFields<GetPopulated<TBase, '*'>, TBase, TFields>[]>>;
    findWithMeta<const TPopulate extends readonly (keyof TPopulateKeys & string)[], const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<StrapiResponse<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields>[]>>;
    findWithMeta<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params?: QueryParams<TBase, TFilters, TPopulateKeys | (keyof TPopulateKeys & string)[] | '*' | boolean, TFields>, nextOptions?: NextOptions): Promise<StrapiResponse<SelectFields<TBase, TBase, TFields>[]>>;
    findOne<const TPopulate extends TPopulateKeys, const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(documentId: string, params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields> | null>;
    findOne<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(documentId: string, params: {
        populate: '*' | true;
    } & QueryParams<TBase, TFilters, '*' | true, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, '*'>, TBase, TFields> | null>;
    findOne<const TPopulate extends readonly (keyof TPopulateKeys & string)[], const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(documentId: string, params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields> | null>;
    findOne<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(documentId: string, params?: QueryParams<TBase, TFilters, TPopulateKeys | (keyof TPopulateKeys & string)[] | '*' | boolean, TFields>, nextOptions?: NextOptions): Promise<SelectFields<TBase, TBase, TFields> | null>;
    create(data: TInput | FormData, nextOptions?: NextOptions): Promise<TBase>;
    update(documentId: string, data: TInput | FormData, nextOptions?: NextOptions): Promise<TBase>;
    delete(documentId: string, nextOptions?: NextOptions): Promise<TBase | null>;
}
declare class SingleTypeAPI<TBase, TInput = Partial<TBase>, TFilters = Record<string, any>, TPopulateKeys extends Record<string, any> = Record<string, any>> extends BaseAPI {
    private endpoint;
    constructor(endpoint: string, config: StrapiClientConfig);
    find<const TPopulate extends TPopulateKeys, const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields>>;
    find<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: '*' | true;
    } & QueryParams<TBase, TFilters, '*' | true, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, '*'>, TBase, TFields>>;
    find<const TPopulate extends readonly (keyof TPopulateKeys & string)[], const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<TBase, TFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<TBase, TPopulate>, TBase, TFields>>;
    find<const TFields extends Exclude<keyof TBase & string, '__typename'> = never>(params?: QueryParams<TBase, TFilters, TPopulateKeys | (keyof TPopulateKeys & string)[] | '*' | boolean, TFields>, nextOptions?: NextOptions): Promise<SelectFields<TBase, TBase, TFields>>;
    update(data: TInput | FormData, nextOptions?: NextOptions): Promise<TBase>;
}
declare class BlogCommentAPI extends CollectionAPI<BlogComment, BlogCommentInput, BlogCommentFilters, BlogCommentPopulateParam> {
    /**
     * POST /blog-comments/submit
     * Handler: blog-comment.submit
     */
    submit(data?: any | FormData): Promise<any>;
    /**
     * POST /blog-comments/like/:identifier
     * Handler: blog-comment.like
     */
    like(identifier: string, data?: any | FormData): Promise<any>;
    /**
     * POST /blog-comments/report/:identifier
     * Handler: blog-comment.report
     */
    report(identifier: string, data?: any | FormData): Promise<any>;
    /**
     * GET /blog-comments/by-post/:slug
     * Handler: blog-comment.byPost
     */
    byPost(slug: string): Promise<any>;
    /**
     * GET /blog-comments/latest
     * Handler: blog-comment.latest
     */
    latest(): Promise<any>;
}
declare class BlogPostAPI extends CollectionAPI<BlogPost, BlogPostInput, BlogPostFilters, BlogPostPopulateParam> {
    /**
     * POST /blog-posts/:identifier/view
     * Handler: blog-post.incrementView
     */
    incrementView(identifier: string, data?: any | FormData): Promise<any>;
    /**
     * GET /blog-posts/archive
     * Handler: blog-post.archive
     */
    archive(): Promise<any>;
    /**
     * GET /blog-posts/archive-index
     * Handler: blog-post.archiveIndex
     */
    archiveIndex(): Promise<any>;
    /**
     * GET /blog-posts/series/:seriesKey
     * Handler: blog-post.series
     */
    series(seriesKey: string): Promise<any>;
}
declare class BlogReaderStateAPI extends CollectionAPI<BlogReaderState, BlogReaderStateInput, BlogReaderStateFilters, BlogReaderStatePopulateParam> {
    /**
     * GET /blog-reader-states/my
     * Handler: blog-reader-state.listMyStates
     */
    listMyStates(): Promise<any>;
    /**
     * GET /blog-reader-states/my/posts
     * Handler: blog-reader-state.listMyPosts
     */
    listMyPosts(): Promise<any>;
    /**
     * GET /blog-reader-states/my/summary
     * Handler: blog-reader-state.summary
     */
    summary(): Promise<any>;
    /**
     * POST /blog-reader-states/my
     * Handler: blog-reader-state.upsertMyState
     */
    upsertMyState(data?: any | FormData): Promise<any>;
}
declare class CategoryAPI extends BaseAPI {
    constructor(config: StrapiClientConfig);
    /**
     * GET /categories/tree
     * Handler: category.tree
     */
    tree(): Promise<any>;
    /**
     * GET /categories/breadcrumb/:slug
     * Handler: category.breadcrumb
     */
    breadcrumb(slug: string): Promise<any>;
}
declare class ChantPlanAPI extends CollectionAPI<ChantPlan, ChantPlanInput, ChantPlanFilters, ChantPlanPopulateParam> {
    /**
     * GET /chant-plans/today-chant
     * Handler: chant-plan.getTodayChant
     */
    getTodayChant(): Promise<any>;
    /**
     * GET /chant-plans/today-chant/my
     * Handler: chant-plan.getTodayChantMy
     */
    getTodayChantMy(): Promise<any>;
}
declare class ChantPreferenceAPI extends CollectionAPI<ChantPreference, ChantPreferenceInput, ChantPreferenceFilters, ChantPreferencePopulateParam> {
    /**
     * GET /chant-preferences/my
     * Handler: chant-preference.findMyPreference
     */
    findMyPreference(): Promise<any>;
    /**
     * PUT /chant-preferences/my
     * Handler: chant-preference.upsertMyPreference
     */
    upsertMyPreference(data?: any | FormData): Promise<any>;
}
declare class CommunityCommentAPI extends CollectionAPI<CommunityComment, CommunityCommentInput, CommunityCommentFilters, CommunityCommentPopulateParam> {
    /**
     * POST /community-comments/submit
     * Handler: community-comment.createComment
     */
    createComment(data?: any | FormData): Promise<any>;
    /**
     * POST /community-comments/like/:identifier
     * Handler: community-comment.likeComment
     */
    likeComment(identifier: string, data?: any | FormData): Promise<any>;
    /**
     * POST /community-comments/report/:identifier
     * Handler: community-comment.reportComment
     */
    reportComment(identifier: string, data?: any | FormData): Promise<any>;
}
declare class CommunityPostAPI extends CollectionAPI<CommunityPost, CommunityPostInput, CommunityPostFilters, CommunityPostPopulateParam> {
    /**
     * POST /community-posts/submit
     * Handler: community-post.createPost
     */
    createPost(data?: any | FormData): Promise<any>;
    /**
     * POST /community-posts/like/:identifier
     * Handler: community-post.like
     */
    like(identifier: string, data?: any | FormData): Promise<any>;
    /**
     * POST /community-posts/:identifier/view
     * Handler: community-post.incrementView
     */
    incrementView(identifier: string, data?: any | FormData): Promise<any>;
    /**
     * POST /community-posts/report/:identifier
     * Handler: community-post.report
     */
    report(identifier: string, data?: any | FormData): Promise<any>;
}
declare class GuestbookEntryAPI extends BaseAPI {
    constructor(config: StrapiClientConfig);
    /**
     * POST /guestbook-entries/submit
     * Handler: guestbook-entry.submit
     */
    submit(data?: any | FormData): Promise<any>;
    /**
     * GET /guestbook-entries/list
     * Handler: guestbook-entry.list
     */
    list(): Promise<any>;
    /**
     * GET /guestbook-entries/archive-list
     * Handler: guestbook-entry.archiveList
     */
    archiveList(): Promise<any>;
    /**
     * GET /guestbook-entries/archive/:year/:month
     * Handler: guestbook-entry.archive
     */
    archive(year: string, month: string): Promise<any>;
}
declare class LunarEventAPI extends CollectionAPI<LunarEvent, LunarEventInput, LunarEventFilters, LunarEventPopulateParam> {
    /**
     * GET /lunar-events/with-blogs
     * Handler: lunar-event.findWithBlogs
     */
    findWithBlogs(): Promise<any>;
}
declare class PracticeLogAPI extends CollectionAPI<PracticeLog, PracticeLogInput, PracticeLogFilters, PracticeLogPopulateParam> {
    /**
     * GET /practice-logs/my
     * Handler: practice-log.findMyLog
     */
    findMyLog(): Promise<any>;
    /**
     * PUT /practice-logs/my
     * Handler: practice-log.upsertMyLog
     */
    upsertMyLog(data?: any | FormData): Promise<any>;
}
declare class PushSubscriptionAPI extends CollectionAPI<PushSubscription, PushSubscriptionInput, PushSubscriptionFilters, PushSubscriptionPopulateParam> {
    /**
     * POST /push-subscriptions/upsert
     * Handler: push-subscription.upsert
     */
    upsert(data?: any | FormData): Promise<any>;
    /**
     * DELETE /push-subscriptions/by-endpoint
     * Handler: push-subscription.deleteByEndpoint
     */
    deleteByEndpoint(): Promise<any>;
    /**
     * GET /push-subscriptions
     * Handler: push-subscription.find
     */
    find(): Promise<any>;
    /**
     * PUT /push-subscriptions/:documentId
     * Handler: push-subscription.update
     */
    update(documentId: string, data?: any | FormData): Promise<any>;
    /**
     * GET /push-subscriptions/stats
     * Handler: push-subscription.stats
     */
    stats(): Promise<any>;
}
declare class SutraBookmarkAPI extends CollectionAPI<SutraBookmark, SutraBookmarkInput, SutraBookmarkFilters, SutraBookmarkPopulateParam> {
    /**
     * GET /sutra-bookmarks/my
     * Handler: sutra-bookmark.listMyBookmarks
     */
    listMyBookmarks(): Promise<any>;
    /**
     * POST /sutra-bookmarks/my
     * Handler: sutra-bookmark.createMyBookmark
     */
    createMyBookmark(data?: any | FormData): Promise<any>;
    /**
     * DELETE /sutra-bookmarks/my/:documentId
     * Handler: sutra-bookmark.deleteMyBookmark
     */
    deleteMyBookmark(documentId: string): Promise<any>;
}
declare class SutraReadingProgressAPI extends BaseAPI {
    constructor(config: StrapiClientConfig);
    /**
     * GET /sutra-reading-progresses/my
     * Handler: sutra-reading-progress.findMyProgress
     */
    findMyProgress(): Promise<any>;
    /**
     * PUT /sutra-reading-progresses/my
     * Handler: sutra-reading-progress.upsertMyProgress
     */
    upsertMyProgress(data?: any | FormData): Promise<any>;
}
declare class AuthAPI extends BaseAPI {
    constructor(config: StrapiClientConfig);
    /**
     * Login with email/username and password
     * POST /api/auth/local
     */
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    /**
     * Register a new user
     * POST /api/auth/local/register
     */
    register(data: RegisterData): Promise<AuthResponse>;
    /**
     * Get current authenticated user
     * GET /api/users/me
     * Supports populate with automatic type inference
     */
    me<const TPopulate extends UserPopulateParam, const TFields extends Exclude<keyof User & string, '__typename'> = never>(params: {
        populate: TPopulate;
    } & QueryParams<User, UserFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<User, TPopulate>, User, TFields>>;
    me<const TFields extends Exclude<keyof User & string, '__typename'> = never>(params: {
        populate: '*' | true;
    } & QueryParams<User, UserFilters, '*' | true, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<User, '*'>, User, TFields>>;
    me<const TFields extends Exclude<keyof User & string, '__typename'> = never>(params?: QueryParams<User, UserFilters, UserPopulateParam | (keyof UserPopulateParam & string)[] | '*' | boolean, TFields>, nextOptions?: NextOptions): Promise<SelectFields<User, User, TFields>>;
    /**
     * Update current authenticated user
     * PUT /api/users/me
     * Supports populate with automatic type inference
     */
    updateMe<const TPopulate extends UserPopulateParam, const TFields extends Exclude<keyof User & string, '__typename'> = never>(data: Partial<User>, params: {
        populate: TPopulate;
    } & QueryParams<User, UserFilters, TPopulate, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<User, TPopulate>, User, TFields>>;
    updateMe<const TFields extends Exclude<keyof User & string, '__typename'> = never>(data: Partial<User>, params: {
        populate: '*' | true;
    } & QueryParams<User, UserFilters, '*' | true, TFields>, nextOptions?: NextOptions): Promise<SelectFields<GetPopulated<User, '*'>, User, TFields>>;
    updateMe<const TFields extends Exclude<keyof User & string, '__typename'> = never>(data: Partial<User>, params?: QueryParams<User, UserFilters, UserPopulateParam | (keyof UserPopulateParam & string)[] | '*' | boolean, TFields>, nextOptions?: NextOptions): Promise<SelectFields<User, User, TFields>>;
    /**
     * OAuth callback
     * GET /api/auth/:provider/callback
     * @param provider - OAuth provider name (google, github, etc.)
     * @param search - Query string (e.g., "access_token=xxx&code=yyy" or "?access_token=xxx")
     */
    callback(provider: string, search?: string, nextOptions?: NextOptions): Promise<AuthResponse>;
    /**
     * Logout current user (client-side token removal helper)
     */
    logout(): Promise<void>;
    /**
     * Request password reset email
     * POST /api/auth/forgot-password
     */
    forgotPassword(data: ForgotPasswordData): Promise<{
        ok: boolean;
    }>;
    /**
     * Reset password using reset code
     * POST /api/auth/reset-password
     */
    resetPassword(data: ResetPasswordData): Promise<AuthResponse>;
    /**
     * Change password for authenticated user
     * POST /api/auth/change-password
     */
    changePassword(data: ChangePasswordData): Promise<AuthResponse>;
    /**
     * Confirm user email address
     * GET /api/auth/email-confirmation?confirmation=TOKEN
     */
    confirmEmail(confirmationToken: string, nextOptions?: NextOptions): Promise<EmailConfirmationResponse>;
    /**
     * Send email confirmation
     * POST /api/auth/send-email-confirmation
     */
    sendEmailConfirmation(email: string): Promise<{
        ok: boolean;
    }>;
}
export declare class StrapiClient {
    private config;
    authentication: AuthAPI;
    auditLogs: CollectionAPI<AuditLog, AuditLogInput, AuditLogFilters>;
    beginnerGuides: CollectionAPI<BeginnerGuide, BeginnerGuideInput, BeginnerGuideFilters, BeginnerGuidePopulateParam>;
    blogComments: BlogCommentAPI;
    blogPosts: BlogPostAPI;
    blogReaderStates: BlogReaderStateAPI;
    blogTags: CollectionAPI<BlogTag, BlogTagInput, BlogTagFilters, BlogTagPopulateParam>;
    categories: CollectionAPI<Category, CategoryInput, CategoryFilters, CategoryPopulateParam>;
    chantItems: CollectionAPI<ChantItem, ChantItemInput, ChantItemFilters, ChantItemPopulateParam>;
    chantPlans: ChantPlanAPI;
    chantPreferences: ChantPreferenceAPI;
    chantingSetting: SingleTypeAPI<ChantingSetting, ChantingSettingInput, ChantingSettingFilters, ChantingSettingPopulateParam>;
    communityComments: CommunityCommentAPI;
    communityPosts: CommunityPostAPI;
    contentHistories: CollectionAPI<ContentHistory, ContentHistoryInput, ContentHistoryFilters>;
    downloadItems: CollectionAPI<DownloadItem, DownloadItemInput, DownloadItemFilters, DownloadItemPopulateParam>;
    events: CollectionAPI<Event, EventInput, EventFilters, EventPopulateParam>;
    galleryItems: CollectionAPI<GalleryItem, GalleryItemInput, GalleryItemFilters, GalleryItemPopulateParam>;
    guestbookEntries: CollectionAPI<GuestbookEntry, GuestbookEntryInput, GuestbookEntryFilters, GuestbookEntryPopulateParam>;
    hubPages: CollectionAPI<HubPage, HubPageInput, HubPageFilters, HubPagePopulateParam>;
    lunarEvents: LunarEventAPI;
    lunarEventChantOverrides: CollectionAPI<LunarEventChantOverride, LunarEventChantOverrideInput, LunarEventChantOverrideFilters, LunarEventChantOverridePopulateParam>;
    practiceLogs: PracticeLogAPI;
    pushJobs: CollectionAPI<PushJob, PushJobInput, PushJobFilters>;
    pushSubscriptions: PushSubscriptionAPI;
    requestGuards: CollectionAPI<RequestGuard, RequestGuardInput, RequestGuardFilters>;
    setting: SingleTypeAPI<Setting, SettingInput, SettingFilters, SettingPopulateParam>;
    sidebarConfig: SingleTypeAPI<SidebarConfig, SidebarConfigInput, SidebarConfigFilters, SidebarConfigPopulateParam>;
    sutras: CollectionAPI<Sutra, SutraInput, SutraFilters, SutraPopulateParam>;
    sutraBookmarks: SutraBookmarkAPI;
    sutraChapters: CollectionAPI<SutraChapter, SutraChapterInput, SutraChapterFilters, SutraChapterPopulateParam>;
    sutraGlossaries: CollectionAPI<SutraGlossary, SutraGlossaryInput, SutraGlossaryFilters, SutraGlossaryPopulateParam>;
    sutraReadingProgresses: CollectionAPI<SutraReadingProgress, SutraReadingProgressInput, SutraReadingProgressFilters, SutraReadingProgressPopulateParam>;
    sutraVolumes: CollectionAPI<SutraVolume, SutraVolumeInput, SutraVolumeFilters, SutraVolumePopulateParam>;
    uiIcons: CollectionAPI<UiIcon, UiIconInput, UiIconFilters>;
    users: CollectionAPI<User, UserInput, UserFilters, UserPopulateParam>;
    category: CategoryAPI;
    guestbookEntry: GuestbookEntryAPI;
    sutraReadingProgress: SutraReadingProgressAPI;
    constructor(config: StrapiClientConfig);
    setToken(token: string): void;
    /**
     * Validate that local types match the remote Strapi schema.
     * Useful for detecting schema drift in development.
     * @returns Promise<{ valid: boolean; localHash: string; remoteHash?: string; error?: string }>
     */
    validateSchema(): Promise<{
        valid: boolean;
        localHash: string;
        remoteHash?: string;
        error?: string;
    }>;
}
export {};
