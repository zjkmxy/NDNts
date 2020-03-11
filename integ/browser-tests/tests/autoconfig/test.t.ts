import { getPageUri, pageInvoke } from "../../test-fixture/pptr";
import "./api";

beforeEach(() => page.goto(getPageUri(__dirname)));

test("connectToTestbed", async () => {
  const record = await pageInvoke<typeof window.testConnectToTestbed>(page, "testConnectToTestbed");
  expect(record.faces.length).toBeGreaterThan(0);
});
