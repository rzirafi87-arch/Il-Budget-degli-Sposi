import {render,screen,fireEvent} from '@testing-library/react';
const mockRpc=jest.fn(),mockSaved=jest.fn(),mockDirty=jest.fn();
jest.mock('@/lib/supabaseBrowser',()=>({getBrowserClient:()=>({rpc:mockRpc})}));
import PartyPayment from './PartyPayment';
beforeEach(()=>{mockRpc.mockReset();mockSaved.mockReset();Object.defineProperty(global.crypto,'randomUUID',{configurable:true,value:()=> '95250000-0000-4000-8000-000000000205'});});
it('retries an uncertain payment with the same identity and preserves its draft',async()=>{
 mockRpc.mockResolvedValueOnce({error:{message:'network'}}).mockResolvedValueOnce({error:null});
 render(<PartyPayment eventId="party" expenseId="expense" remaining={100} blocked={false} onDirty={mockDirty} onSaved={mockSaved}/>);
 fireEvent.click(screen.getByRole('button',{name:'Registra acconto o saldo'}));fireEvent.change(screen.getByLabelText('Importo pagamento (€)'),{target:{value:'20'}});fireEvent.change(screen.getByLabelText('Data pagamento'),{target:{value:'2030-05-01'}});fireEvent.click(screen.getByRole('button',{name:'Conferma pagamento'}));expect(await screen.findByRole('alert')).toHaveTextContent('non confermato');expect(screen.getByLabelText('Importo pagamento (€)')).toHaveValue(20);
 fireEvent.click(screen.getByRole('button',{name:'Conferma pagamento'}));await screen.findByRole('button',{name:'Registra acconto o saldo'});expect(mockSaved).toHaveBeenCalledTimes(1);expect(mockRpc).toHaveBeenCalledTimes(2);expect(mockRpc.mock.calls[0]).toEqual(mockRpc.mock.calls[1]);
});
it('rejects amounts above the outstanding balance before writing',()=>{
 render(<PartyPayment eventId="party" expenseId="expense" remaining={100} blocked={false} onDirty={mockDirty} onSaved={mockSaved}/>);fireEvent.click(screen.getByRole('button',{name:'Registra acconto o saldo'}));fireEvent.change(screen.getByLabelText('Importo pagamento (€)'),{target:{value:'101'}});fireEvent.change(screen.getByLabelText('Data pagamento'),{target:{value:'2030-05-01'}});fireEvent.click(screen.getByRole('button',{name:'Conferma pagamento'}));expect(screen.getByRole('alert')).toHaveTextContent('entro il saldo');expect(mockRpc).not.toHaveBeenCalled();
});
