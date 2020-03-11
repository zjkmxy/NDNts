import { Name } from "@ndn/packet";
import "@ndn/packet/test-fixture/expect";

import { ByteOffset, Keyword, Segment, SequenceNum, Timestamp, Version } from "..";

test("Keyword", () => {
  const name = new Name().append(Keyword, "hello");
  expect(name.at(0)).toEqualComponent("32=hello");
  expect(name.at(0).is(Keyword)).toBeTruthy();
  expect(name.at(0).as(Keyword)).toBe("hello");
});

test("Segment", () => {
  const name = new Name().append(Segment, 0x0101);
  expect(name.at(0)).toEqualComponent("33=%01%01");
  expect(name.at(0).is(Segment)).toBeTruthy();
  expect(name.at(0).as(Segment)).toBe(0x0101);
});

test("ByteOffset", () => {
  const name = new Name().append(ByteOffset, 0x0102);
  expect(name.at(0)).toEqualComponent("34=%01%02");
  expect(name.at(0).is(ByteOffset)).toBeTruthy();
  expect(name.at(0).as(ByteOffset)).toBe(0x0102);
});

test("Version", () => {
  const name = new Name().append(Version, 0x0103);
  expect(name.at(0)).toEqualComponent("35=%01%03");
  expect(name.at(0).is(Version)).toBeTruthy();
  expect(name.at(0).as(Version)).toBe(0x0103);
});

test("Timestamp", () => {
  const name = new Name().append(Timestamp, new Date(540167400000))
    .append(Timestamp, 1570239360127447);

  expect(name.at(0)).toEqualComponent("36=%00%01%eb%47%85%ff%0a%00");
  expect(name.at(0).is(Timestamp)).toBeTruthy();
  expect(name.at(0).as(Timestamp)).toEqual(540167400000000);
  expect(name.at(0).as(Timestamp.Date)).toEqual(new Date(540167400000));
  expect(name.at(0).as(Timestamp.DateInexact)).toEqual(new Date(540167400000));

  expect(name.at(1)).toEqualComponent("36=%00%05%94%1f%d7%45%d1%d7");
  expect(name.at(1).is(Timestamp)).toBeTruthy();
  expect(name.at(1).as(Timestamp)).toEqual(1570239360127447);
  expect(() => name.at(1).as(Timestamp.Date)).toThrow(/milliseconds/);
  expect(name.at(1).as(Timestamp.DateInexact)).toEqual(new Date(1570239360127));
});

test("SequenceNum", () => {
  const name = new Name().append(SequenceNum, 0x0105);
  expect(name.at(0)).toEqualComponent("37=%01%05");
  expect(name.at(0).is(SequenceNum)).toBeTruthy();
  expect(name.at(0).as(SequenceNum)).toBe(0x0105);
});
