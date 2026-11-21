import posthog from 'posthog-js';

const posthogKey = process.env.REACT_APP_POSTHOG_KEY;
const posthogHost = process.env.REACT_APP_POSTHOG_HOST;
export const isPostHogInitialized = Boolean(posthogKey && posthogHost);

if (isPostHogInitialized) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-08-30',
    logs: {
      serviceName: 'autobath-frontend',
      environment: process.env.NODE_ENV,
    },
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
  });
} else if (process.env.NODE_ENV !== 'production') {
  if (!posthogKey) {
    console.error(new Error('REACT_APP_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once REACT_APP_POSTHOG_KEY is configured'));
  }

  if (!posthogHost) {
    console.error(new Error('REACT_APP_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once REACT_APP_POSTHOG_HOST is configured'));
  }
}

export default posthog;
