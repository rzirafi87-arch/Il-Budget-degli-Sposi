import fs from "node:fs";
import path from "node:path";

import {
  financialErrorResponse,
  requireSameEventLinkedExpense,
} from "@/lib/financialAuthorization";
import {
  FinancialContractError,
  parsePaymentReminderCreate,
  parsePaymentReminderId,
  parsePaymentReminderUpdate,
} from "@/lib/financialContracts";
import type { getServiceClient } from "@/lib/supabaseServer";

const EXPENSE_ID = "50000000-0000-4000-8000-000000000061";
const REMINDER_ID = "50000000-0000-4000-8000-000000000062";

describe("Branch 50 milestone 3 payment reminder contracts", () => {
  it("accepts an unpaid expense-bound reminder", () => {
    expect(parsePaymentReminderCreate({
      expenseId: EXPENSE_ID,
      amount: 750.5,
      dueDate: "2026-10-31",
      reminderDate: "2026-10-24",
      notes: " Saldo fotografo ",
      eventId: "request-controlled-event",
      reminderSent: true,
    })).toEqual({
      expenseId: EXPENSE_ID,
      amount: 750.5,
      dueDate: "2026-10-31",
      reminderDate: "2026-10-24",
      notes: "Saldo fotografo",
    });
  });

  it("accepts coherent paid and unpaid update states", () => {
    expect(parsePaymentReminderUpdate({
      id: REMINDER_ID,
      expenseId: EXPENSE_ID,
      amount: 750.5,
      dueDate: "2026-10-31",
      reminderDate: null,
      notes: null,
      isPaid: true,
      paidDate: "2026-10-20",
    })).toMatchObject({ id: REMINDER_ID, isPaid: true, paidDate: "2026-10-20" });

    expect(parsePaymentReminderUpdate({
      id: REMINDER_ID,
      expenseId: EXPENSE_ID,
      amount: 750.5,
      dueDate: "2026-10-31",
      reminderDate: null,
      notes: null,
      isPaid: false,
      paidDate: null,
    })).toMatchObject({ isPaid: false, paidDate: null });
  });

  it.each([
    () => parsePaymentReminderCreate({
      expenseId: EXPENSE_ID, amount: 0, dueDate: "2026-10-31", reminderDate: null, notes: null,
    }),
    () => parsePaymentReminderCreate({
      expenseId: EXPENSE_ID, amount: 10, dueDate: "2026-02-30", reminderDate: null, notes: null,
    }),
    () => parsePaymentReminderCreate({
      expenseId: EXPENSE_ID, amount: 10, dueDate: "2026-10-20", reminderDate: "2026-10-21", notes: null,
    }),
    () => parsePaymentReminderUpdate({
      id: REMINDER_ID, expenseId: EXPENSE_ID, amount: 10, dueDate: "2026-10-20",
      reminderDate: null, notes: null, isPaid: true, paidDate: null,
    }),
    () => parsePaymentReminderUpdate({
      id: REMINDER_ID, expenseId: EXPENSE_ID, amount: 10, dueDate: "2026-10-20",
      reminderDate: null, notes: null, isPaid: false, paidDate: "2026-10-19",
    }),
    () => parsePaymentReminderId("not-a-uuid"),
  ])("rejects invalid amount, date, status or identifier states", (parse) => {
    expect(parse).toThrow(FinancialContractError);
  });
});

describe("Branch 50 milestone 3 linked-expense guard", () => {
  function client(result: {
    data: { id: string; saved_supplier_id: string | null } | null;
    error: { code: string } | null;
  }) {
    const maybeSingle = jest.fn().mockResolvedValue(result);
    const secondEq = jest.fn(() => ({ maybeSingle }));
    const firstEq = jest.fn(() => ({ eq: secondEq }));
    const select = jest.fn(() => ({ eq: firstEq }));
    const from = jest.fn(() => ({ select }));
    return {
      db: { from } as unknown as ReturnType<typeof getServiceClient>,
      from,
      firstEq,
      secondEq,
    };
  }

  it("accepts only a supplier-linked expense in the current event", async () => {
    const mock = client({
      data: { id: EXPENSE_ID, saved_supplier_id: "saved-61" },
      error: null,
    });
    await expect(
      requireSameEventLinkedExpense(mock.db, "event-61", EXPENSE_ID),
    ).resolves.toEqual({ id: EXPENSE_ID, saved_supplier_id: "saved-61" });
    expect(mock.from).toHaveBeenCalledWith("expenses");
    expect(mock.firstEq).toHaveBeenCalledWith("id", EXPENSE_ID);
    expect(mock.secondEq).toHaveBeenCalledWith("event_id", "event-61");
  });

  it.each([
    [null, null, 404, "EXPENSE_NOT_FOUND"],
    [{ id: EXPENSE_ID, saved_supplier_id: null }, null, 409, "EXPENSE_SUPPLIER_LINK_REQUIRED"],
    [null, { code: "XX000" }, 500, "EXPENSE_LOOKUP_FAILED"],
  ] as const)("returns a stable failure before reminder mutation", async (data, error, status, code) => {
    const mock = client({ data, error });
    let caught: unknown;
    try {
      await requireSameEventLinkedExpense(mock.db, "event-61", EXPENSE_ID);
    } catch (cause) {
      caught = cause;
    }
    const response = financialErrorResponse(caught);
    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ error: code });
  });
});

describe("Branch 50 milestone 3 route boundaries", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/payment-reminders/route.ts"),
    "utf8",
  );

  it("authorizes every read and mutation through the current event", () => {
    expect(source).toContain('requireFinancialAccess(req, "read")');
    expect(source.match(/requireFinancialAccess\(req, "mutate"\)/g)).toHaveLength(3);
    expect(source).not.toMatch(/body\.event_id|input\.event_id/);
  });

  it("lists reminders only through linked expenses from the current event", () => {
    const get = source.slice(source.indexOf("export async function GET"), source.indexOf("export async function POST"));
    expect(get).toContain('.from("expenses")');
    expect(get).toContain('.eq("event_id", currentEvent.eventId)');
    expect(get).toContain('.not("saved_supplier_id", "is", null)');
    expect(get).toContain('.in("expense_id", expenseIds)');
  });

  it("guards the linked expense before every reminder write", () => {
    for (const method of ["POST", "PATCH", "DELETE"]) {
      const start = source.indexOf(`export async function ${method}`);
      const next = ["POST", "PATCH", "DELETE"]
        .map((candidate) => source.indexOf(`export async function ${candidate}`, start + 1))
        .filter((index) => index > start)
        .sort((a, b) => a - b)[0] ?? source.length;
      const handler = source.slice(start, next);
      expect(handler).toContain("requireSameEventLinkedExpense");
      const write = method === "POST" ? ".insert(" : method === "PATCH" ? ".update(" : ".delete()";
      expect(handler.indexOf("requireSameEventLinkedExpense"))
        .toBeLessThan(handler.indexOf(write));
    }
  });

  it("implements deterministic duplicate behavior without notification delivery", () => {
    expect(source).toContain("idempotent: true");
    expect(source).toContain('"PAYMENT_REMINDER_EXISTS"');
    expect(source).toContain("reminder_sent: false");
    expect(source).not.toMatch(/sendNotification|sendEmail|timeline/i);
  });

  it("never changes the reminder expense binding during update", () => {
    const patch = source.slice(source.indexOf("export async function PATCH"), source.indexOf("export async function DELETE"));
    expect(patch).not.toContain("expense_id:");
    expect(patch).toContain('.eq("expense_id", reminder.expenseId)');
  });
});
