import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "node:crypto";
import { cognitoClient } from "../config/aws.js";
import { generateDisplayName } from "../utils/displayName.js";
import { generateSyntheticEmail } from "../utils/syntheticEmail.js";

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const TEMP_PASSWORD_LENGTH = 14;
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*";
const MAX_CREATE_ATTEMPTS = 3;

function randomFrom(charset) {
  return charset[crypto.randomInt(charset.length)];
}

function generateTempPassword() {
  const required = [
    randomFrom(UPPER),
    randomFrom(LOWER),
    randomFrom(DIGITS),
    randomFrom(SYMBOLS),
  ];
  const all = UPPER + LOWER + DIGITS + SYMBOLS;
  const rest = Array.from(
    { length: TEMP_PASSWORD_LENGTH - required.length },
    () => randomFrom(all),
  );
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export async function deleteCognitoUser(syntheticEmail) {
  try {
    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: syntheticEmail,
      }),
    );
  } catch {}
}

export async function signup(role) {
  let created;

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const syntheticEmail = generateSyntheticEmail(role);
    const displayName = generateDisplayName();
    const password = generateTempPassword();

    try {
      const result = await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: syntheticEmail,
          UserAttributes: [
            { Name: "email", Value: syntheticEmail },
            { Name: "email_verified", Value: "true" },
            { Name: "name", Value: displayName },
          ],
          MessageAction: "SUPPRESS",
        }),
      );

      const attributes = Object.fromEntries(
        (result.User?.Attributes || []).map((attr) => [attr.Name, attr.Value]),
      );

      created = {
        syntheticEmail,
        displayName,
        password,
        cognitoUid: attributes.sub,
      };
      break;
    } catch (err) {
      if (err instanceof UsernameExistsException) continue;
      throw err;
    }
  }

  if (!created) {
    throw new Error(
      "Could not generate a unique synthetic email after several attempts",
    );
  }

  try {
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: created.syntheticEmail,
        Password: created.password,
        Permanent: true,
      }),
    );
  } catch (err) {
    await deleteCognitoUser(created.syntheticEmail);
    throw err;
  }

  return created;
}
