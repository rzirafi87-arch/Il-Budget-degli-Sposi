import { GET } from "../api/my/expenses/route";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireFinancialAccess } from "@/lib/financialAuthorization";
import type { NextRequest } from "next/server";
jest.mock("@/lib/apiAuth",()=>({getBearer:()=>"test"}));
jest.mock("@/lib/financialAuthorization",()=>({requireFinancialAccess:jest.fn(),financialErrorResponse:jest.fn()}));
jest.mock("@/lib/supabaseServer",()=>({getServiceClient:jest.fn()}));

test("a deposit does not replace the full expense amount returned to Accounting",async()=>{
  const query={select:jest.fn().mockReturnThis(),eq:jest.fn().mockReturnThis(),order:jest.fn().mockResolvedValue({error:null,data:[{id:"expense",committed_amount:1000,paid_amount:200,status:"approved",subcategory:{name:"Foto",category:{name:"Fornitori"}}}]})};
  (getServiceClient as jest.Mock).mockReturnValue({from:()=>query});
  (requireFinancialAccess as jest.Mock).mockResolvedValue({currentEvent:{eventId:"event"}});
  const response=await GET({} as NextRequest);
  expect(await response.json()).toMatchObject({expenses:[{amount:1000,committed:1000,paid:200}]});
  expect(query.eq).toHaveBeenCalledWith("event_id","event");
});
