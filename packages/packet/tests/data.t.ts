import { Decoder, Encoder } from "@ndn/tlv";
import { createHash } from "crypto";

import { Component, ImplicitDigest, Name } from "..";
import { Data, TT } from "..";
import "../test-fixture/expect";

test("encode", () => {
  expect(() => new Data({} as any)).toThrow();
  let data = new Data();
  expect(() => { data.isFinalBlock = true; }).toThrow();

  data = new Data("/A");
  expect(data.name).toEqualName("/A");
  expect(data.contentType).toBe(0);
  expect(data.freshnessPeriod).toBe(0);
  expect(data.finalBlockId).toBeUndefined();
  expect(data.isFinalBlock).toBeFalsy();
  expect(data.content).toHaveLength(0);
  expect(data).toEncodeAs(({ type, value }) => {
    expect(type).toBe(TT.Data);
    expect(value).toMatchTlv(
      ({ decoder }) => { expect(decoder.decode(Name)).toEqualName("/A"); },
      ({ type }) => { expect(type).toBe(TT.DSigInfo); },
      ({ type }) => { expect(type).toBe(TT.DSigValue); },
    );
  });

  data = new Data("/B", Data.ContentType(3), Data.FreshnessPeriod(2500),
    Data.FinalBlock, Uint8Array.of(0xC0, 0xC1));
  expect(data.name).toEqualName("/B");
  expect(data.contentType).toBe(3);
  expect(data.freshnessPeriod).toBe(2500);
  expect(data.finalBlockId).not.toBeUndefined();
  expect(data.finalBlockId).toEqualComponent("B");
  expect(data.isFinalBlock).toBeTruthy();
  expect(data.content).toHaveLength(2);
  expect(data.content).toEqualUint8Array([0xC0, 0xC1]);
  expect(data).toEncodeAs(({ type, value }) => {
    expect(type).toBe(TT.Data);
    expect(value).toMatchTlv(
      ({ decoder }) => { expect(decoder.decode(Name)).toEqualName("/B"); },
      ({ type, value }) => {
        expect(type).toBe(TT.MetaInfo);
        expect(value).toMatchTlv(
          ({ type, nni }) => {
            expect(type).toBe(TT.ContentType);
            expect(nni).toBe(0x03);
          },
          ({ type, nni }) => {
            expect(type).toBe(TT.FreshnessPeriod);
            expect(nni).toBe(2500);
          },
          ({ type, vd }) => {
            expect(type).toBe(TT.FinalBlockId);
            expect(vd.decode(Component)).toEqualComponent("B");
          },
        );
      },
      ({ type, length }) => {
        expect(type).toBe(TT.Content);
        expect(length).toBe(2);
      },
      ({ type }) => { expect(type).toBe(TT.DSigInfo); },
      ({ type }) => { expect(type).toBe(TT.DSigValue); },
    );
  });

  data.name = new Name("/C");
  expect(() => { data.contentType = -1; }).toThrow();
  data.contentType = 0;
  expect(() => { data.freshnessPeriod = -1; }).toThrow();
  data.freshnessPeriod = 0;
  data.isFinalBlock = false;
  data.content = Uint8Array.of(0xC2, 0xC3);
  data = new Data(data);
  expect(data).toEncodeAs(({ type, value }) => {
    expect(type).toBe(TT.Data);
    expect(value).toMatchTlv(
      ({ decoder }) => { expect(decoder.decode(Name)).toEqualName("/C"); },
      ({ value }) => { expect(value).toEqualUint8Array([0xC2, 0xC3]); },
      ({ type }) => { expect(type).toBe(TT.DSigInfo); },
      ({ type }) => { expect(type).toBe(TT.DSigValue); },
    );
  });
});

test("decode", () => {
  let decoder = new Decoder(Uint8Array.of(
    0x06, 0x05,
    0x07, 0x03, 0x08, 0x01, 0x41,
  ));
  let data = decoder.decode(Data);
  expect(data.name).toEqualName("/A");
  expect(data.content).toHaveLength(0);

  decoder = new Decoder(Uint8Array.of(
    0x06, 0x1E,
    // Name
    0x07, 0x06, 0x08, 0x01, 0x42, 0x08, 0x01, 0x30,
    // MetaInfo
    0x14, 0x0C,
    // MetaInfo.ContentType
    0x18, 0x01, 0x03,
    // MetaInfo.FreshnessPeriod
    0x19, 0x02, 0x01, 0x04,
    // MetaInfo.FinalBlockId
    0x1A, 0x03, 0x08, 0x01, 0x31,
    // Content
    0x15, 0x02, 0xC0, 0xC1,
    // DSigInfo
    0x16, 0x00,
    // DSigValue
    0x17, 0x00,
  ));
  data = decoder.decode(Data);
  expect(data.name).toEqualName("/B/0");
  expect(data.contentType).toBe(3);
  expect(data.freshnessPeriod).toBe(260);
  expect(data.finalBlockId).not.toBeUndefined();
  expect(data.finalBlockId).toEqualComponent("1");
  expect(data.isFinalBlock).toBeFalsy();
  expect(data.content).toHaveLength(2);
});

test("ImplicitDigest", async () => {
  let data = new Data("/A");
  await expect(data.computeImplicitDigest()).rejects.toThrow(/unavailable/);
  expect(() => Data.getWire(data)).toThrow();

  const wire = Encoder.encode(data);
  const expectedDigest = createHash("sha256").update(wire).digest();
  expect(data.getImplicitDigest()).toBeUndefined();
  await expect(data.computeImplicitDigest()).resolves.toEqualUint8Array(expectedDigest);
  expect(data.getImplicitDigest()).toEqualUint8Array(expectedDigest);
  await expect(data.computeImplicitDigest()).resolves.toEqualUint8Array(expectedDigest);

  data = new Decoder(Data.getWire(data)).decode(Data);
  expect(data.getFullName()).toBeUndefined();
  const fullName = await data.computeFullName();
  expect(fullName).toEqualName(`/A/${ImplicitDigest.create(expectedDigest)}`);
  const fullName2 = data.getFullName();
  expect(fullName2).not.toBeUndefined();
  expect(fullName2).toEqualName(fullName);
});
