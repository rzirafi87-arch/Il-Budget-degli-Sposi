// Minimal gerarchia UK: Nazione -> Regione -> Contea (parziale per demo/inizio)
export type GBHierarchy = {
  [nation: string]: {
    regions: {
      [region: string]: string[]; // counties
    };
  };
};

export const GB_HIERARCHY: GBHierarchy = {
  England: {
    regions: {
      "North West": ["Cheshire", "Cumbria", "Greater Manchester", "Lancashire", "Merseyside"],
      "North East": ["County Durham", "Northumberland", "Tyne and Wear"],
      "Yorkshire and the Humber": ["East Riding of Yorkshire", "North Yorkshire", "South Yorkshire", "West Yorkshire"],
      "West Midlands": ["Herefordshire", "Shropshire", "Staffordshire", "Warwickshire", "West Midlands", "Worcestershire"],
      "East Midlands": ["Derbyshire", "Leicestershire", "Lincolnshire", "Northamptonshire", "Nottinghamshire", "Rutland"],
      "East of England": ["Bedfordshire", "Cambridgeshire", "Essex", "Hertfordshire", "Norfolk", "Suffolk"],
      "South East": ["Berkshire", "Buckinghamshire", "East Sussex", "Hampshire", "Isle of Wight", "Kent", "Oxfordshire", "Surrey", "West Sussex"],
      "South West": ["Bristol", "Cornwall", "Devon", "Dorset", "Gloucestershire", "Somerset", "Wiltshire"],
      "London": ["Greater London"],
    },
  },
  Scotland: {
    regions: {
      "Highlands and Islands": ["Highland", "Na h-Eileanan Siar", "Orkney Islands", "Shetland Islands"],
      "North East Scotland": ["Aberdeen City", "Aberdeenshire", "Moray"],
      "South of Scotland": ["Dumfries and Galloway", "Scottish Borders"],
      "Central Belt": ["Edinburgh", "Glasgow", "Falkirk", "North Lanarkshire", "South Lanarkshire", "West Lothian"],
    },
  },
  Wales: {
    regions: {
      "North Wales": ["Anglesey", "Conwy", "Denbighshire", "Flintshire", "Gwynedd", "Wrexham"],
      "Mid Wales": ["Ceredigion", "Powys"],
      "South West Wales": ["Carmarthenshire", "Pembrokeshire", "Swansea"],
      "South East Wales": ["Cardiff", "Newport", "Rhondda Cynon Taf", "Vale of Glamorgan"],
    },
  },
  "Northern Ireland": {
    regions: {
      "Northern Ireland": ["Antrim and Newtownabbey", "Belfast", "Derry and Strabane", "Lisburn and Castlereagh", "Newry, Mourne and Down"],
    },
  },
};
