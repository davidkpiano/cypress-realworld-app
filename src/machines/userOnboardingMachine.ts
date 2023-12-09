import { Machine } from "xstate";

export interface UserOnboardingMachineSchema {
  states: {
    idle: {};
    stepOne: {};
    stepTwo: {};
    stepThree: {};
    done: {};
  };
}

export type UserOnboardingMachineEvents = { type: "PREV" } | { type: "NEXT" };

export interface UserOnboardingMachineContext {}

export const userOnboardingMachine = Machine<
  UserOnboardingMachineContext,
  UserOnboardingMachineSchema,
  UserOnboardingMachineEvents
>({
  /** @xstate-layout N4IgpgJg5mDOIC5QFdZgE4HkB2AjA9gIboQCW2UAdLAC5gAOOYAxAHICiAGgCoDaADAF1EoevlikapfNhEgAHogDM-AOyUAbAA5VAVgA0IAJ6IAjFtOVdAX2uHUGHAWJkK1OvW4B3fMwAKAErsAGoCwkggYhJSMnKKCOYALJRKAEz8SqapBsZmFla29mhYeEQk5FS0DN6+HDxhclGS0rIR8Srq2nqGJghKGkqFIA4lzuVuVZ4AFuhgLIEhDRFNMa2g8Ukp6ZnZPcoDQyNOZa6VHtwzc2xcfEKN4s2xbYjplmmmGqaJulpKf3+mPYIXSJZI2IbYfAQOByI6lFwVe7RFpxMypIGmSwAThxONU-H42l+WkSqUOxWOCImHiYSMeawUiFUSkoWMSX0Ju1yCCx-HJjnh4zO1R8dNWqISvMo-C+aVSWI+GiVGixQNSqks4KKArGp3c1UuYDFKOeCS0GmliQsqnxv3+mSB30GdmGFMFeogMiNywe4tN5gtSixP3tocB3IGYNstiAA */
  id: "userOnboarding",
  initial: "stepOne",
  states: {
    stepOne: {
      on: {
        NEXT: "stepTwo",
      },
    },

    stepTwo: {
      on: {
        PREV: "stepOne",
        NEXT: "stepThree",
      },
    },

    stepThree: {
      on: {
        PREV: "stepTwo",
        NEXT: "done",
      },
    },

    done: {
      type: "final",
    }
  },
});
