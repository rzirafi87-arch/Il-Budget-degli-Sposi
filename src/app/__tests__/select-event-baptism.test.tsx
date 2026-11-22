import {render,screen,fireEvent,waitFor} from '@testing-library/react';
const mockReplace=jest.fn(),mockRefresh=jest.fn();
const mockRouter={replace:mockReplace,refresh:mockRefresh};
jest.mock('next/navigation',()=>({useRouter:()=>mockRouter}));
jest.mock('next-intl',()=>({useLocale:()=> 'it',useTranslations:()=> (key:string)=>key}));
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'test'}}})}})}));
import SelectEventPage from '../[locale]/(routes)/select-event/page';
const wedding={id:'wedding-a',eventType:'wedding',name:'Matrimonio',date:null};
const baptism={id:'baptism-b',eventType:'baptism',name:'Battesimo',date:null};
const payload={status:'RESOLVED',currentEvent:{eventId:wedding.id,eventType:'wedding'},events:[wedding,baptism]};
const mockFetch=jest.fn();
beforeEach(()=>{window.history.replaceState({},'', '/it/select-event?change=1');mockReplace.mockReset();mockRefresh.mockReset();mockFetch.mockReset();global.fetch=mockFetch;mockFetch.mockResolvedValue({ok:true,json:async()=>payload});});
it('shows event choices even when a wedding is already selected',async()=>{
 render(<SelectEventPage/>);expect(await screen.findByRole('listitem',{name:'Battesimo'})).toBeInTheDocument();expect(mockReplace).not.toHaveBeenCalled();
});
it('routes to the baptism returned by the authorized selection endpoint',async()=>{
 render(<SelectEventPage/>);const choice=await screen.findByRole('listitem',{name:'Battesimo'});
 mockFetch.mockResolvedValueOnce({ok:true,json:async()=>({...payload,currentEvent:{eventId:baptism.id,eventType:'baptism'}})});
 fireEvent.click(choice);await waitFor(()=>expect(mockReplace).toHaveBeenCalledWith('/it/battesimo?eventId=baptism-b'));
 expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toEqual({eventId:'baptism-b'});
});
it('stays on the chooser if the server rejects selection',async()=>{
 render(<SelectEventPage/>);const choice=await screen.findByRole('listitem',{name:'Battesimo'});
 mockFetch.mockResolvedValueOnce({ok:false});fireEvent.click(choice);
 expect(await screen.findByRole('alert')).toBeInTheDocument();expect(mockReplace).not.toHaveBeenCalled();
});
