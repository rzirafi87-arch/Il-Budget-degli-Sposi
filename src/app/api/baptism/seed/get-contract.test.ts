import { GET as getLegacySeed } from "./route";
import { GET as getEventSeed } from "./[eventId]/route";

describe("baptism seed HTTP method contract", () => {
  it.each([
    ["legacy", () => getLegacySeed({} as never)],
    ["event-scoped", () => getEventSeed()],
  ])("blocks write-through GET on %s endpoint", async (_name, invoke) => {
    const response = await invoke();

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({
      error: "METHOD_NOT_ALLOWED",
      allowed: ["POST"],
    });
  });
});
