jest.mock('@/features/events/eighteenth/PartyDetails',()=>({__esModule:true,default:()=>null}));
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
jest.mock('next-intl',()=>({useLocale:()=> 'it',useTranslations:()=> (key:string)=>key}));
import PartyDashboard from '@/components/dashboard/PartyDashboard';
const payload={event:{id:'party-a',name:'Sofia',event_date:'2027-05-01',total_budget:1500,currency:'EUR'},entries:[]};
beforeEach(()=>{global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>payload});});
it('loads event and costs with a single event-scoped request',async()=>{
 render(<PartyDashboard token="test"/>);await screen.findByRole('heading',{name:'Sofia'});
 expect(fetch).toHaveBeenCalledTimes(1);expect(fetch).toHaveBeenCalledWith('/api/my/eighteenth-dashboard',expect.anything());
});
it('preserves the draft amount when the current event has changed',async()=>{
 render(<PartyDashboard token="test"/>);await screen.findByRole('heading',{name:'Sofia'});
 (fetch as jest.Mock).mockResolvedValueOnce({ok:false,status:409});
 fireEvent.change(screen.getByLabelText('amount'),{target:{value:'120.50'}});
 fireEvent.submit(screen.getByRole('button',{name:'expense'}).closest('form')!);
 expect(await screen.findByRole('alert')).toHaveTextContent('error');expect(screen.getByLabelText('amount')).toHaveValue(120.5);
 expect(fetch).toHaveBeenLastCalledWith('/api/my/expenses',expect.objectContaining({headers:expect.objectContaining({'X-Expected-Event-Id':'party-a'})}));
});
it('blocks a second submission while the first payment is pending',async()=>{
 render(<PartyDashboard token="test"/>);await screen.findByRole('heading',{name:'Sofia'});
 let finish!:(value:unknown)=>void;(fetch as jest.Mock).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 fireEvent.change(screen.getByLabelText('amount'),{target:{value:'80'}});
 const form=screen.getByRole('button',{name:'expense'}).closest('form')!;
 fireEvent.submit(form);fireEvent.submit(form);expect(fetch).toHaveBeenCalledTimes(2);
 finish({ok:false});await waitFor(()=>expect(screen.getByRole('button',{name:'expense'})).toBeEnabled());
});
