import { fetchMyTables } from "../fetchMyTables";
import { getBrowserClient } from "../supabaseBrowser";

jest.mock("../supabaseBrowser", () => ({ getBrowserClient: jest.fn() }));

const getSession = jest.fn();
const fetchMock = jest.fn();

describe("fetchMyTables", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getBrowserClient).mockReturnValue({ auth: { getSession } } as never);
    global.fetch = fetchMock;
  });

  it("reads the current session on each call, including after logout", async () => {
    getSession.mockResolvedValueOnce({ data: { session: { access_token: "current-token" } }, error: null })
      .mockResolvedValueOnce({ data: { session: null }, error: null });
    const authenticated = { status: 200 };
    const anonymous = { status: 401 };
    fetchMock.mockResolvedValueOnce(authenticated).mockResolvedValueOnce(anonymous);
    await expect(fetchMyTables()).resolves.toBe(authenticated);
    await expect(fetchMyTables()).resolves.toBe(anonymous);
    expect(fetchMock.mock.calls).toEqual([
      ["/api/my/tables", { headers: { Authorization: "Bearer current-token" }, cache: "no-store" }],
      ["/api/my/tables", { headers: {}, cache: "no-store" }],
    ]);
  });

  it("does not send a request when session retrieval fails", async () => {
    const error = new Error("session unavailable");
    getSession.mockResolvedValue({ data: { session: null }, error });
    await expect(fetchMyTables()).rejects.toBe(error);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
