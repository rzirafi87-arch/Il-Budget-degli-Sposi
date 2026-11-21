import {fireEvent,render,screen,waitFor} from '@testing-library/react';
const mockSignUp=jest.fn();
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({auth:{getSession:async()=>({data:{session:null}}),signUp:(...args:unknown[])=>mockSignUp(...args)}})}));
jest.mock('next-intl',()=>({useLocale:()=> 'it',useTranslations:()=> (key:string)=>key}));
import AuthPage from '../[locale]/(routes)/auth/page';
beforeEach(()=>{window.history.replaceState({},'', '/it/auth?next=%2Fit%2Fbattesimo');mockSignUp.mockReset();});
afterEach(()=>window.history.replaceState({},'', '/'));
function register(){render(<AuthPage/>);fireEvent.click(screen.getByRole('button',{name:'register'}));fireEvent.change(screen.getByLabelText('email'),{target:{value:'qa@example.invalid'}});fireEvent.change(screen.getByLabelText('label'),{target:{value:'example-password'}});fireEvent.submit(screen.getByRole('button',{name:'register'}).closest('form')!);}
it('registers only the account, without wedding setup or event creation',async()=>{mockSignUp.mockResolvedValue({data:{session:null},error:null});register();expect(screen.queryByRole('combobox')).not.toBeInTheDocument();expect(screen.queryByLabelText('partnerEmail')).not.toBeInTheDocument();await waitFor(()=>expect(mockSignUp).toHaveBeenCalledWith({email:'qa@example.invalid',password:'example-password',options:{emailRedirectTo:window.location.origin+'/it/battesimo'}}));expect(await screen.findByText('confirmationTitle')).toBeInTheDocument();});
it('preserves registration fields and re-enables retry on failure',async()=>{mockSignUp.mockResolvedValue({error:new Error('network error')});register();expect(await screen.findByRole('alert')).toBeInTheDocument();expect(screen.getByLabelText('email')).toHaveValue('qa@example.invalid');expect(screen.getByLabelText('label')).toHaveValue('example-password');await waitFor(()=>expect(screen.getByRole('button',{name:'register'})).toBeEnabled());});
