import { Machine, assign } from "xstate";

export interface SnackbarSchema {
  states: {
    invisible: {};
    visible: {};
  };
}

export type SnackbarEvents = { type: "SHOW" } | { type: "HIDE" };
export enum Severities {
  success = "success",
  info = "info",
  warning = "warning",
  error = "error",
}
export interface SnackbarContext {
  severity?: Severities;
  message?: string;
}

export const snackbarMachine = Machine<SnackbarContext, SnackbarSchema, SnackbarEvents>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SwHYEMDGBrARmgTgHQCWKAbsbMTgDZgDEAygBIDyA6gNoAMAuoqAAOAeyoAXYsJQCQAD0QBmAEwBGQgoAsAdgBsAVh1K9AGhABPREoAc3QiqMBfB6dSZcBQhSq0GzAJIAIgCiPPxIICLiktLh8gjKOoR6VkrcCvYm5ogqAJy2GU4u6Nh4RF7UdPSysGJoYmCEaABm9fgAFArcXQCU9K4lHuU+oTKRxBJSMnFKOVqEWipWWpkWCCpddo6FICjCEHAy-e74o6Lj0VOIALQaVqarV1pW20elJOSUFWCnUZOxiDpuPdEHkXsVjp5Pj4fuc-qA4to9IQjMC1hocoQlnonE4gA */
    id: "snackbar",
    initial: "invisible",
    context: {
      severity: undefined,
      message: undefined,
    },
    states: {
      invisible: {
        entry: "resetSnackbar",
        on: { SHOW: "visible" },
      },
      visible: {
        entry: "setSnackbar",
        on: { HIDE: "invisible" },
        after: {
          // after 3 seconds, transition to invisible
          3000: "invisible",
        },
      },
    },
  },
  {
    actions: {
      setSnackbar: assign((ctx, event: any) => ({
        severity: event.severity,
        message: event.message,
      })),
      resetSnackbar: assign((ctx, event: any) => ({
        severity: undefined,
        message: undefined,
      })),
    },
  }
);
