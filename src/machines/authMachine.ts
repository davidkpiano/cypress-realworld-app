import { Machine, assign, interpret, State } from "xstate";
import { omit } from "lodash/fp";
import { httpClient } from "../utils/asyncUtils";
import { history } from "../utils/historyUtils";
import { User } from "../models";
import { backendPort } from "../utils/portUtils";

export interface AuthMachineSchema {
  states: {
    unauthorized: {};
    signup: {};
    loading: {};
    updating: {};
    logout: {};
    refreshing: {};
    google: {};
    authorized: {};
    auth0: {};
    cognito: {};
    okta: {};
  };
}

export type AuthMachineEvents =
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "UPDATE" }
  | { type: "REFRESH" }
  | { type: "AUTH0" }
  | { type: "COGNITO" }
  | { type: "OKTA" }
  | { type: "GOOGLE" }
  | { type: "SIGNUP" };

export interface AuthMachineContext {
  user?: User;
  message?: string;
}

export const authMachine = Machine<AuthMachineContext, AuthMachineSchema, AuthMachineEvents>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbIED2OAdKjmlqQE74BekAxADIDyA4gJIByAbQAMAXUSgADqVj4yOCSAAeiAGzCAHBQDsARg3aArABoQAT0QBmAJzWKAJgAs1jdfsbV9y48eWAvn6mtNh4RCT45FQ0GJgMzGwAyrzc-ACqAAoi4kgg0rLyiioI9vaG9hSeJuZWtg7Oru6e3r4BQTG4BMTyUcFxLBCs3Jw87ACiWYp5chEKOUW6ho7CFJa6paYWCDZ2Ti5uHl4+-oEgwR1h3dS9jP2sAIKpACoAEsITOVMFc4j22poOqkMlQ2NR29X2TSOrVO7VCXRmPRifTYnAA0o87u8pDJpuRClYFuVHPZ9EYQVtarsGgdmsc2lhzvDIlckTc2ABhHj8XiPThY3I4r6gebCVSqBzWVQGKqbbZ1PaNQ4tE5nOHhSKyKA4VCSVgQchgCj4HAAN1IAGtDarOurKJrtZIEMazUycFl+Z8ZviELpJdoKNZLGTqlsNMtnAqaVCVbCbd17TrWGB6PQGBRJAAbEgAMwYAFsKNaLgiE47naRXe6xJNBV7vj6pY4KIYNIZA8HZWGKBHqZDlfSQnGERnSMgIMaoHqDUbTRarbHi5ER2OJ07Z5WxB7a3j65YDBUFhpW45dGKxdpyapJd3bL2lXSYQy1d1l+OcJPk6n6Oms+hc-QCyLV0KFfVdyw3UQt3yOthSsbwKFFdYQz3cNbwhe9oSA20qEkCBwnfKccENctLULBdgJ1PCCHfNcXVtKtsmxaCd1gn0FgQ-QSmsU8z3PcldFWcptHBRVaUw8jsMo-CPxTNNMxzfMyKfIdmVw6TaIrejN2rD5t1mVj1HJFCb0jPsHyw7p6DAbMrNgTAJw4HhOCeKDcX05QrB8XQKg0Sw2yDGVEAE3RUNMjCY2UxdKCsmy4Hsgj9SImczVIiyERi2z4qgDSINcoUPJ9MpLGbFt-I7RBbCbHt0LEiLByiigMrihzPzk39-0AiTLOszKwPXLTIJ0pi3O9E8TwDRxDEEwLQ1Cu9aoHRlsKgUhSCgDMwEcoYXKGgVmPcopLHsax-T3VQ9Glck9EMeV5ujRbnwRFa1o2wjiNnVKuqe1b1rAHKBrymCCrWdiDBC9sZqvcVqtE+7H3q4Dnt+pNZO-eS-0UtLIiRjb-vkBia3270QfFKbrEQmbjJhqN+3hpaXzW0gMDe5K5yUhHsJHFaMDxmYCd0ond0MbRynUCHySWbzqbM8TIuArmmfQFGvx-BSAPZ+nh0ZnnwIB3bPRYgq92FiaprWSmu2l8KHpUyhrniAYMgAETuR5xn1vTia8G7NBcXxyp9YQBNumq4axu3WQd1gACVRgAMVjhJnkBw35gCigj3O0kZpC4OqVD2nw-Z5EBi4bbHhTg6rBJbyvA0dxzf4oPivz2HC6+yJgmELbnIrj3BdY5pvKlPzxZDa6Q7b8yO4jrBu8S96UvnOXsK73nyH54b8qKLxyZK4RtA0RuQyhky7vblfui75W2rVzrL4RNfdfx7TGL2kb6132vs6My20Kn2WHNugWnQMgHuO034GyrlsUqAYwyOClAHCercabTwfpEEBYCF6s0+ugygmD15ulfoTD+rF3DEgqLYEkl0T7XitgtOmj0MHmlATfNG7VMYzwoAQ5+fNiEC1IQVchxVLBZxoZ2OaBc0FAIRIQNaOA5CkHAX3SBntdwLGKr7DQ-sZrIJEqgwBmtIhyK1IolmJFl4yOMfIxRhDN7v23ogbQQYVh6GEGPTYp96Fhy4SYhR6AlGtXYXfDWTDKB+Nsbwje-Ct5AyKM4rQwgbAU1-pIgB0IcCkAgHARQ4cSGOJ9PYfi5RhClJCnoIMgIgRSkMWExEdA2QQHyXEoKqhiq6AWEHZxqgOm9N0OSVwAZ-6oPsLU22FBSzNNTkFNwVVc5AiQpsQwB8hlhQYUXUC74pnQMsC46wjhtDcV4meC8IZln+lsGsnxeCcJUQnNs706gKgtmPDxXipzNgdJJKs8+0ijHRR6s1LZAiCm6AQVoM6F0A5gtKWfKRYyGo4zAA8+saxJoBl0IcxBM1zk-PhXVf5IFtboBRYPI6dhSnJOBCGL53lLm-IRcBe2-RSXAy8N5DwR0j6LMQPXYq9L8U2wal3VlO8Tx2AWNSpZKyBXpKFcBTBoqfgGGWFonR5JcWyoMQSupESAlKoQNoKUKxDCLGxRqmVwyZYBD8EAA */
    id: "authentication",
    initial: "unauthorized",
    context: {
      user: undefined,
      message: undefined,
    },
    states: {
      unauthorized: {
        entry: "resetUser",
        on: {
          LOGIN: "loading",
          SIGNUP: "signup",
          GOOGLE: "google",
          AUTH0: "auth0",
          OKTA: "okta",
          COGNITO: "cognito",
        },
      },
      signup: {
        invoke: {
          src: "performSignup",
          onDone: { target: "unauthorized", actions: "onSuccess" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      loading: {
        invoke: {
          src: "performLogin",
          onDone: { target: "authorized", actions: "onSuccess" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      updating: {
        invoke: {
          src: "updateProfile",
          onDone: { target: "refreshing" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      refreshing: {
        invoke: {
          src: "getUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      google: {
        invoke: {
          src: "getGoogleUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      logout: {
        invoke: {
          src: "performLogout",
          onDone: { target: "unauthorized" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      authorized: {
        entry: "redirectHomeAfterLogin",
        on: {
          UPDATE: "updating",
          REFRESH: "refreshing",
          LOGOUT: "logout",
        },
      },
      auth0: {
        invoke: {
          src: "getAuth0UserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      okta: {
        invoke: {
          src: "getOktaUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      cognito: {
        invoke: {
          src: "getCognitoUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
    },
  },
  {
    services: {
      performSignup: async (ctx, event) => {
        const payload = omit("type", event);
        const resp = await httpClient.post(`http://localhost:${backendPort}/users`, payload);
        history.push("/signin");
        return resp.data;
      },
      performLogin: async (ctx, event) => {
        return await httpClient
          .post(`http://localhost:${backendPort}/login`, event)
          .then(({ data }) => {
            history.push("/");
            return data;
          })
          .catch((error) => {
            throw new Error("Username or password is invalid");
          });
      },
      getOktaUserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Okta User fields to our User Model
        const user = {
          id: event.user.sub,
          email: event.user.email,
          firstName: event.user.given_name,
          lastName: event.user.family_name,
          username: event.user.preferred_username,
        };

        // Set Access Token in Local Storage for API calls
        localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.token);

        return Promise.resolve({ user });
      },
      getUserProfile: async (ctx, event) => {
        const resp = await httpClient.get(`http://localhost:${backendPort}/checkAuth`);
        return resp.data;
      },
      getGoogleUserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Google User fields to our User Model
        const user = {
          id: event.user.googleId,
          email: event.user.email,
          firstName: event.user.givenName,
          lastName: event.user.familyName,
          avatar: event.user.imageUrl,
        };

        // Set Google Access Token in Local Storage for API calls
        localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.token);

        return Promise.resolve({ user });
      },
      getAuth0UserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Auth0 User fields to our User Model
        const user = {
          id: event.user.sub,
          email: event.user.email,
          firstName: event.user.nickname,
          avatar: event.user.picture,
        };

        // Set Auth0 Access Token in Local Storage for API calls
        localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.token);

        return Promise.resolve({ user });
      },
      updateProfile: async (ctx, event: any) => {
        const payload = omit("type", event);
        const resp = await httpClient.patch(
          `http://localhost:${backendPort}/users/${payload.id}`,
          payload
        );
        return resp.data;
      },
      performLogout: async (ctx, event) => {
        localStorage.removeItem("authState");
        return await httpClient.post(`http://localhost:${backendPort}/logout`);
      },
      getCognitoUserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Cognito User fields to our User Model
        const ourUser = {
          id: event.user.sub,
          email: event.user.email,
        };

        // Set Access Token in Local Storage for API calls
        localStorage.setItem(
          process.env.VITE_AUTH_TOKEN_NAME!,
          event.user.signInUserSession.accessToken.jwtToken
        );

        return Promise.resolve(ourUser);
      },
    },
    actions: {
      redirectHomeAfterLogin: async (ctx, event) => {
        if (history.location.pathname === "/signin") {
          /* istanbul ignore next */
          window.location.pathname = "/";
        }
      },
      resetUser: assign((ctx: any, event: any) => ({
        user: undefined,
      })),
      setUserProfile: assign((ctx: any, event: any) => ({
        user: event.data.user,
      })),
      onSuccess: assign((ctx: any, event: any) => ({
        user: event.data.user,
        message: undefined,
      })),
      onError: assign((ctx: any, event: any) => ({
        message: event.data.message,
      })),
    },
  }
);

// @ts-ignore
const stateDefinition = JSON.parse(localStorage.getItem("authState"));

let resolvedState;
if (stateDefinition) {
  const previousState = State.create(stateDefinition);

  // @ts-ignore
  resolvedState = authMachine.resolveState(previousState);
}

export const authService = interpret(authMachine)
  .onTransition((state) => {
    if (state.changed) {
      localStorage.setItem("authState", JSON.stringify(state));
    }
  })
  .start(resolvedState);
