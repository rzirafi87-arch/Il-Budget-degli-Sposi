import {
  FinancialContractError,
  parsePaymentReminderCreate,
  parsePaymentReminderId,
  parsePaymentReminderUpdate,
  type PaymentReminderInsert,
  type PaymentReminderRow,
} from "@/lib/financialContracts";
import {
  financialErrorResponse,
  requireFinancialAccess,
  requireSameEventLinkedExpense,
} from "@/lib/financialAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function response(row: PaymentReminderRow) {
  return {
    id: row.id,
    expenseId: row.expense_id,
    amount: Number(row.amount),
    dueDate: row.due_date,
    reminderDate: row.reminder_date,
    notes: row.notes,
    isPaid: Boolean(row.is_paid),
    paidDate: row.paid_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contractError(error: unknown): NextResponse | null {
  return error instanceof FinancialContractError
    ? NextResponse.json({ error: error.code }, { status: 400 })
    : null;
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "read");
    const db = getServiceClient();
    const { data: expenses, error: expenseError } = await db
      .from("expenses")
      .select("id")
      .eq("event_id", currentEvent.eventId)
      .not("saved_supplier_id", "is", null);

    if (expenseError) {
      return NextResponse.json({ error: "EXPENSE_LOOKUP_FAILED" }, { status: 500 });
    }
    const expenseIds = (expenses ?? []).map((expense) => expense.id);
    if (expenseIds.length === 0) {
      return NextResponse.json({ reminders: [] });
    }

    const { data, error } = await db
      .from("payment_reminders")
      .select("*")
      .in("expense_id", expenseIds)
      .order("due_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "PAYMENT_REMINDERS_READ_FAILED" }, { status: 500 });
    }
    return NextResponse.json({
      reminders: ((data ?? []) as PaymentReminderRow[]).map(response),
    });
  } catch (error) {
    return financialErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "mutate");
    const reminder = parsePaymentReminderCreate(await req.json());
    const db = getServiceClient();
    await requireSameEventLinkedExpense(db, currentEvent.eventId, reminder.expenseId);

    const { data: existing, error: existingError } = await db
      .from("payment_reminders")
      .select("*")
      .eq("expense_id", reminder.expenseId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_LOOKUP_FAILED" }, { status: 500 });
    }
    if (existing) {
      const row = existing as PaymentReminderRow;
      const identical =
        Number(row.amount) === reminder.amount &&
        row.due_date === reminder.dueDate &&
        row.reminder_date === reminder.reminderDate &&
        row.notes === reminder.notes &&
        !row.is_paid &&
        !row.paid_date;
      if (identical) {
        return NextResponse.json({ reminder: response(row), idempotent: true });
      }
      return NextResponse.json({ error: "PAYMENT_REMINDER_EXISTS" }, { status: 409 });
    }

    const insert: PaymentReminderInsert = {
      expense_id: reminder.expenseId,
      amount: reminder.amount,
      due_date: reminder.dueDate,
      reminder_date: reminder.reminderDate,
      notes: reminder.notes,
      is_paid: false,
      paid_date: null,
      reminder_sent: false,
    };
    const { data, error } = await db
      .from("payment_reminders")
      .insert(insert)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_CREATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json(
      { reminder: response(data as PaymentReminderRow), idempotent: false },
      { status: 201 },
    );
  } catch (error) {
    return contractError(error) ?? financialErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "mutate");
    const reminder = parsePaymentReminderUpdate(await req.json());
    const db = getServiceClient();

    const { data: existing, error: existingError } = await db
      .from("payment_reminders")
      .select("id,expense_id")
      .eq("id", reminder.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_LOOKUP_FAILED" }, { status: 500 });
    }
    if (!existing || existing.expense_id !== reminder.expenseId) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_NOT_FOUND" }, { status: 404 });
    }
    await requireSameEventLinkedExpense(db, currentEvent.eventId, reminder.expenseId);

    const { data, error } = await db
      .from("payment_reminders")
      .update({
        amount: reminder.amount,
        due_date: reminder.dueDate,
        reminder_date: reminder.reminderDate,
        notes: reminder.notes,
        is_paid: reminder.isPaid,
        paid_date: reminder.paidDate,
      })
      .eq("id", reminder.id)
      .eq("expense_id", reminder.expenseId)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_UPDATE_FAILED" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ reminder: response(data as PaymentReminderRow) });
  } catch (error) {
    return contractError(error) ?? financialErrorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "mutate");
    const id = parsePaymentReminderId(req.nextUrl.searchParams.get("id"));
    const db = getServiceClient();

    const { data: existing, error: existingError } = await db
      .from("payment_reminders")
      .select("id,expense_id")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_LOOKUP_FAILED" }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_NOT_FOUND" }, { status: 404 });
    }
    await requireSameEventLinkedExpense(db, currentEvent.eventId, existing.expense_id);

    const { data, error } = await db
      .from("payment_reminders")
      .delete()
      .eq("id", id)
      .eq("expense_id", existing.expense_id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_DELETE_FAILED" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "PAYMENT_REMINDER_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    return contractError(error) ?? financialErrorResponse(error);
  }
}
