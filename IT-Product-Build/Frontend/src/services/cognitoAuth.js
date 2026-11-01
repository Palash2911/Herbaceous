import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { getMe } from "./authService";

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

let userPool;

function getUserPool() {
  if (!poolData.UserPoolId || !poolData.ClientId) {
    throw new Error(
      "Cognito is not configured. Add VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID to Frontend/.env.local.",
    );
  }

  if (!userPool) {
    userPool = new CognitoUserPool(poolData);
  }

  return userPool;
}

export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        const err = new Error("A new password is required.");
        err.code = "NewPasswordRequiredException";
        err.cognitoUser = user;
        reject(err);
      },
    });
  });
}

export function completeNewPassword(cognitoUser, newPassword) {
  return new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(
      newPassword,
      {},
      {
        onSuccess: (session) => resolve(session),
        onFailure: (err) => reject(err),
      },
    );
  });
}

export function getCurrentUser() {
  return getUserPool().getCurrentUser();
}

export function signOut() {
  try {
    const user = getCurrentUser();
    if (user) user.signOut();
  } catch {
    // Without Cognito configuration, there is no session to end.
  }
}

export function getCurrentSession() {
  return new Promise((resolve, reject) => {
    let user;

    try {
      user = getCurrentUser();
    } catch {
      resolve(null);
      return;
    }

    if (!user) {
      resolve(null);
      return;
    }

    user.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(session && session.isValid() ? session : null);
    });
  });
}

export function changePassword(oldPassword, newPassword) {
  return new Promise((resolve, reject) => {
    const user = getCurrentUser();
    if (!user) {
      reject(new Error("No active session. Please log in again."));
      return;
    }

    user.getSession((sessionErr) => {
      if (sessionErr) {
        reject(sessionErr);
        return;
      }

      user.changePassword(oldPassword, newPassword, (err, result) =>
        err ? reject(err) : resolve(result),
      );
    });
  });
}

export async function getVerifiedSession() {
  const session = await getCurrentSession();

  if (!session) return null;

  try {
    await getMe();
    return session;
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  const session = await getCurrentSession();
  return session ? session.getAccessToken().getJwtToken() : null;
}
