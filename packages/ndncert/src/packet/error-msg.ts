import { Data, type Interest, type Signer } from "@ndn/packet";
import { Decoder, Encoder, EvDecoder, NNI } from "@ndn/tlv";
import { toUtf8 } from "@ndn/util";

import { ErrorCode, TT } from "./an";

/** ErrorMessage packet. */
export interface ErrorMsg {
  errorCode: number;
  errorInfo: string;
}

const EVD = new EvDecoder<ErrorMsg>("ErrorMsg")
  .add(TT.ErrorCode, (t, { nni }) => t.errorCode = nni, { required: true })
  .add(TT.ErrorInfo, (t, { text }) => t.errorInfo = text, { required: true });

export namespace ErrorMsg {
  /** Create error message packet. */
  export async function makeData(errorCode: ErrorCode, { name }: Interest, signer: Signer) {
    const errorInfo = ErrorCode[errorCode]!;
    const payload = Encoder.encode([
      [TT.ErrorCode, NNI(errorCode)],
      [TT.ErrorInfo, toUtf8(errorInfo)],
    ]);

    const data = new Data();
    data.name = name;
    data.freshnessPeriod = 1;
    data.content = payload;
    await signer.sign(data);
    return data;
  }

  /** Parse error message packet. */
  export function fromData({ content }: Data): ErrorMsg {
    return EVD.decodeValue({} as ErrorMsg, new Decoder(content));
  }

  /** Throw an exception if the given packet is an error message packet. */
  export function throwOnError(data: Data): void {
    let e: ErrorMsg | undefined;
    try { e = fromData(data); } catch { return; }
    throw new Error(`CA response error ${e.errorCode}: ${e.errorInfo}`);
  }
}
