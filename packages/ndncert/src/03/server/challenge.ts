import type { ChallengeRequest } from "../packet/mod";

/** Server side of a challenge. */
export interface ServerChallenge {
  /** Challenge module identifier. */
  readonly challengeId: string;

  /** Time limit (millis). */
  readonly timeLimit: number;

  /** Retry limit; the initial attempt does not count. */
  readonly retryLimit: number;

  /** Process selection or continuation of the challenge. */
  process: (request: ChallengeRequest, context: ServerChallengeContext) => Promise<ServerChallengeResponse>;
}

export interface ServerChallengeContext {
  /** Server-side state of the challenge on a request session. */
  challengeState?: unknown;
}

export interface ServerChallengeResponse {
  /** If true, challenge has succeeded and server will issue the certificate. */
  success: boolean;

  /** If true, this request counts as one failed retry. */
  decrementRetry: boolean;

  /** ChallengeStatus to convey to the client. */
  challengeStatus: string;
}
