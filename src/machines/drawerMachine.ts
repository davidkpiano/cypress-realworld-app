import { Machine } from "xstate";

export const drawerMachine = Machine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMDuYUDoJwGsAXAewAccBjAGxNkgGIAVAeQHE2AZAUQH0ARbgGUA0qwAKAbQAMAXUSgydAJZFlJAHYKQAD0QBmAEz6cATgCs+gIyHzAGhABPRIYDs0nOYC+Xh6kzYeISkFDR0jCzi3AByAsJikTLySCBKsKrqWil6CLaGOPrmpvqu9k4GAGwe3r4g-li4+LDE5DjkYBrM7Fx8gqISSdppGZraOUYmFta2Ds4IACzm1T5+6A1BzSFtZB0MAMKcLEK98QNyQypqo9kGhgAcZnfS8xV3pbOIVk+eK3VrgQBbEgAI2U1DAVFo9AgXQ4PF4AFkWAAhACSPEGKWGVyyoHG9xwhis8zu8xKZTmrlev3qgJBYIhYWhDEiMURKPR3ExikumTGBn0FU8FQq82kFRm5QQd3Mdxp-1wQNB4O2u1YcL4SLRGPOWN51zxtweRJJZPeUtMJPlAUV9JV7U6ByOmo5OuSPPSOP5CH0vsJ8yJbwpiAqrjlvw0JCa2lpKAunr5NwQAFpTBUPimrFSfrVYxsWmR4yNcbpEMmSRnU64c6sbfmtkzIEWvUmquYcFZzBLg7lXJNresmgXVSXsYnDQgrPp5gUbD2rKZ8oYB4Eh1sABbKWBEZvj0uT6R3DP3EyuFe25VgXcG-flo9Sqs1v51pUMyHhCDXks5BcPVzE0lyQzV5TBwM9cwVHBX3tHZR31b9EHMWwcDuS1LDnDNXH-HB5h8HwgA */
    id: "drawer",
    type: "parallel",
    states: {
      desktop: {
        initial: "open",
        states: {
          closed: {
            on: {
              TOGGLE_DESKTOP: "open",
              OPEN_DESKTOP: { target: "open", cond: "shouldOpenDesktop" },
            },
          },
          open: {
            on: { TOGGLE_DESKTOP: "closed", CLOSE_DESKTOP: "closed" },
          },
          hist: {
            type: "history",
          },
        },
      },
      mobile: {
        initial: "closed",
        states: {
          closed: {
            on: { TOGGLE_MOBILE: "open", OPEN_MOBILE: "open" },
          },
          open: {
            on: { TOGGLE_MOBILE: "closed", CLOSE_MOBILE: "closed" },
          },
        },
      },
    },
  },
  {
    guards: {
      shouldOpenDesktop: (context, event, guardMeta) => {
        return (
          guardMeta.state.history?.context.aboveSmallBreakpoint !== context.aboveSmallBreakpoint
        );
      },
    },
  }
);
