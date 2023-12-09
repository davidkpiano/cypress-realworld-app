import { omit } from "lodash/fp";
import { Machine, assign } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { User, TransactionCreatePayload } from "../models";
import { authService } from "./authMachine";
import { backendPort } from "../utils/portUtils";

export interface CreateTransactionMachineSchema {
  states: {
    stepOne: {};
    stepTwo: {};
    stepThree: {};
  };
}

const transactionDataMachine = dataMachine("transactionData").withConfig({
  services: {
    createData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.post(`http://localhost:${backendPort}/transactions`, payload);
      authService.send("REFRESH");
      return resp.data;
    },
  },
});

export type CreateTransactionMachineEvents =
  | { type: "SET_USERS" }
  | { type: "CREATE" }
  | { type: "RESET" };

export interface CreateTransactionMachineContext {
  sender: User;
  receiver: User;
  transactionDetails: TransactionCreatePayload;
}

export const createTransactionMachine = Machine<
  CreateTransactionMachineContext,
  CreateTransactionMachineSchema,
  CreateTransactionMachineEvents
>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QGMBOYCGAXMAVVGAdrBslgJYD2hAdLDgA4DyhYAxAMoCiuA+gKrcAShwDaABgC6iUA0qxyFajJAAPRACYAzAEYaAFgCsujYYA0IAJ6aAbOJqHxTnRrtatATi0aAvj4tomDj4RCRkVLT0YAy4AO6UbADCQlwAgrhcEtJIIHIKSoQq6gga+ho03gAcLuZWiIYaek7OruLuXr7+IIHYeATEpAV0jLgAFujsKdy4WSp5ihFFiHYW1iV2Ds0ubp7efl2ElBBwKj3B-WEFc-ILyjnFLquIOnoebx6VAOyeNnY2nx8-AF0L0QgNwtRhtEWGBrvlFvdnjZKjQbDpKvpKh5DJV3HidE8EB57M1xNs2rtOsCgn1QoMIlCYvE4bdCoiEC89KZPOIbKZCVpHJsWjsOkDuiDznSIZERuMwLCcvMruydFp9DQMZ8bIY+bU1mimltWu09vsgA */
    id: "createTransaction",
    initial: "stepOne",
    states: {
      stepOne: {
        entry: "clearContext",
        on: {
          SET_USERS: "stepTwo",
        },
      },
      stepTwo: {
        entry: "setSenderAndReceiver",
        invoke: {
          id: "transactionDataMachine",
          src: transactionDataMachine,
          autoForward: true,
        },
        on: {
          CREATE: "stepThree",
        },
      },
      stepThree: {
        entry: "setTransactionDetails",
        on: {
          RESET: "stepOne",
        },
      },
    },
  },
  {
    actions: {
      setSenderAndReceiver: assign((ctx, event: any) => ({
        sender: event.sender,
        receiver: event.receiver,
      })),
      setTransactionDetails: assign((ctx, event: any) => ({
        transactionDetails: event,
      })),
      clearContext: assign((ctx, event: any) => ({})),
    },
  }
);
