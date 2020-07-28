import "@ndn/packet/test-fixture/expect";

import { Name, SigType } from "@ndn/packet";
import * as TestSignVerify from "@ndn/packet/test-fixture/sign-verify";

import { Certificate, KeyChain, PublicKey, RsaModulusLength, RsaPrivateKey, RsaPublicKey } from "../..";

interface Row extends TestSignVerify.Row {
  modulusLength: RsaModulusLength;
}

const TABLE = TestSignVerify.TABLE.flatMap((row) =>
  RsaModulusLength.Choices.map((modulusLength) => ({ ...row, modulusLength })),
) as Row[];

test.each(TABLE)("sign-verify %p", async ({ cls, modulusLength }) => {
  const [pvtA, pubA] = await RsaPrivateKey.generate("/RSAKEY-A/KEY/x", modulusLength);
  expect(PublicKey.isExportable(pubA)).toBeTruthy();
  const [pvtB, pubB] = await RsaPrivateKey.generate("/RSAKEY-B/KEY/x", modulusLength);

  expect(pvtA.name).toEqualName("/RSAKEY-A/KEY/x");
  expect(pubA.name).toEqualName("/RSAKEY-A/KEY/x");
  expect(pvtB.name).toEqualName("/RSAKEY-B/KEY/x");
  expect(pubB.name).toEqualName("/RSAKEY-B/KEY/x");

  const record = await TestSignVerify.execute(cls, pvtA, pubA, pvtB, pubB);
  TestSignVerify.check(record, { deterministic: true });
  expect(record.sA0.sigInfo.type).toBe(SigType.Sha256WithRsa);
  expect(record.sA0.sigInfo.keyLocator?.name).toEqualName(pvtA.name);
});

test.each(RsaModulusLength.Choices)("load %p", async (modulusLength) => {
  const keyChain = KeyChain.createTemp();
  const name = new Name("/RSAKEY/KEY/x");
  await RsaPrivateKey.generate(name, modulusLength, keyChain);

  const [pvt, pub] = await keyChain.getKeyPair(name);
  expect(pvt).toBeInstanceOf(RsaPrivateKey);

  const cert = await Certificate.selfSign({ privateKey: pvt, publicKey: pub });
  const pub2 = await cert.loadPublicKey();
  expect(pub2).toBeInstanceOf(RsaPublicKey);
  expect(pub2.name).toEqualName(pvt.name);
});
