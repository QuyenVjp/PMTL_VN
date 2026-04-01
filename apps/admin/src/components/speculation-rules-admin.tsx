import { useEffect } from "react";

/**
 * Speculation Rules API for Admin Panel
 * 
 * Progressive enhancement: gracefully degrades if browser doesn't support
 * Eagerness: "conservative" (admin workflows are less time-sensitive than member UX)
 * 
 * Prerender: Dashboard, moderation queue, stats
 * Prefetch: Users, content management, settings
 * 
 * @see https://developer.chrome.com/docs/web-platform/prerender-pages
 */
export function SpeculationRulesAdmin() {
  useEffect(() => {
    // Progressive enhancement check
    if (!("speculationrules" in HTMLScriptElement.prototype)) {
      console.log("[SpeculationRulesAdmin] Not supported in this browser");
      return;
    }

    const rules = {
      prerender: [
        {
          // Critical admin pages: dashboard, moderation queue
          where: {
            and: [
              { href_matches: "/*" },
              {
                or: [
                  { href_matches: "/dashboard" },
                  { href_matches: "/moderation-queue" },
                  { href_matches: "/stats" },
                ],
              },
            ],
          },
          eagerness: "conservative", // Admin workflows: wait for explicit hover
        },
      ],
      prefetch: [
        {
          // Secondary admin pages: users, content, settings
          where: {
            and: [
              { href_matches: "/*" },
              {
                or: [
                  { href_matches: "/users" },
                  { href_matches: "/content/*" },
                  { href_matches: "/noi-dung/*" },
                  { href_matches: "/settings" },
                  { href_matches: "/media" },
                ],
              },
            ],
          },
          eagerness: "conservative", // Prefetch only on hover intent
        },
      ],
    };

    const script = document.createElement("script");
    script.type = "speculationrules";
    script.textContent = JSON.stringify(rules);
    document.head.appendChild(script);

    console.log("[SpeculationRulesAdmin] Injected for admin panel");

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // No UI rendering
}
