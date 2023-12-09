import { Machine, assign } from "xstate";

interface FilterSchema {
  states: {
    dateRange: {
      states: {
        none: {};
        filter: {};
      };
    };
    amountRange: {
      states: {
        none: {};
        filter: {};
      };
    };
  };
}

type DateFilterEvent = {
  type: "DATE_FILTER";
  dateRangeStart: string;
  dateRangeEnd: string;
};
type AmountFilterEvent = {
  type: "AMOUNT_FILTER";
  amountMin: string;
  amountMax: string;
};
type DateResetEvent = { type: "DATE_RESET" };
type AmountResetEvent = { type: "AMOUNT_RESET" };
type FilterEvents =
  | { type: "NONE" }
  | DateFilterEvent
  | AmountFilterEvent
  | DateResetEvent
  | AmountResetEvent;

export interface FilterContext {}

export const transactionFiltersMachine = Machine<FilterContext, FilterSchema, FilterEvents>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDMCWAbALmATrAdBAIbYBKRAdjPhQPYVgDEAIgIIAqAogPoBiAkgBkupANoAGALqJQAB1qxUmVPRkgAHogAsADgDM+AIwAmQ+ICcegOwBWADQgAnomPnx+AGxfvP73oC+-g5oWLgExGSU1CHYOCwcPKScAMqc7BLSSCDyisqqWZoIugYephbW9k4u4u6+dd6BwRixBEQAtrQArhSY5FRgNPRMrACyAPIAqgBy7HxCIhlqOUoqFGqF1sb4OjrGOiaVzgge4jpG9b6NIDFh+O1dPX3RzbiMo5Mz3Emp6VJLCit8qANlYDHpdvtjIdEDZDGdDBcfFcbng7h1ur0ogMUW9xtNZgJhJwxH8sss8msCohdltjOI9AcHEcbFYtJ5EQ0rnQIHA1Cj4GSART1ogTEztPgalKrIZzKzjB4tDYPMiXqiImAnmB-rlViKEHCznoalZIdCEPpJVLxCyTKdjHotKrQuqSJqsYMGDrAZTgS49B58MbxKbGVUDTp3DZnS1CG6tfgUd7hVTjjY2dYzJZbOKI1GY7d7hitcm9amTrmtHT2R4rDa9DZzOnTiqgtc1a10Y8PXQvYLdUCNKLTrn01ZtnpJ1Pp5OC6ii93+om1aXB4VlWcc+GxxOZ3vAoEgA */
    id: "filters",
    type: "parallel",
    context: {},
    states: {
      dateRange: {
        initial: "none",
        states: {
          none: {
            entry: "resetDateRange",
            on: {
              DATE_FILTER: "filter",
            },
          },
          filter: {
            entry: "setDateRange",
            on: {
              DATE_RESET: "none",
            },
          },
        },
      },
      amountRange: {
        initial: "none",
        states: {
          none: {
            entry: "resetAmountRange",
            on: {
              AMOUNT_FILTER: "filter",
            },
          },
          filter: {
            entry: "setAmountRange",
            on: {
              AMOUNT_RESET: "none",
              AMOUNT_FILTER: "filter",
            },
          },
        },
      },
    },
  },
  {
    actions: {
      setDateRange: assign((ctx: FilterContext, event: any) => ({
        dateRangeStart: event.dateRangeStart,
        dateRangeEnd: event.dateRangeEnd,
      })),
      resetDateRange: assign((ctx: FilterContext, event: any) => ({
        dateRangeStart: undefined,
        dateRangeEnd: undefined,
      })),
      setAmountRange: assign((ctx: FilterContext, event: any) => ({
        amountMin: event.amountMin,
        amountMax: event.amountMax,
      })),
      resetAmountRange: assign((ctx: FilterContext, event: any) => ({
        amountMin: undefined,
        amountMax: undefined,
      })),
    },
  }
);
