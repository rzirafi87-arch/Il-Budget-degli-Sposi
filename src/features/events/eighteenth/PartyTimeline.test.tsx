import {render,screen} from '@testing-library/react';
jest.mock('next-intl',()=>({useLocale:()=> 'it'}));
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'fixture'}}})}})}));
jest.mock('./PartyDetails',()=>({__esModule:true,default:({eventId,initialView}:{eventId:string;initialView:string})=><div>{eventId}:{initialView}</div>}));
import PartyTimeline from './PartyTimeline';
it('uses the same event metadata checklist instead of rendering shared templates',async()=>{
 global.fetch=jest.fn().mockResolvedValueOnce({ok:true,json:async()=>({currentEvent:{eventId:'party-a',eventType:'eighteenth'}})}).mockResolvedValueOnce({ok:true,json:async()=>({event:{id:'party-a',name:'Festa QA',event_date:'2030-05-18'}})});
 render(<PartyTimeline><p>WEDDING_TASKS</p></PartyTimeline>);expect(await screen.findByText('party-a:checklist')).toBeInTheDocument();expect(screen.queryByText('WEDDING_TASKS')).not.toBeInTheDocument();
});
it('does not show fallback tasks when current event resolution is ambiguous',async()=>{
 global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({currentEvent:null,status:'SELECTION_REQUIRED'})});render(<PartyTimeline><p>WEDDING_TASKS</p></PartyTimeline>);expect(await screen.findByRole('alert')).toBeInTheDocument();expect(screen.queryByText('WEDDING_TASKS')).not.toBeInTheDocument();
});
it('rejects an event change between resolution and summary reads',async()=>{
 global.fetch=jest.fn().mockResolvedValueOnce({ok:true,json:async()=>({currentEvent:{eventId:'party-a',eventType:'eighteenth'}})}).mockResolvedValueOnce({ok:true,json:async()=>({event:{id:'party-b',name:'Other',event_date:'2030-05-18'}})});render(<PartyTimeline><p>WEDDING_TASKS</p></PartyTimeline>);expect(await screen.findByRole('alert')).toBeInTheDocument();expect(screen.queryByText('party-b:checklist')).not.toBeInTheDocument();
});
