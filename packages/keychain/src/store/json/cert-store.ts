import { Data } from "@ndn/l3pkt";
import { Name } from "@ndn/name";
import { Decoder, Encoder } from "@ndn/tlv";

import { Certificate } from "../../cert";
import { CertificateStore } from "../internal";
import { JsonStoreBase } from "./internal";

interface Item {
  certBase64: string;
}

export class JsonCertificateStore extends JsonStoreBase<Item> implements CertificateStore {
  public async get(name: Name): Promise<Certificate> {
    const item = await this.getImpl(name);
    const wire = Buffer.from(item.certBase64, "base64") as Uint8Array;
    return new Certificate(new Decoder(wire).decode(Data));
  }

  public async insert(cert: Certificate): Promise<void> {
    const wire = Encoder.encode(cert.data);
    await this.insertImpl(cert.name, {
      certBase64: Buffer.from(wire).toString("base64"),
    });
  }
}
