import {NextRequest,NextResponse} from 'next/server';
const mockAccess=jest.fn();const mockFrom=jest.fn();
jest.mock('@/lib/financialAuthorization',()=>({requireFinancialAccess:(...args:unknown[])=>mockAccess(...args),financialErrorResponse:()=>({json:async()=>({error:"FAILED"}),status:500})}));
jest.mock('@/lib/supabaseServer',()=>({getServiceClient:()=>({from:mockFrom})}));
import {GET} from '../api/my/eighteenth-dashboard/route';
import {POST} from '../api/my/expenses/route';
beforeEach(()=>{mockAccess.mockResolvedValue({currentEvent:{eventId:'party-a',eventType:'eighteenth'}});mockFrom.mockReset();});
it('reads the summary and expenses through one resolved event identity',async()=>{
 const header={select:jest.fn().mockReturnThis(),eq:jest.fn().mockReturnThis(),single:async()=>({data:{id:'party-a',name:'Sofia'},error:null})};
 const costs={select:jest.fn().mockReturnThis(),eq:jest.fn().mockResolvedValue({data:[{id:'cost',committed_amount:'120',paid_amount:'30',status:'approved',subcategory:{category:{name:'cake'}}}],error:null})};
 mockFrom.mockImplementation(name=>name==='events'?header:costs);
 const response=await GET(new NextRequest('http://localhost/api/my/eighteenth-dashboard'));
 expect(response.status).toBe(200);expect(header.eq).toHaveBeenCalledWith('id','party-a');expect(costs.eq).toHaveBeenCalledWith('event_id','party-a');
 expect((await response.json()).entries).toEqual([{id:'cost',category:'cake',committed:120,paid:30,status:'approved'}]);
});
it('rejects a wedding before reading any party data',async()=>{
 mockAccess.mockResolvedValue({currentEvent:{eventId:'wedding-a',eventType:'wedding'}});
 expect((await GET(new NextRequest('http://localhost/api/my/eighteenth-dashboard'))).status).toBe(409);expect(mockFrom).not.toHaveBeenCalled();
});
it('rejects an expense when another tab has selected a different event',async()=>{
 const response=await POST(({headers:{get:(key:string)=>key.toLowerCase()==='x-expected-event-id'?'party-b':null}} as unknown as NextRequest));
 expect(response.status).toBe(409);expect(await response.json()).toEqual({error:'EVENT_CHANGED'});expect(mockFrom).not.toHaveBeenCalled();
});
