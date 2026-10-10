export const authMessages = {
  loggedOut: {
    title: "Logged out",
    description: "You have been logged out safely.",
  },
  sessionExpired: {
    title: "Session expired",
    description: "Please log in again to continue.",
  },
  loginRequired: {
    title: "Login required",
    description: "Please log in to continue.",
  },
  roleRedirected: {
    title: "Redirected",
    description: "You were taken to your own dashboard area.",
  },
  welcomeBack: (name: string) => ({
    title: `Welcome back, ${name}`,
    description: "You have successfully logged in.",
  }),
  accountCreated: (name: string) => ({
    title: "Account created",
    description: `Welcome, ${name}!`,
  }),
  passwordChanged: {
    title: "Password updated",
    description: "Please log in with your new password.",
  },
  serverWaking: {
    title: "Waking up the server",
    description: "The first request can take up to a minute. Please wait...",
  },
  serverUnreachable: {
    title: "Server unreachable",
    description: "We could not reach the server. Please try again.",
  },
} as const;
