import {fireEvent,render,screen,waitFor} from '@testing-library/react';
const mockReplace=jest.fn(),mockRefresh=jest.fn(),mockSession=jest.fn();
const mockRouter={replace:mockReplace,refresh:mockRefresh};
jest.mock('next/navigation',()=>({useRouter:()=>mockRouter}));
jest.mock('next-intl',()=>({useLocale:()=> 'it',useTranslations:()=> (key:string)=>key}));
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({auth:{getSession:()=>mockSession()}})}));
import Page from '../[locale]/(routes)/select-event/page';
beforeEach(()=>{jest.clearAllMocks();mockSession.mockResolvedValue({data:{session:{access_token:'test-token'}},error:null});global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({status:'SELECTION_REQUIRED',events:[{id:'a',name:'Matrimonio A',eventType:'wedding',date:null},{id:'b',name:'Matrimonio B',eventType:'wedding',date:null}]})});});
it('keeps two weddings unassigned until the user chooses an accessible button',async()=>{
 render(<Page/>);const choice=await screen.findByRole('button',{name:'Matrimonio B'});
 (fetch as jest.Mock).mockResolvedValueOnce({ok:true,json:async()=>({status:'RESOLVED',currentEvent:{eventId:'b',eventType:'wedding'},events:[]})});
 fireEvent.click(choice);
 await waitFor(()=>expect(mockReplace).toHaveBeenCalledWith('/it/dashboard'));
 expect(fetch).toHaveBeenCalledWith('/api/my/current-event',expect.objectContaining({method:'POST',body:JSON.stringify({eventId:'b'})}));
 expect(fetch).toHaveBeenCalledTimes(2);
});
it('shows a recoverable error when checking the session fails',async()=>{
 mockSession.mockRejectedValueOnce(new Error('offline'));render(<Page/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('loadError');
 expect(mockReplace).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'retry'}));
 expect(await screen.findByRole('button',{name:'Matrimonio A'})).toBeInTheDocument();
});
it('does not proceed to the dashboard if selecting an event fails',async()=>{
 render(<Page/>);await screen.findByRole('button',{name:'Matrimonio B'});
 (fetch as jest.Mock).mockResolvedValueOnce({ok:false});fireEvent.click(screen.getByRole('button',{name:'Matrimonio B'}));
 expect(await screen.findByRole('alert')).toBeInTheDocument();expect(mockReplace).not.toHaveBeenCalled();
});
