import posthog, { isPostHogInitialized } from './posthog';

const posthogLogger = {
  info(message, attributes) {
    if (isPostHogInitialized) {
      posthog.logger.info(message, attributes);
    }
  }
};

export default posthogLogger;
