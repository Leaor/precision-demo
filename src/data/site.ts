export type FAQ = { q: string; a: string };

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  number: string;
  details: string[];
  considerations: string[];
  faq: FAQ[];
  image: string;
  imageAlt: string;
};

// Confirm service availability and final scope with the business before launch.
// Keep service copy here so offerings can be updated without changing layouts.
export const services: Service[] = [
  {
    slug: "interior-strip-outs",
    title: "Interior strip-outs",
    shortTitle: "Interior strip-outs",
    number: "01",
    summary:
      "A clean starting point for your next renovation. Kitchens, bathrooms and interiors, carefully stripped back.",
    description:
      "Prepare an interior for its next chapter with a clearly defined strip-out. From a single room to a broader renovation, the work starts with agreeing what comes out, what stays and how the surrounding property will be protected.",
    details: [
      "Kitchen and bathroom fixtures, cabinetry and finishes",
      "Flooring, wall finishes and suspended ceilings",
      "Non-structural interior partitions within the agreed scope",
      "Debris collection, removal and an agreed cleanup standard",
    ],
    considerations: [
      "Confirm electrical, plumbing and gas isolation before work starts.",
      "Identify items to retain, protect or salvage during the assessment.",
      "Older materials may require a hazardous-material assessment before removal.",
    ],
    faq: [
      {
        q: "Can I keep part of the kitchen or bathroom?",
        a: "Yes, the proposed scope can identify fixtures, cabinetry or finishes that should remain. Their condition, attachment and location need to be assessed before any preservation or salvage can be confirmed.",
      },
      {
        q: "Can the property remain occupied?",
        a: "That depends on access, utility isolation, dust control and the extent of the work. Discuss occupancy during the assessment so the work area and any necessary restrictions can be planned.",
      },
    ],
    image: "interior-demolition.webp",
    imageAlt:
      "Illustrative renovation interior with exposed framing and finishes removed",
  },
  {
    slug: "selective-demolition",
    title: "Selective demolition",
    shortTitle: "Selective demolition",
    number: "02",
    summary:
      "Remove what needs to go. Protect what needs to stay. Focused demolition for carefully planned changes.",
    description:
      "Selective demolition makes room for targeted changes within an existing building. A detailed assessment establishes the removal boundaries, protected areas and any engineering or utility coordination required before work begins.",
    details: [
      "Targeted removal of identified interior elements",
      "Openings and alterations within an approved project scope",
      "Protection planning for adjacent finishes and retained features",
      "Sequencing around other trades and building access",
    ],
    considerations: [
      "Confirm whether affected walls or elements are structural.",
      "Obtain engineering and permits where the proposed alteration requires them.",
      "Locate concealed services before removal begins.",
    ],
    faq: [
      {
        q: "Can you tell whether a wall is load-bearing?",
        a: "A visual inspection alone may not establish that. Building drawings and an assessment by a qualified structural professional may be needed before the removal scope can be confirmed.",
      },
      {
        q: "What should I send with my enquiry?",
        a: "Share the project address, photos, relevant drawings and a clear description of the elements you want removed and retained. Note access restrictions and the timing of other trades.",
      },
    ],
    image: "selective-demolition.webp",
    imageAlt:
      "Illustrative selective demolition scene with retained interior framing",
  },
  {
    slug: "residential-demolition",
    title: "Residential demolition",
    shortTitle: "Residential demolition",
    number: "03",
    summary:
      "Make room for a new plan. Demolition scopes for homes, additions and residential structures.",
    description:
      "Residential demolition calls for careful preparation, particularly on tight Toronto and GTA properties. Site access, neighbouring buildings, utilities, permits and waste removal all help determine the right approach for your project.",
    details: [
      "Assessment of the proposed residential removal scope",
      "Planning for additions, detached structures or larger removals",
      "Coordination of site access and removal logistics",
      "Site cleanup and handover requirements defined in the estimate",
    ],
    considerations: [
      "Demolition permits and municipal requirements vary by property and scope.",
      "Utility disconnections must be confirmed before demolition.",
      "Property lines, neighbouring structures and access constraints affect the plan.",
    ],
    faq: [
      {
        q: "Will I need a demolition permit?",
        a: "You may. Requirements depend on the municipality, building and extent of removal. Confirm the applicable requirements with the local building department before work is scheduled.",
      },
      {
        q: "Can you work on a narrow Toronto lot?",
        a: "Access width, overhead services, neighbouring buildings and loading space need to be reviewed. Include photos and access dimensions with your enquiry so the site constraints can be assessed.",
      },
    ],
    image: "exterior-demolition.webp",
    imageAlt:
      "Illustrative residential demolition site showing a structure prepared for removal",
  },
  {
    slug: "commercial-demolition",
    title: "Commercial demolition",
    shortTitle: "Commercial demolition",
    number: "04",
    summary:
      "Prepare your space for what comes next. Practical demolition planning for commercial properties.",
    description:
      "A commercial demolition scope needs to fit the building as well as the renovation. For offices, retail units and other commercial spaces, the assessment considers property rules, neighbouring occupants, service access and the next phase of construction.",
    details: [
      "Interior strip-outs for commercial renovation scopes",
      "Removal of specified partitions, fixtures and finishes",
      "Planning around building access and loading arrangements",
      "Coordination with property managers and the project team",
    ],
    considerations: [
      "Provide building rules, access hours and contractor requirements in advance.",
      "Agree dust, noise and separation measures for occupied neighbouring spaces.",
      "Clarify which trades are responsible for disconnections and reinstatement.",
    ],
    faq: [
      {
        q: "Can the work be phased?",
        a: "Phasing can be discussed during the assessment. The proposed sequence will depend on safe separation, access, utility isolation and the requirements of the wider project.",
      },
      {
        q: "What does a property manager need to provide?",
        a: "Useful information includes the building rules, permitted work hours, loading arrangements, elevator requirements and any required contractor documentation. Availability and requirements should be confirmed before scheduling.",
      },
    ],
    image: "interior-demolition.webp",
    imageAlt:
      "Illustrative commercial interior stripped back ahead of renovation",
  },
  {
    slug: "concrete-removal",
    title: "Concrete removal",
    shortTitle: "Concrete removal",
    number: "05",
    summary:
      "Clear the way for a better foundation. Planned removal of concrete surfaces and identified sections.",
    description:
      "Concrete removal begins with understanding the slab or structure, its surroundings and what lies beneath. Thickness, reinforcement, access and disposal requirements inform the approach and estimate.",
    details: [
      "Assessment of slabs, walkways, patios and concrete sections",
      "Defined removal boundaries and protection of adjacent surfaces",
      "Planning for breaking, handling and loading material",
      "Concrete debris removal within the agreed project scope",
    ],
    considerations: [
      "Locate underground or embedded utilities before any cutting or breaking.",
      "Structural concrete requires appropriate engineering review.",
      "Thickness, reinforcement and equipment access affect pricing and timing.",
    ],
    faq: [
      {
        q: "What affects the cost of concrete removal?",
        a: "Area, thickness, reinforcement, site access and disposal requirements all matter. Photos and approximate dimensions help with an initial review; an on-site assessment may be necessary for an accurate scope.",
      },
      {
        q: "Does the estimate include new concrete?",
        a: "Replacement work should not be assumed. The estimate needs to state the removal boundaries, debris handling and handover condition, along with any separately agreed work.",
      },
    ],
    image: "exterior-demolition.webp",
    imageAlt:
      "Illustrative demolition site with broken concrete awaiting removal",
  },
  {
    slug: "debris-removal",
    title: "Debris removal",
    shortTitle: "Debris removal",
    number: "06",
    summary:
      "Keep the next stage moving. Collection and removal of agreed demolition and renovation debris.",
    description:
      "A workable debris plan keeps access clear and gives the next trade a defined handover point. Material type, volume, loading access and disposal requirements are confirmed as part of the scope.",
    details: [
      "Collection of agreed demolition and renovation materials",
      "Loading and removal logistics planned for the property",
      "Separation of materials where required by the disposal facility",
      "Final debris collection and cleanup to the agreed standard",
    ],
    considerations: [
      "Describe the materials and approximate quantity when requesting an estimate.",
      "Hazardous or unidentified materials require separate assessment and handling.",
      "Bin placement, parking and loading restrictions may need municipal approval.",
    ],
    faq: [
      {
        q: "Can you remove debris from a project already underway?",
        a: "Include photos, material types, approximate quantities and access information in your enquiry. The material and removal arrangements need to be confirmed before collection can be scheduled.",
      },
      {
        q: "Can asbestos or other hazardous material go with general debris?",
        a: "No. Suspected hazardous material must be assessed and handled through the appropriate specialist process. Do not disturb or mix it with general construction debris.",
      },
    ],
    image: "selective-demolition.webp",
    imageAlt:
      "Illustrative renovation site with demolition material collected for removal",
  },
];

export const faqs: FAQ[] = [
  {
    q: "What information do you need for an estimate?",
    a: "Start with the project location, the type of demolition, the approximate size and your preferred timing. Photos, drawings, access details and a list of anything that needs to stay are also helpful. A site assessment may be needed before the scope and price can be confirmed.",
  },
  {
    q: "Do I need a permit before demolition starts?",
    a: "Requirements depend on your municipality, property and proposed work. Structural changes and building removal may require permits, drawings or engineering. Confirm the requirements with the local building department and agree who is responsible before work begins.",
  },
  {
    q: "How are surrounding areas protected?",
    a: "The protection plan should identify retained finishes, access routes and occupied areas. Appropriate separation, surface protection and dust-control measures can then be included in the scope. The exact measures depend on the building and the work involved.",
  },
  {
    q: "Is debris removal included?",
    a: "Debris removal and cleanup should be stated in your written scope. The estimate will need to define the materials being removed, disposal arrangements and the condition in which the site will be handed over. Hazardous materials require separate assessment.",
  },
  {
    q: "What happens if asbestos or another hazardous material is suspected?",
    a: "Work affecting the material should pause until it has been assessed appropriately. Testing and specialist removal may be necessary before demolition can continue. Let the project team know about any existing surveys or known materials when you enquire.",
  },
  {
    q: "Which areas do you cover?",
    a: "Enquiries are welcome for Toronto and the Greater Toronto Area, including Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Oakville and surrounding communities. Include your project address so availability and travel requirements can be confirmed.",
  },
];

export const serviceAreas = [
  "Toronto",
  "North York",
  "Etobicoke",
  "Scarborough",
  "Mississauga",
  "Brampton",
  "Vaughan",
  "Markham",
  "Richmond Hill",
  "Oakville",
  "Burlington",
  "Pickering",
];

export const processSteps = [
  {
    number: "01",
    title: "Start the conversation",
    description:
      "Tell us about your property, the work you have in mind and your preferred timing.",
  },
  {
    number: "02",
    title: "Assess the project",
    description:
      "Review the site, access, retained areas and any requirements that shape the work.",
  },
  {
    number: "03",
    title: "Define the scope",
    description:
      "Agree the removal boundaries, protection, cleanup and estimate before work begins.",
  },
  {
    number: "04",
    title: "Demolish. Clean up.",
    description:
      "Carry out the agreed work and prepare the space for its next stage.",
  },
];

export const company: {
  name: string;
  location: string;
  tagline: string;
  phone: string | null;
  email: string | null;
  address: string | null;
} = {
  name: "Precision Demolition",
  location: "Toronto & the GTA",
  tagline: "Demolition. Done precisely.",
  // Replace these placeholders only with verified business contact information.
  phone: null,
  email: null,
  address: null,
};

export type Project = {
  slug: string;
  title: string;
  location: string;
  service: string;
  description: string;
  image: string;
  imageAlt: string;
};

// Add only approved photographs of completed Precision Demolition projects.
// Illustrative photography must never be inserted into this gallery.
export const projectGallery: Project[] = [];
