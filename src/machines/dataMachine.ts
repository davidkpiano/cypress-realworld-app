import { Machine, assign } from "xstate";
import { concat } from "lodash/fp";

export interface DataSchema {
  states: {
    idle: {};
    loading: {};
    updating: {};
    creating: {};
    deleting: {};
    success: {
      states: {
        unknown: {};
        withData: {};
        withoutData: {};
      };
    };
    failure: {};
  };
}

type SuccessEvent = { type: "SUCCESS"; results: any[]; pageData: object };
type FailureEvent = { type: "FAILURE"; message: string };
export type DataEvents =
  | { type: "FETCH" }
  | { type: "UPDATE" }
  | { type: "CREATE" }
  | { type: "DELETE" }
  | SuccessEvent
  | FailureEvent;

export interface DataContext {
  pageData?: object;
  results?: any[];
  message?: string;
}

export const dataMachine = (machineId: string) =>
  Machine<DataContext, DataSchema, DataEvents>(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QQIYBcUFkUGMAWAlgHZgAEAFALa6EkCUAdARADZgDEAYgKIAqAwgAkA2gAYAuolAAHAPawCaArKJSQAD0QAmLQHYGANgCcARgAsog1oCsAGhABPbboDMDUR48AOF6N1HdVzMAX2D7VAxsfGIyKhoYxmY2dn4AJW4AQV5uMUkkEDkFJRU1TQQTQLN3Y1ETUTMTAyaDXXsnBD03T29ff0CXELCQCKx4kgpqaPomVg4AVQAFABEsnIk1QsVlVXyyxr8GPSMjM39G5tbHZy7unz8AoNDw9FGp2MnaMETZ9iXuABk+Gs8jJ5FsSrtEAZRG1ru5br0HgMnsMXlFPhMxl8GCxZCgIMQoOwICowEwiAA3WQAazJI3RMUxb0YuPxhIQxCpOHQ21yuQ2YOKO1AZV0XlEDB8ZgMLmsDWaLVhCGsRi0DGsCPulRR9KxTM+LLxBKIRLAACczbIzQxpCx0AAzK2UBi6t76hI4o3szmyblCvnrfKbIWlRDWLReQwuIwuHSmBWXdrWXQmdWavq6QbPSJ6uLMhgAV2kEUJxNJ5KptJdaNzHw9RZLJo5lN9PJUAZBBUF21D5VEAwYLgM1i8Xjl5yaibDqrTnjuGazqJzbrzBsLxZ5JvY5st1ttDqd1eXGNX9Y3SibPr9vIk-KD3YhIsQdVl7hcLjH8oTStH+g1c8RbUhldE862mHAzTATciRJEgKxpOkaxXMDsQgqCLygZsuTbIgOwFIoe0hcotGOBgzHI2p6gnRUrmVGd-x6LVMx1JDQKxRg0Og7cLStG07TQR0zWdEDGVPcDIOgrDW39W9A1BAjHw0Z8DBMNU5ROM4FRo9pf1nRiFxY49RJQxgIDANgMLLOCfSrETxjE7EzIs70W2vdtZM7YNCKfDoDEjcwU1lL9JyVFU1PTB5Fzs952JdcywEsndeP3ATD2i91pichKXOwmTxDveTwWFJTyhaQ4ghcXQ7Fo3SGNEedIsM142PzWACxwHA4FgQsiGpIhZAAdyIdgUBYAaUAcWACq7BTir2EwjEjZM-Ljaip3KFwTGseEPBMLa9ssawmoZeyTIYNqOq6nq+sG4bRvGybhBMTyHzm58BjUswNPjb9aPMURtqq3b9rqYdjtrWKLs62BYC4PghGmrzFL2axoTIrQAd0Ei1tCowJRsACmKi1jjMh9rodhtJMmyRHXt7EwvCxhgFso4KQtovGDEOBiGqA7NmtJ1rya69hFhWGm5Jmor6ZIyNAmhNn2faTnucJgzgJJ06ycumHfgBIFadm3szC0LmTaMPyqqVFWCf0xqNaMrX83tFACBYAtILhgQRElpG3vKLbmfI6xNpsXH8Z5wDmJRfqzPgfJ0ocuh8OlojVKVPaGGObPGlVUQdAMU5weQ2KkjAFOQyImcVMLyww7+rxUzq3nHgdgWnbXVljSgCvvJKva5eTRv6-aIcbjVpFicdmL8wbaDe+R59+0jGNZRjK3aOMIwdrtvml3bme104jCF-9xpA60y-tKhUjunqqOp4PjLHPik-7yNtPdAlXxFqMEd3wAZtJUW8d73yJsXFqa4oZdVPvTcw-kAg-S0utOoWgqjZ2OC0C2pgbAQMFlA4WMNrr9SGrAtOWgGaGD0Arai19iJaDcAxPa1gDpgzbidQ+HpoFEIGooPASwXhkJ8ntC2zNEG0KVs+Cw21ujMNYUddhEMhY626rwtAeBZAFjQAIjAQj+6yn0LGFa2NfrtHMKIphINDp4I7h6F2bsPbl3fqnHyco1QqXEZfFB+cZERSAqEIAA */
      id: machineId,
      initial: "idle",
      context: {
        pageData: {},
        results: [],
        message: undefined,
      },
      states: {
        idle: {
          on: {
            FETCH: "loading",
            CREATE: "creating",
            UPDATE: "updating",
            DELETE: "deleting",
          },
        },
        loading: {
          invoke: {
            src: "fetchData",
            onDone: { target: "success" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        updating: {
          invoke: {
            src: "updateData",
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        creating: {
          invoke: {
            src: "createData",
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        deleting: {
          invoke: {
            src: "deleteData",
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        success: {
          entry: ["setResults", "setPageData"],
          on: {
            FETCH: "loading",
            CREATE: "creating",
            UPDATE: "updating",
            DELETE: "deleting",
          },
          initial: "unknown",
          states: {
            unknown: {
              on: {
                "": [{ target: "withData", cond: "hasData" }, { target: "withoutData" }],
              },
            },
            withData: {},
            withoutData: {},
          },
        },
        failure: {
          entry: ["setMessage"],
          on: {
            FETCH: "loading",
          },
        },
      },
    },
    {
      actions: {
        setResults: assign((ctx: DataContext, event: any) => ({
          results:
            event.data && event.data.pageData && event.data.pageData.page > 1
              ? concat(ctx.results, event.data.results)
              : event.data.results,
        })),
        setPageData: assign((ctx: DataContext, event: any) => ({
          pageData: event.data.pageData,
        })),

        setMessage: /* istanbul ignore next */ assign((ctx, event: any) => ({
          message: event.message,
        })),
      },
      guards: {
        hasData: (ctx: DataContext, event) => !!ctx.results && ctx.results.length > 0,
      },
    }
  );
