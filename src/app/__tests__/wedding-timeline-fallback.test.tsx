import { render, screen, waitFor } from "@testing-library/react";
import TimelinePage from "../[locale]/(routes)/timeline/page";
jest.mock("next-intl", () => { const t=(key:string)=>key; return {useLocale:()=>"it",useTranslations:()=>t}; });
jest.mock("@/lib/supabaseBrowser",()=>({getBrowserClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:"test"}}})}})}));
jest.mock("@/components/ExportPDFButton",()=>({__esModule:true,default:()=>null}));
jest.mock("@/components/ExportButton",()=>({__esModule:true,default:()=>null}));
function mockResponses(items:unknown[]) {
  localStorage.setItem("eventType","wedding");
  global.fetch=jest.fn(async (url)=>({ok:true,json:async()=>String(url)==="/api/my/timeline" ? {items}
    : String(url)==="/api/my/current-event" ? {currentEvent:{eventId:"wedding-a",eventType:"wedding"}}
    : String(url)==="/api/event/resolve" ? {event:{wedding_date:"2027-09-06"}}
    : String(url).includes("localized") ? {data:{timeline:[]}} : {suppliers:[]}})) as jest.Mock;
}
test("shows usable wedding tasks when no personal or localized checklist exists", async()=>{
  mockResponses([]);
  render(<TimelinePage/>);
  await waitFor(()=>expect(screen.getByText("planning")).toBeInTheDocument());
  expect(screen.getByText("finalChecks")).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalledWith("/api/my/timeline",expect.objectContaining({method:"POST"}));
});
test("keeps saved personal tasks instead of replacing them with templates",async()=>{
  mockResponses([{id:"task",title:"PERSONAL_TASK",days_before:30,completed:true}]);
  render(<TimelinePage/>);
  await waitFor(()=>expect(screen.getByText("PERSONAL_TASK")).toBeInTheDocument());
  expect(screen.queryByText("planning")).not.toBeInTheDocument();
});
