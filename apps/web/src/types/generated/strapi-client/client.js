import qs from 'qs';
/** Custom error class for Strapi API errors */
export class StrapiError extends Error {
    /** Clean user-friendly message from Strapi backend */
    userMessage;
    /** HTTP status code */
    status;
    /** HTTP status text */
    statusText;
    /** Additional error details from Strapi */
    details;
    constructor(message, userMessage, status, statusText, details) {
        super(message);
        this.name = "StrapiError";
        this.userMessage = userMessage;
        this.status = status;
        this.statusText = statusText;
        this.details = details;
    }
}
/** Error thrown when the client cannot connect to Strapi (network failures, DNS, timeouts) */
export class StrapiConnectionError extends Error {
    /** The URL that was being requested */
    url;
    /** The original error that caused the connection failure */
    cause;
    constructor(message, url, cause) {
        super(message);
        this.name = "StrapiConnectionError";
        this.url = url;
        this.cause = cause;
    }
}
// Base API class with shared logic
class BaseAPI {
    config;
    constructor(config) {
        this.config = config;
    }
    getErrorHint(status) {
        switch (status) {
            case 401: return ' Hint: check that your API token is valid and passed to StrapiClient config.';
            case 403: return ' Hint: your token may lack permissions for this endpoint. Check Strapi roles & permissions.';
            case 404: return ' Hint: this endpoint may not exist. Verify the content type is created in Strapi and the API is enabled.';
            case 500: return ' Hint: internal Strapi error. Check Strapi server logs for details.';
            default: return '';
        }
    }
    async request(url, options = {}, nextOptions, errorPrefix = 'Strapi API') {
        const fetchFn = this.config.fetch || globalThis.fetch;
        if (this.config.debug) {
            console.log(`[${errorPrefix}] ${options.method || 'GET'} ${url}`);
        }
        const headers = {
            ...options.headers,
        };
        // Only add Content-Type for JSON, let browser set it for FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        if (this.config.token) {
            headers['Authorization'] = `Bearer ${this.config.token}`;
        }
        // Merge custom headers from nextOptions
        if (nextOptions?.headers) {
            for (const [key, value] of Object.entries(nextOptions.headers)) {
                if (value !== undefined) {
                    headers[key] = value;
                }
            }
        }
        const fetchOptions = {
            ...options,
            headers,
            ...(this.config.credentials && { credentials: this.config.credentials }),
        };
        // Add Next.js cache options if provided
        if (nextOptions) {
            if (nextOptions.revalidate !== undefined || nextOptions.tags) {
                fetchOptions.next = {
                    ...(nextOptions.revalidate !== undefined && { revalidate: nextOptions.revalidate }),
                    ...(nextOptions.tags && { tags: nextOptions.tags }),
                };
            }
            if (nextOptions.cache) {
                fetchOptions.cache = nextOptions.cache;
            }
        }
        // Timeout support via AbortController
        let timeoutId;
        if (this.config.timeout) {
            const controller = new AbortController();
            fetchOptions.signal = controller.signal;
            timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        }
        let response;
        try {
            response = await fetchFn(url, fetchOptions);
        }
        catch (error) {
            if (timeoutId)
                clearTimeout(timeoutId);
            const baseURL = this.config.baseURL;
            const msg = error?.message || String(error);
            // Timeout (AbortController abort)
            if (error?.name === 'AbortError') {
                throw new StrapiConnectionError(`Request timed out after ${this.config.timeout}ms. URL: ${url}`, url, error);
            }
            // Connection refused
            if (msg.includes('ECONNREFUSED')) {
                throw new StrapiConnectionError(`Could not connect to Strapi at ${baseURL}. Is the server running?`, url, error);
            }
            // DNS resolution failure
            if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
                throw new StrapiConnectionError(`Could not resolve host. Check your baseURL: ${baseURL}`, url, error);
            }
            // Generic network error
            throw new StrapiConnectionError(`Network error: ${msg}. Check your baseURL: ${baseURL}`, url, error);
        }
        finally {
            if (timeoutId)
                clearTimeout(timeoutId);
        }
        if (!response.ok) {
            // Detect HTML response (wrong server / reverse proxy error page)
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                throw new StrapiError(`Strapi returned HTML instead of JSON. Your baseURL may point to the wrong server. URL: ${url}`, 'Unexpected HTML response from server', response.status, response.statusText);
            }
            const errorData = await response.json().catch(() => ({}));
            const userMessage = errorData.error?.message || response.statusText;
            const hint = this.getErrorHint(response.status);
            const technicalMessage = `${errorPrefix} error: ${response.status} ${response.statusText}${errorData.error?.message ? ' - ' + errorData.error.message : ''}${hint}`;
            throw new StrapiError(technicalMessage, userMessage, response.status, response.statusText, errorData.error?.details);
        }
        // Handle 204 No Content (e.g., from DELETE operations)
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }
    buildQueryString(params) {
        if (!params)
            return '';
        const queryString = qs.stringify(params, {
            encodeValuesOnly: true,
            skipNulls: true,
        });
        return queryString ? `?${queryString}` : '';
    }
}
// Collection API wrapper with type-safe populate support
class CollectionAPI extends BaseAPI {
    endpoint;
    constructor(endpoint, config) {
        super(config);
        this.endpoint = endpoint;
    }
    async find(params, nextOptions) {
        const query = this.buildQueryString(params);
        const url = `${this.config.baseURL}/api/${this.endpoint}${query}`;
        const response = await this.request(url, {}, nextOptions);
        return response.data;
    }
    async findWithMeta(params, nextOptions) {
        const query = this.buildQueryString(params);
        const url = `${this.config.baseURL}/api/${this.endpoint}${query}`;
        return this.request(url, {}, nextOptions);
    }
    async findOne(documentId, params, nextOptions) {
        const query = this.buildQueryString(params);
        const url = `${this.config.baseURL}/api/${this.endpoint}/${documentId}${query}`;
        const response = await this.request(url, {}, nextOptions);
        return response.data;
    }
    async create(data, nextOptions) {
        // If data is FormData, use it directly; otherwise wrap in { data } and JSON stringify
        const body = data instanceof FormData
            ? data
            : JSON.stringify({ data });
        const url = `${this.config.baseURL}/api/${this.endpoint}`;
        const response = await this.request(url, {
            method: 'POST',
            body,
        }, nextOptions);
        return response.data;
    }
    async update(documentId, data, nextOptions) {
        // If data is FormData, use it directly; otherwise wrap in { data } and JSON stringify
        const body = data instanceof FormData
            ? data
            : JSON.stringify({ data });
        const url = `${this.config.baseURL}/api/${this.endpoint}/${documentId}`;
        const response = await this.request(url, {
            method: 'PUT',
            body,
        }, nextOptions);
        return response.data;
    }
    async delete(documentId, nextOptions) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/${documentId}`;
        const response = await this.request(url, {
            method: 'DELETE',
        }, nextOptions);
        return response?.data ?? null;
    }
}
// Single Type API wrapper with type-safe populate support
class SingleTypeAPI extends BaseAPI {
    endpoint;
    constructor(endpoint, config) {
        super(config);
        this.endpoint = endpoint;
    }
    async find(params, nextOptions) {
        const query = this.buildQueryString(params);
        const url = `${this.config.baseURL}/api/${this.endpoint}${query}`;
        const response = await this.request(url, {}, nextOptions);
        return response.data;
    }
    async update(data, nextOptions) {
        // If data is FormData, use it directly; otherwise wrap in { data } and JSON stringify
        const body = data instanceof FormData
            ? data
            : JSON.stringify({ data });
        const url = `${this.config.baseURL}/api/${this.endpoint}`;
        const response = await this.request(url, {
            method: 'PUT',
            body,
        }, nextOptions);
        return response.data;
    }
}
// Custom API class for BlogComment (collection type) with custom routes
class BlogCommentAPI extends CollectionAPI {
    /**
     * POST /blog-comments/submit
     * Handler: blog-comment.submit
     */
    async submit(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/submit`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /blog-comments/like/:identifier
     * Handler: blog-comment.like
     */
    async like(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/like/${identifier}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /blog-comments/report/:identifier
     * Handler: blog-comment.report
     */
    async report(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/report/${identifier}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * GET /blog-comments/by-post/:slug
     * Handler: blog-comment.byPost
     */
    async byPost(slug) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/by-post/${slug}`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /blog-comments/latest
     * Handler: blog-comment.latest
     */
    async latest() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/latest`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for BlogPost (collection type) with custom routes
class BlogPostAPI extends CollectionAPI {
    /**
     * POST /blog-posts/:identifier/view
     * Handler: blog-post.incrementView
     */
    async incrementView(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/${identifier}/view`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * GET /blog-posts/archive
     * Handler: blog-post.archive
     */
    async archive() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/archive`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /blog-posts/archive-index
     * Handler: blog-post.archiveIndex
     */
    async archiveIndex() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/archive-index`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /blog-posts/series/:seriesKey
     * Handler: blog-post.series
     */
    async series(seriesKey) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/series/${seriesKey}`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for BlogReaderState (collection type) with custom routes
class BlogReaderStateAPI extends CollectionAPI {
    /**
     * GET /blog-reader-states/my
     * Handler: blog-reader-state.listMyStates
     */
    async listMyStates() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /blog-reader-states/my/posts
     * Handler: blog-reader-state.listMyPosts
     */
    async listMyPosts() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my/posts`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /blog-reader-states/my/summary
     * Handler: blog-reader-state.summary
     */
    async summary() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my/summary`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * POST /blog-reader-states/my
     * Handler: blog-reader-state.upsertMyState
     */
    async upsertMyState(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
}
// Standalone API class for category controller
class CategoryAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    /**
     * GET /categories/tree
     * Handler: category.tree
     */
    async tree() {
        const url = `${this.config.baseURL}/api/categories/tree`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /categories/breadcrumb/:slug
     * Handler: category.breadcrumb
     */
    async breadcrumb(slug) {
        const url = `${this.config.baseURL}/api/categories/breadcrumb/${slug}`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for ChantPlan (collection type) with custom routes
class ChantPlanAPI extends CollectionAPI {
    /**
     * GET /chant-plans/today-chant
     * Handler: chant-plan.getTodayChant
     */
    async getTodayChant() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/today-chant`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /chant-plans/today-chant/my
     * Handler: chant-plan.getTodayChantMy
     */
    async getTodayChantMy() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/today-chant/my`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for ChantPreference (collection type) with custom routes
class ChantPreferenceAPI extends CollectionAPI {
    /**
     * GET /chant-preferences/my
     * Handler: chant-preference.findMyPreference
     */
    async findMyPreference() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * PUT /chant-preferences/my
     * Handler: chant-preference.upsertMyPreference
     */
    async upsertMyPreference(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'PUT',
            body,
        });
        return response.data;
    }
}
// Custom API class for CommunityComment (collection type) with custom routes
class CommunityCommentAPI extends CollectionAPI {
    /**
     * POST /community-comments/submit
     * Handler: community-comment.createComment
     */
    async createComment(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/submit`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /community-comments/like/:identifier
     * Handler: community-comment.likeComment
     */
    async likeComment(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/like/${identifier}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /community-comments/report/:identifier
     * Handler: community-comment.reportComment
     */
    async reportComment(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/report/${identifier}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
}
// Custom API class for CommunityPost (collection type) with custom routes
class CommunityPostAPI extends CollectionAPI {
    /**
     * POST /community-posts/submit
     * Handler: community-post.createPost
     */
    async createPost(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/submit`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /community-posts/like/:identifier
     * Handler: community-post.like
     */
    async like(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/like/${identifier}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /community-posts/:identifier/view
     * Handler: community-post.incrementView
     */
    async incrementView(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/${identifier}/view`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * POST /community-posts/report/:identifier
     * Handler: community-post.report
     */
    async report(identifier, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/report/${identifier}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
}
// Standalone API class for guestbook-entry controller
class GuestbookEntryAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    /**
     * POST /guestbook-entries/submit
     * Handler: guestbook-entry.submit
     */
    async submit(data) {
        const url = `${this.config.baseURL}/api/guestbook-entries/submit`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * GET /guestbook-entries/list
     * Handler: guestbook-entry.list
     */
    async list() {
        const url = `${this.config.baseURL}/api/guestbook-entries/list`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /guestbook-entries/archive-list
     * Handler: guestbook-entry.archiveList
     */
    async archiveList() {
        const url = `${this.config.baseURL}/api/guestbook-entries/archive-list`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * GET /guestbook-entries/archive/:year/:month
     * Handler: guestbook-entry.archive
     */
    async archive(year, month) {
        const url = `${this.config.baseURL}/api/guestbook-entries/archive/${year}/${month}`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for LunarEvent (collection type) with custom routes
class LunarEventAPI extends CollectionAPI {
    /**
     * GET /lunar-events/with-blogs
     * Handler: lunar-event.findWithBlogs
     */
    async findWithBlogs() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/with-blogs`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for PracticeLog (collection type) with custom routes
class PracticeLogAPI extends CollectionAPI {
    /**
     * GET /practice-logs/my
     * Handler: practice-log.findMyLog
     */
    async findMyLog() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * PUT /practice-logs/my
     * Handler: practice-log.upsertMyLog
     */
    async upsertMyLog(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'PUT',
            body,
        });
        return response.data;
    }
}
// Custom API class for PushSubscription (collection type) with custom routes
class PushSubscriptionAPI extends CollectionAPI {
    /**
     * POST /push-subscriptions/upsert
     * Handler: push-subscription.upsert
     */
    async upsert(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/upsert`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * DELETE /push-subscriptions/by-endpoint
     * Handler: push-subscription.deleteByEndpoint
     */
    async deleteByEndpoint() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/by-endpoint`;
        const response = await this.request(url, { method: 'DELETE' });
        return response.data;
    }
    /**
     * GET /push-subscriptions
     * Handler: push-subscription.find
     */
    async find() {
        const url = `${this.config.baseURL}/api/${this.endpoint}`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * PUT /push-subscriptions/:documentId
     * Handler: push-subscription.update
     */
    async update(documentId, data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/${documentId}`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'PUT',
            body,
        });
        return response.data;
    }
    /**
     * GET /push-subscriptions/stats
     * Handler: push-subscription.stats
     */
    async stats() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/stats`;
        const response = await this.request(url);
        return response.data;
    }
}
// Custom API class for SutraBookmark (collection type) with custom routes
class SutraBookmarkAPI extends CollectionAPI {
    /**
     * GET /sutra-bookmarks/my
     * Handler: sutra-bookmark.listMyBookmarks
     */
    async listMyBookmarks() {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * POST /sutra-bookmarks/my
     * Handler: sutra-bookmark.createMyBookmark
     */
    async createMyBookmark(data) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'POST',
            body,
        });
        return response.data;
    }
    /**
     * DELETE /sutra-bookmarks/my/:documentId
     * Handler: sutra-bookmark.deleteMyBookmark
     */
    async deleteMyBookmark(documentId) {
        const url = `${this.config.baseURL}/api/${this.endpoint}/my/${documentId}`;
        const response = await this.request(url, { method: 'DELETE' });
        return response.data;
    }
}
// Standalone API class for sutra-reading-progress controller
class SutraReadingProgressAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    /**
     * GET /sutra-reading-progresses/my
     * Handler: sutra-reading-progress.findMyProgress
     */
    async findMyProgress() {
        const url = `${this.config.baseURL}/api/sutra-reading-progresses/my`;
        const response = await this.request(url);
        return response.data;
    }
    /**
     * PUT /sutra-reading-progresses/my
     * Handler: sutra-reading-progress.upsertMyProgress
     */
    async upsertMyProgress(data) {
        const url = `${this.config.baseURL}/api/sutra-reading-progresses/my`;
        // If data is FormData, use it directly; otherwise JSON stringify
        const body = data instanceof FormData
            ? data
            : data ? JSON.stringify(data) : undefined;
        const response = await this.request(url, {
            method: 'PUT',
            body,
        });
        return response.data;
    }
}
// Auth API wrapper for users-permissions plugin
class AuthAPI extends BaseAPI {
    constructor(config) {
        super(config);
    }
    /**
     * Login with email/username and password
     * POST /api/auth/local
     */
    async login(credentials) {
        const url = `${this.config.baseURL}/api/auth/local`;
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(credentials),
        }, undefined, 'Strapi Auth');
    }
    /**
     * Register a new user
     * POST /api/auth/local/register
     */
    async register(data) {
        const url = `${this.config.baseURL}/api/auth/local/register`;
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        }, undefined, 'Strapi Auth');
    }
    async me(params, nextOptions) {
        const queryString = params ? this.buildQueryString(params) : '';
        const url = queryString ? `${this.config.baseURL}/api/users/me${queryString}` : `${this.config.baseURL}/api/users/me`;
        const response = await this.request(url, {}, nextOptions, "Strapi Auth");
        return response;
    }
    async updateMe(data, params, nextOptions) {
        const queryString = params ? this.buildQueryString(params) : '';
        const url = queryString ? `${this.config.baseURL}/api/users/me${queryString}` : `${this.config.baseURL}/api/users/me`;
        const response = await this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, nextOptions, "Strapi Auth");
        return response;
    }
    /**
     * OAuth callback
     * GET /api/auth/:provider/callback
     * @param provider - OAuth provider name (google, github, etc.)
     * @param search - Query string (e.g., "access_token=xxx&code=yyy" or "?access_token=xxx")
     */
    async callback(provider, search, nextOptions) {
        let path = `/api/auth/${provider}/callback`;
        if (search) {
            // Add search string, handling both "?key=val" and "key=val" formats
            path += search.startsWith("?") ? search : `?${search}`;
        }
        const url = `${this.config.baseURL}${path}`;
        return this.request(url, {}, nextOptions, "Strapi Auth");
    }
    /**
     * Logout current user (client-side token removal helper)
     */
    async logout() {
        this.config.token = undefined;
    }
    /**
     * Request password reset email
     * POST /api/auth/forgot-password
     */
    async forgotPassword(data) {
        const url = `${this.config.baseURL}/api/auth/forgot-password`;
        await this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        }, undefined, 'Strapi Auth');
        return { ok: true };
    }
    /**
     * Reset password using reset code
     * POST /api/auth/reset-password
     */
    async resetPassword(data) {
        const url = `${this.config.baseURL}/api/auth/reset-password`;
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        }, undefined, 'Strapi Auth');
    }
    /**
     * Change password for authenticated user
     * POST /api/auth/change-password
     */
    async changePassword(data) {
        const url = `${this.config.baseURL}/api/auth/change-password`;
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        }, undefined, 'Strapi Auth');
    }
    /**
     * Confirm user email address
     * GET /api/auth/email-confirmation?confirmation=TOKEN
     */
    async confirmEmail(confirmationToken, nextOptions) {
        const url = `${this.config.baseURL}/api/auth/email-confirmation?confirmation=${confirmationToken}`;
        return this.request(url, {}, nextOptions, 'Strapi Auth');
    }
    /**
     * Send email confirmation
     * POST /api/auth/send-email-confirmation
     */
    async sendEmailConfirmation(email) {
        const url = `${this.config.baseURL}/api/auth/send-email-confirmation`;
        await this.request(url, {
            method: 'POST',
            body: JSON.stringify({ email }),
        }, undefined, 'Strapi Auth');
        return { ok: true };
    }
}
// Main Strapi client
export class StrapiClient {
    config;
    // Auth API for users-permissions plugin
    authentication;
    auditLogs;
    beginnerGuides;
    blogComments;
    blogPosts;
    blogReaderStates;
    blogTags;
    categories;
    chantItems;
    chantPlans;
    chantPreferences;
    chantingSetting;
    communityComments;
    communityPosts;
    contentHistories;
    downloadItems;
    events;
    galleryItems;
    guestbookEntries;
    hubPages;
    lunarEvents;
    lunarEventChantOverrides;
    practiceLogs;
    pushJobs;
    pushSubscriptions;
    requestGuards;
    setting;
    sidebarConfig;
    sutras;
    sutraBookmarks;
    sutraChapters;
    sutraGlossaries;
    sutraReadingProgresses;
    sutraVolumes;
    uiIcons;
    users;
    category;
    guestbookEntry;
    sutraReadingProgress;
    constructor(config) {
        this.config = config;
        // Initialize Auth API
        this.authentication = new AuthAPI(this.config);
        this.auditLogs = new CollectionAPI('audit-logs', this.config);
        this.beginnerGuides = new CollectionAPI('beginner-guides', this.config);
        this.blogComments = new BlogCommentAPI('blog-comments', this.config);
        this.blogPosts = new BlogPostAPI('blog-posts', this.config);
        this.blogReaderStates = new BlogReaderStateAPI('blog-reader-states', this.config);
        this.blogTags = new CollectionAPI('blog-tags', this.config);
        this.categories = new CollectionAPI('categories', this.config);
        this.chantItems = new CollectionAPI('chant-items', this.config);
        this.chantPlans = new ChantPlanAPI('chant-plans', this.config);
        this.chantPreferences = new ChantPreferenceAPI('chant-preferences', this.config);
        this.chantingSetting = new SingleTypeAPI('chanting-setting', this.config);
        this.communityComments = new CommunityCommentAPI('community-comments', this.config);
        this.communityPosts = new CommunityPostAPI('community-posts', this.config);
        this.contentHistories = new CollectionAPI('content-histories', this.config);
        this.downloadItems = new CollectionAPI('download-items', this.config);
        this.events = new CollectionAPI('events', this.config);
        this.galleryItems = new CollectionAPI('gallery-items', this.config);
        this.guestbookEntries = new CollectionAPI('guestbook-entries', this.config);
        this.hubPages = new CollectionAPI('hub-pages', this.config);
        this.lunarEvents = new LunarEventAPI('lunar-events', this.config);
        this.lunarEventChantOverrides = new CollectionAPI('lunar-event-chant-overrides', this.config);
        this.practiceLogs = new PracticeLogAPI('practice-logs', this.config);
        this.pushJobs = new CollectionAPI('push-jobs', this.config);
        this.pushSubscriptions = new PushSubscriptionAPI('push-subscriptions', this.config);
        this.requestGuards = new CollectionAPI('request-guards', this.config);
        this.setting = new SingleTypeAPI('setting', this.config);
        this.sidebarConfig = new SingleTypeAPI('sidebar-config', this.config);
        this.sutras = new CollectionAPI('sutras', this.config);
        this.sutraBookmarks = new SutraBookmarkAPI('sutra-bookmarks', this.config);
        this.sutraChapters = new CollectionAPI('sutra-chapters', this.config);
        this.sutraGlossaries = new CollectionAPI('sutra-glossaries', this.config);
        this.sutraReadingProgresses = new CollectionAPI('sutra-reading-progresses', this.config);
        this.sutraVolumes = new CollectionAPI('sutra-volumes', this.config);
        this.uiIcons = new CollectionAPI('ui-icons', this.config);
        this.users = new CollectionAPI('users-permissions/users', this.config);
        this.category = new CategoryAPI(this.config);
        this.guestbookEntry = new GuestbookEntryAPI(this.config);
        this.sutraReadingProgress = new SutraReadingProgressAPI(this.config);
        // Auto-validate schema in development mode
        if (config.validateSchema) {
            this.validateSchema().then(result => {
                if (!result.valid && result.remoteHash) {
                    console.warn(`[Strapi Types] Schema mismatch detected!`);
                    console.warn(`  Local:  ${result.localHash.slice(0, 8)}...`);
                    console.warn(`  Remote: ${result.remoteHash.slice(0, 8)}...`);
                    console.warn('  Run "npx strapi-types generate" to update types.');
                }
            }).catch(() => {
                // Silently ignore validation errors (e.g., plugin not installed)
            });
        }
    }
    setToken(token) {
        this.config.token = token;
    }
    /**
     * Validate that local types match the remote Strapi schema.
     * Useful for detecting schema drift in development.
     * @returns Promise<{ valid: boolean; localHash: string; remoteHash?: string; error?: string }>
     */
    async validateSchema() {
        try {
            const { SCHEMA_HASH } = await import("./schema-meta.js");
            const response = await fetch(`${this.config.baseURL}/api/strapi-types/schema-hash`);
            if (!response.ok) {
                return {
                    valid: false,
                    localHash: SCHEMA_HASH,
                    error: `Failed to fetch remote schema: ${response.status}`
                };
            }
            const { hash: remoteHash } = await response.json();
            const valid = SCHEMA_HASH === remoteHash;
            if (!valid && this.config.debug) {
                console.warn(`[Strapi Types] Schema mismatch! Local: ${SCHEMA_HASH.slice(0, 8)}... Remote: ${remoteHash.slice(0, 8)}...`);
                console.warn('[Strapi Types] Run "npx strapi-types generate" to update types.');
            }
            return { valid, localHash: SCHEMA_HASH, remoteHash };
        }
        catch (error) {
            return {
                valid: false,
                localHash: 'unknown',
                error: error.message
            };
        }
    }
}
