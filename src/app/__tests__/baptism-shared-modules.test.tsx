import { render,screen,waitFor } from '@testing-library/react';
const mockReplace=jest.fn();const mockRouter={replace:mockReplace};
let mockPath='/it/documenti';
jest.mock('next/navigation',()=>({useRouter:()=>mockRouter,usePathname:()=>mockPath}));
jest.mock('next-intl',()=>({useLocale:()=> 'it',useTranslations:()=> (key:string)=>key}));
jest.mock('@/lib/onboardingClient',()=>({getOnboardingStatus:async()=>({kind:'complete',event:{id:'baptism-a',event_type:'baptism'}})}));
import Guard from '@/components/EventModuleGuard';
beforeEach(()=>{mockReplace.mockReset();mockPath='/it/documenti';});
it.each(['/it/documenti','/it/fornitori','/it/location','/it/chiese'])('allows the reviewed baptism module %s',async(path)=>{
 mockPath=path;render(<Guard><p>Selected baptism module</p></Guard>);
 expect(await screen.findByText('Selected baptism module')).toBeInTheDocument();expect(mockReplace).not.toHaveBeenCalled();
});
it('routes the baptism overview back to the selected family planner',async()=>{
 mockPath='/it/dashboard';render(<Guard><p>Wedding dashboard</p></Guard>);
 await waitFor(()=>expect(mockReplace).toHaveBeenCalledWith('/it/battesimo?eventId=baptism-a'));
 expect(screen.queryByText('Wedding dashboard')).not.toBeInTheDocument();
});
it('keeps the shared wedding budget inaccessible for baptism',async()=>{
 mockPath='/it/budget';render(<Guard><p>Wedding budget</p></Guard>);
 await waitFor(()=>expect(mockReplace).toHaveBeenCalledWith('/it/coming-soon?legacy=1'));
 expect(screen.queryByText('Wedding budget')).not.toBeInTheDocument();
});
